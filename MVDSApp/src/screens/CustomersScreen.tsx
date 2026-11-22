import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert,
  Keyboard,
  Dimensions,
  Platform,
  ScrollView
} from 'react-native';
import { colors } from '../theme/colors';
import { api } from '../api/client';
import { Customer } from '../types';

interface CustomersScreenProps {
  onNavigateToProfile?: () => void;
}

export const CustomersScreen: React.FC<CustomersScreenProps> = ({ onNavigateToProfile }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Add Customer Modal
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
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

  // Selected customer details modal
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await api.getCustomers(searchQuery);
      if (res.success) {
        setCustomers(res.customers);
      }
    } catch (err) {
      console.error('Fetch customers error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCustomers();
  };

  const handleOpenCustomer = async (cust: Customer) => {
    setLoadingDetails(true);
    try {
      const res = await api.getCustomerById(cust.id);
      if (res.success) {
        setSelectedCustomer(res.customer);
      }
    } catch (err) {
      console.error('Fetch customer details error:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCreateCustomer = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Validation Error', 'Customer Name and Phone Number are required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createCustomer({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        address: address.trim() || undefined
      });

      if (res.success) {
        setShowModal(false);
        setName('');
        setPhone('');
        setEmail('');
        setAddress('');
        fetchCustomers();
        Alert.alert('Success', 'Customer registered successfully in database.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add customer.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>MVDS DIRECTORY</Text>
          <Text style={styles.headerTitle}>Customers</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowModal(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.addBtnText}>+ New Customer</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <View style={styles.searchLabelBadge}>
            <Text style={styles.searchLabelBadgeText}>SEARCH</Text>
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, phone, city..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Customer List */}
      {loading && !refreshing ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.custCard}
              onPress={() => handleOpenCustomer(item)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.headerInfo}>
                  <Text style={styles.custName}>{item.name}</Text>
                  <Text style={styles.custPhone}>Phone: {item.phone}</Text>
                </View>
                <View style={styles.statsBadge}>
                  <Text style={styles.badgeNumber}>{item.total_vehicles_purchased || 0}</Text>
                  <Text style={styles.badgeLabel}>Vehicles</Text>
                </View>
              </View>

              {item.address && (
                <Text style={styles.addressText} numberOfLines={1}>
                  Address: {item.address}
                </Text>
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={styles.emptyBadge}>
                <Text style={styles.emptyBadgeText}>CLIENTS</Text>
              </View>
              <Text style={styles.emptyTitle}>No Customers Found</Text>
              <Text style={styles.emptySub}>Add customers when recording vehicle purchases, sales, or exchange deals.</Text>
            </View>
          }
        />
      )}

      {/* Customer Detail Modal */}
      <Modal
        visible={!!selectedCustomer}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedCustomer(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '80%' }]}>
            <View style={styles.detailHeader}>
              <View>
                <Text style={styles.detailName}>{selectedCustomer?.name}</Text>
                <Text style={styles.detailPhone}>Phone: {selectedCustomer?.phone}</Text>
                {selectedCustomer?.email && <Text style={styles.detailEmail}>Email: {selectedCustomer?.email}</Text>}
              </View>
              <TouchableOpacity onPress={() => setSelectedCustomer(null)}>
                <Text style={styles.closeBtn}>Close</Text>
              </TouchableOpacity>
            </View>

            {selectedCustomer?.address && (
              <View style={styles.detailAddressBox}>
                <Text style={styles.detailAddress}>Address: {selectedCustomer.address}</Text>
              </View>
            )}

            <Text style={styles.historyTitle}>PURCHASED VEHICLES ({selectedCustomer?.vehicles?.length || 0})</Text>
            {selectedCustomer?.vehicles && selectedCustomer.vehicles.length > 0 ? (
              selectedCustomer.vehicles.map((v) => (
                <View key={v.id} style={styles.vehicleRow}>
                  <Text style={styles.vName}>{v.vehicle_name}</Text>
                  <Text style={styles.vReg}>{v.registration_number}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noHistory}>No vehicles purchased under this profile yet.</Text>
            )}

            <TouchableOpacity
              style={styles.closeModalBtn}
              onPress={() => setSelectedCustomer(null)}
            >
              <Text style={styles.closeModalBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Customer Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => {
          if (keyboardHeight > 0) {
            Keyboard.dismiss();
          } else {
            setShowModal(false);
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
                setShowModal(false);
              }
            }}
          />

          <View style={[
            styles.modalContent,
            {
              maxHeight: keyboardHeight > 0
                ? Dimensions.get('window').height - keyboardHeight - 40
                : Dimensions.get('window').height * 0.82
            }
          ]}>
            {/* Modal Handle Pill */}
            <View style={styles.modalHandleWrap}>
              <View style={styles.modalHandle} />
            </View>

            {/* Modal Header */}
            <View style={styles.modalHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Register New Customer</Text>
                <Text style={styles.modalSub}>Saved directly into MySQL database customers table.</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => {
                  Keyboard.dismiss();
                  setShowModal(false);
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
              <Text style={styles.inputLabel}>FULL NAME *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Rajesh Kumar"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.inputLabel}>PHONE NUMBER *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="10-digit mobile number"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />

              <Text style={styles.inputLabel}>EMAIL ADDRESS (OPTIONAL)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. rajesh@gmail.com"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              <Text style={styles.inputLabel}>RESIDENTIAL / SHOP ADDRESS</Text>
              <TextInput
                style={[styles.modalInput, { height: 60 }]}
                multiline
                placeholder="Street, Area, City, Pin"
                placeholderTextColor={colors.textMuted}
                value={address}
                onChangeText={setAddress}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => {
                    Keyboard.dismiss();
                    setShowModal(false);
                  }}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleCreateCustomer}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color={colors.textInverse} size="small" />
                  ) : (
                    <Text style={styles.submitBtnText}>Add Customer →</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8
  },
  headerSub: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.4
  },
  addBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8
  },
  addBtnText: {
    color: colors.textInverse,
    fontSize: 12,
    fontWeight: '800'
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    height: 44
  },
  searchLabelBadge: {
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8
  },
  searchLabelBadgeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600'
  },
  listContent: {
    padding: 16,
    paddingBottom: 40
  },
  loaderWrap: {
    paddingVertical: 50,
    alignItems: 'center'
  },
  custCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryMuted,
    borderWidth: 1,
    borderColor: colors.borderActive,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  avatarText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '900'
  },
  headerInfo: {
    flex: 1
  },
  custName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800'
  },
  custPhone: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    fontFamily: 'Courier'
  },
  statsBadge: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight
  },
  badgeNumber: {
    color: colors.available,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: 'Courier'
  },
  badgeLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '700'
  },
  addressText: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 10
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 60
  },
  emptyBadge: {
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderActive,
    marginBottom: 12
  },
  emptyBadgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800'
  },
  emptySub: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4
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
  inputLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 8,
    marginBottom: 6
  },
  modalInput: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: colors.textPrimary,
    fontSize: 13,
    marginBottom: 6
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  cancelBtnText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700'
  },
  submitBtn: {
    flex: 1.5,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  submitBtnText: {
    color: colors.textInverse,
    fontSize: 13,
    fontWeight: '900'
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  detailName: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '900'
  },
  detailPhone: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
    fontFamily: 'Courier'
  },
  detailEmail: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2
  },
  closeBtn: {
    color: colors.textMuted,
    fontSize: 18,
    padding: 4
  },
  detailAddressBox: {
    backgroundColor: colors.surfaceElevated,
    padding: 10,
    borderRadius: 8,
    marginBottom: 16
  },
  detailAddress: {
    color: colors.textSecondary,
    fontSize: 12
  },
  historyTitle: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 8
  },
  vehicleRow: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  vName: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700'
  },
  vReg: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'Courier'
  },
  noHistory: {
    color: colors.textMuted,
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 16
  },
  closeModalBtn: {
    backgroundColor: colors.surfaceElevated,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16
  },
  closeModalBtnText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700'
  }
});
