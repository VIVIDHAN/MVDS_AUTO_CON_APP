import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  Keyboard,
  Dimensions,
  Platform
} from 'react-native';
import { colors } from '../theme/colors';
import { api } from '../api/client';
import { Vehicle, Customer } from '../types';
import { Base64Image } from '../components/Base64Image';
import { StatusBadge } from '../components/StatusBadge';

interface VehicleDetailScreenProps {
  vehicleId: number;
  onBack: () => void;
  onEdit: (vehicle: Vehicle) => void;
  onVehicleUpdated: () => void;
}

export const VehicleDetailScreen: React.FC<VehicleDetailScreenProps> = ({
  vehicleId,
  onBack,
  onEdit,
  onVehicleUpdated
}) => {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Mark as sold modal state
  const [showSoldModal, setShowSoldModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [finalSellPrice, setFinalSellPrice] = useState('');
  const [sellingNotes, setSellingNotes] = useState('');
  const [submittingSold, setSubmittingSold] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const fetchDetail = async () => {
    try {
      const res = await api.getVehicleById(vehicleId);
      if (res.success) {
        setVehicle(res.vehicle);
        setFinalSellPrice(String(res.vehicle.selling_price || res.vehicle.bought_price));
      }
    } catch (err) {
      console.error('Fetch detail error:', err);
      Alert.alert('Error', 'Failed to load vehicle details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomersList = async () => {
    try {
      const res = await api.getCustomers();
      if (res.success) {
        setCustomers(res.customers);
        if (res.customers.length > 0) {
          setSelectedCustomerId(res.customers[0].id);
        }
      }
    } catch (err) {
      console.error('Fetch customers error:', err);
    }
  };

  useEffect(() => {
    fetchDetail();
    fetchCustomersList();
  }, [vehicleId]);

  const formatCurrency = (val?: number | string | null) => {
    if (val === null || val === undefined || isNaN(Number(val))) return '₹0';
    return `₹ ${Number(val).toLocaleString('en-IN')}`;
  };

  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateStr;
    }
  };

  const handleMarkSoldSubmit = async () => {
    if (!finalSellPrice) {
      Alert.alert('Validation', 'Please enter the final selling price.');
      return;
    }

    setSubmittingSold(true);
    try {
      const res = await api.markVehicleSold(vehicleId, {
        customer_id: selectedCustomerId,
        selling_price: parseFloat(finalSellPrice),
        date_sold: new Date().toISOString(),
        notes: sellingNotes
      });

      if (res.success) {
        setShowSoldModal(false);
        fetchDetail();
        onVehicleUpdated();
        Alert.alert('Success', 'Vehicle marked as SOLD successfully!');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to record sale.');
    } finally {
      setSubmittingSold(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to remove this vehicle from inventory?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await api.deleteVehicle(vehicleId);
              if (res.success) {
                onVehicleUpdated();
                onBack();
              }
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete vehicle.');
            }
          }
        }
      ]
    );
  };

  if (loading || !vehicle) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Loading vehicle specs & image...</Text>
      </View>
    );
  }

  const isSold = vehicle.status === 'SOLD';
  const boughtVal = Number(vehicle.bought_price) || 0;
  const sellVal = Number(vehicle.selling_price) || 0;
  const marginVal = sellVal - boughtVal;
  const marginPct = boughtVal > 0 ? ((marginVal / boughtVal) * 100).toFixed(1) : '0';

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Vehicle Details</Text>
        <TouchableOpacity style={styles.editBtn} onPress={() => onEdit(vehicle)}>
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Full Image Banner (Base64) */}
        <View style={styles.imageWrap}>
          <Base64Image
            base64String={vehicle.image_base64}
            style={styles.heroImage}
            vehicleType={vehicle.vehicle_type}
            brand={vehicle.brand}
          />
          <View style={styles.imageBadgeOverlay}>
            <StatusBadge status={vehicle.status} size="md" />
          </View>
        </View>

        {/* Identity Section */}
        <View style={styles.identityCard}>
          <View style={styles.idRow}>
            <View style={styles.regBadge}>
              <Text style={styles.regText}>{vehicle.registration_number || 'UNREGISTERED'}</Text>
            </View>
            <Text style={styles.vehicleIdPill}>ID #{vehicle.id}</Text>
          </View>

          <Text style={styles.vehicleTitle}>{vehicle.vehicle_name}</Text>
          <Text style={styles.specsSub}>
            {vehicle.brand ? `${vehicle.brand} • ` : ''}{vehicle.model_year ? `${vehicle.model_year} Model • ` : ''}
            {vehicle.vehicle_type}
          </Text>
        </View>

        {/* Financial Breakdown (Bought Price vs Price Code vs Sell Price) */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardHeader}>FINANCIAL & PRICING AUDIT</Text>

          <View style={styles.priceGrid}>
            <View style={styles.priceBox}>
              <Text style={styles.priceSubLabel}>BOUGHT PRICE</Text>
              <Text style={styles.priceValMain}>{formatCurrency(vehicle.bought_price)}</Text>
              <Text style={styles.priceNote}>Acquisition cost</Text>
            </View>

            <View style={styles.priceBox}>
              <Text style={styles.priceSubLabel}>PRICE CODE TO SELL</Text>
              <View style={styles.codeWrap}>
                <Text style={styles.codeValText}>{vehicle.price_code || 'N/A'}</Text>
              </View>
              <Text style={styles.priceNote}>Customer quote code</Text>
            </View>
          </View>

          <View style={styles.marginRow}>
            <View>
              <Text style={styles.marginLabel}>{isSold ? 'FINAL SOLD AMOUNT' : 'TARGET SELLING QUOTE'}</Text>
              <Text style={[styles.marginValue, isSold && { color: colors.available }]}>
                {formatCurrency(vehicle.selling_price)}
              </Text>
            </View>
            <View style={styles.marginRight}>
              <Text style={styles.marginLabel}>PROJECTED MARGIN</Text>
              <Text style={[styles.marginProfit, marginVal < 0 && { color: colors.danger }]}>
                {marginVal >= 0 ? `+${formatCurrency(marginVal)}` : formatCurrency(marginVal)} ({marginPct}%)
              </Text>
            </View>
          </View>
        </View>

        {/* Timestamps & Log Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardHeader}>INVENTORY TIMELINE</Text>

          <View style={styles.timeLineItem}>
            <View style={[styles.timeDot, { backgroundColor: colors.primary }]} />
            <View style={styles.timeInfo}>
              <Text style={styles.timeItemTitle}>Date & Time Bought</Text>
              <Text style={styles.timeItemDate}>{formatDateTime(vehicle.date_bought)}</Text>
            </View>
          </View>

          {isSold && (
            <View style={[styles.timeLineItem, { marginTop: 12 }]}>
              <View style={[styles.timeDot, { backgroundColor: colors.available }]} />
              <View style={styles.timeInfo}>
                <Text style={[styles.timeItemTitle, { color: colors.sold }]}>Date & Time Sold</Text>
                <Text style={styles.timeItemDate}>{formatDateTime(vehicle.date_sold)}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Customer Information if Sold */}
        {isSold && vehicle.customer_name && (
          <View style={styles.sectionCard}>
            <Text style={styles.cardHeader}>BUYER DETAILS</Text>
            <View style={styles.buyerBox}>
              <Text style={styles.buyerNameText}>{vehicle.customer_name}</Text>
              {vehicle.customer_phone && (
                <Text style={styles.buyerPhoneText}>Phone: {vehicle.customer_phone}</Text>
              )}
              {vehicle.customer_address && (
                <Text style={styles.buyerAddressText}>Address: {vehicle.customer_address}</Text>
              )}
            </View>
          </View>
        )}

        {/* Notes */}
        {vehicle.notes && (
          <View style={styles.sectionCard}>
            <Text style={styles.cardHeader}>VEHICLE INSPECTION NOTES</Text>
            <Text style={styles.notesText}>{vehicle.notes}</Text>
          </View>
        )}

        {/* Dealership Documentation & Verification */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardHeader}>DEALERSHIP VERIFICATION & PAPERS</Text>
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Fleet Classification:</Text>
            <Text style={styles.specValue}>{vehicle.vehicle_type}</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Registration No:</Text>
            <Text style={styles.specValue}>{vehicle.registration_number || 'Applied / Fresh Paper'}</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Model Year:</Text>
            <Text style={styles.specValue}>{vehicle.model_year} Model</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Documentation:</Text>
            <Text style={[styles.specValue, { color: colors.available }]}>Verified RC & Single Owner</Text>
          </View>
        </View>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          {!isSold && (
            <TouchableOpacity
              style={styles.markSoldBtn}
              onPress={() => setShowSoldModal(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.markSoldBtnText}>Mark as Sold to Customer</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={handleDelete}
            activeOpacity={0.8}
          >
            <Text style={styles.deleteBtnText}>Delete Vehicle Record</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Mark As Sold Modal */}
      <Modal
        visible={showSoldModal}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => {
          if (keyboardHeight > 0) {
            Keyboard.dismiss();
          } else {
            setShowSoldModal(false);
          }
        }}
      >
        <View style={[styles.modalOverlay, keyboardHeight > 0 && { paddingBottom: keyboardHeight }]}>
          {/* Backdrop Dismiss */}
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => {
              if (keyboardHeight > 0) {
                Keyboard.dismiss();
              } else {
                setShowSoldModal(false);
              }
            }}
          />

          <View style={[
            styles.modalContent,
            {
              maxHeight: keyboardHeight > 0
                ? Dimensions.get('window').height - keyboardHeight - 40
                : Dimensions.get('window').height * 0.8
            }
          ]}>
            {/* Modal Handle Pill */}
            <View style={styles.modalHandleWrap}>
              <View style={styles.modalHandle} />
            </View>

            {/* Modal Header */}
            <View style={styles.modalHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Complete Sale Transaction</Text>
                <Text style={styles.modalSub}>
                  Select purchasing customer & record final price for {vehicle.vehicle_name}.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => {
                  Keyboard.dismiss();
                  setShowSoldModal(false);
                }}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Scrollable Form Body */}
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollBody}
            >
              {/* Customer Picker */}
              <Text style={styles.modalInputLabel}>SELECT PURCHASING CUSTOMER</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.customerScroll}>
                {customers.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[
                      styles.custChip,
                      selectedCustomerId === c.id && styles.custChipActive
                    ]}
                    onPress={() => setSelectedCustomerId(c.id)}
                  >
                    <Text style={[
                      styles.custChipText,
                      selectedCustomerId === c.id && styles.custChipTextActive
                    ]}>
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Final Selling Price */}
              <Text style={styles.modalInputLabel}>FINAL NEGOTIATED SELLING PRICE (₹)</Text>
              <TextInput
                style={styles.modalInput}
                keyboardType="numeric"
                placeholder="e.g. 142000"
                placeholderTextColor={colors.textMuted}
                value={finalSellPrice}
                onChangeText={setFinalSellPrice}
              />

              {/* Sale Notes */}
              <Text style={styles.modalInputLabel}>TRANSACTION NOTES</Text>
              <TextInput
                style={[styles.modalInput, { height: 60 }]}
                multiline
                placeholder="Payment mode, RC transfer details, etc."
                placeholderTextColor={colors.textMuted}
                value={sellingNotes}
                onChangeText={setSellingNotes}
              />

              {/* Buttons */}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => {
                    Keyboard.dismiss();
                    setShowSoldModal(false);
                  }}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSubmitBtn}
                  onPress={handleMarkSoldSubmit}
                  disabled={submittingSold}
                >
                  {submittingSold ? (
                    <ActivityIndicator color={colors.textInverse} size="small" />
                  ) : (
                    <Text style={styles.modalSubmitText}>Confirm Sale →</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 10
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  backBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8
  },
  backBtnText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700'
  },
  topBarTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800'
  },
  editBtn: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderLight
  },
  editBtnText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700'
  },
  scrollContent: {
    paddingBottom: 40
  },
  imageWrap: {
    height: 240,
    width: '100%',
    position: 'relative',
    backgroundColor: colors.surfaceSubtle
  },
  heroImage: {
    width: '100%',
    height: '100%',
    borderRadius: 0
  },
  imageBadgeOverlay: {
    position: 'absolute',
    top: 16,
    right: 16
  },
  identityCard: {
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  idRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  regBadge: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderLight
  },
  regText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    fontFamily: 'Courier'
  },
  vehicleIdPill: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'Courier'
  },
  vehicleTitle: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.4,
    lineHeight: 28
  },
  specsSub: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4
  },
  sectionCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border
  },
  cardHeader: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 12
  },
  priceGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14
  },
  priceBox: {
    flex: 1,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  priceSubLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4
  },
  priceValMain: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'Courier'
  },
  codeWrap: {
    backgroundColor: colors.primaryMuted,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.borderActive,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginTop: 2
  },
  codeValText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: 'Courier'
  },
  priceNote: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 4
  },
  marginRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  marginLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700'
  },
  marginValue: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'Courier',
    marginTop: 2
  },
  marginRight: {
    alignItems: 'flex-end'
  },
  marginProfit: {
    color: colors.available,
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'Courier',
    marginTop: 2
  },
  timeLineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  timeDot: {
    width: 10,
    height: 10,
    borderRadius: 5
  },
  timeInfo: {
    flex: 1
  },
  timeItemTitle: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700'
  },
  timeItemDate: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    fontFamily: 'Courier',
    marginTop: 2
  },
  buyerBox: {
    backgroundColor: colors.soldBg,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.soldBorder
  },
  buyerNameText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800'
  },
  buyerPhoneText: {
    color: colors.sold,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
    fontFamily: 'Courier'
  },
  buyerAddressText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4
  },
  notesText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight
  },
  specLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700'
  },
  specValue: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '800'
  },
  bottomActions: {
    padding: 16,
    gap: 12,
    marginTop: 8
  },
  markSoldBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center'
  },
  markSoldBtnText: {
    color: colors.textInverse,
    fontSize: 14,
    fontWeight: '900'
  },
  deleteBtn: {
    backgroundColor: colors.dangerBg,
    borderColor: colors.dangerBorder,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center'
  },
  deleteBtnText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '700'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderWidth: 1,
    borderColor: colors.border
  },
  modalHandleWrap: {
    alignItems: 'center',
    paddingVertical: 6,
    marginBottom: 4
  },
  modalHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '800'
  },
  modalSub: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2
  },
  modalCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginLeft: 10
  },
  modalCloseBtnText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '800'
  },
  modalScrollBody: {
    paddingTop: 10,
    paddingBottom: 24
  },
  modalInputLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 6
  },
  customerScroll: {
    flexDirection: 'row',
    marginBottom: 10
  },
  custChip: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.borderLight
  },
  custChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  custChipText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600'
  },
  custChipTextActive: {
    color: colors.textInverse,
    fontWeight: '800'
  },
  modalInput: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: colors.textPrimary,
    fontSize: 14
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  modalCancelText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700'
  },
  modalSubmitBtn: {
    flex: 1.5,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  modalSubmitText: {
    color: colors.textInverse,
    fontSize: 13,
    fontWeight: '900'
  }
});
