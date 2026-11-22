import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { Vehicle } from '../types';
import { Base64Image } from './Base64Image';
import { StatusBadge } from './StatusBadge';

interface VehicleCardProps {
  vehicle: Vehicle;
  onPress: (vehicle: Vehicle) => void;
  onMarkSold?: (vehicle: Vehicle) => void;
  isCustomerMode?: boolean;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  onPress,
  onMarkSold,
  isCustomerMode = false
}) => {
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

  const isSold = vehicle.status === 'SOLD';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(vehicle)}
      activeOpacity={0.9}
    >
      {/* 16:9 Showcase Header */}
      <View style={styles.imageWrapper}>
        <Base64Image
          base64String={vehicle.image_base64}
          style={styles.heroImage}
          vehicleType={vehicle.vehicle_type}
          brand={vehicle.brand}
        />

        {/* Top Floating Badges */}
        <View style={styles.topBar}>
          <View style={styles.idChip}>
            <Text style={styles.idText}>#{vehicle.id}</Text>
            <View style={styles.chipDivider} />
            <Text style={styles.typeText}>{vehicle.vehicle_type?.toUpperCase() || 'VEHICLE'}</Text>
          </View>
          <StatusBadge status={vehicle.status} size="sm" />
        </View>

        {/* Bottom Floating Registration Strip */}
        <View style={styles.imageBottomStrip}>
          <View style={styles.regPlate}>
            <View style={styles.regIndBand}>
              <Text style={styles.regIndText}>IND</Text>
            </View>
            <Text style={styles.regNumber}>{vehicle.registration_number || 'TN -- -- ----'}</Text>
          </View>
          {vehicle.model_year && (
            <View style={styles.yearBadge}>
              <Text style={styles.yearText}>{vehicle.model_year} Model</Text>
            </View>
          )}
        </View>
      </View>

      {/* Card Details Body */}
      <View style={styles.body}>
        {/* Title */}
        <Text style={styles.title} numberOfLines={1}>
          {vehicle.vehicle_name}
        </Text>
        <Text style={styles.brandSubtitle}>
          {vehicle.brand ? `${vehicle.brand} • ` : ''}{vehicle.vehicle_type}
        </Text>

        {/* Customer View vs Dealer View Pricing Matrix */}
        {isCustomerMode ? (
          <View style={styles.customerPriceBox}>
            <View style={styles.customerPriceRow}>
              <View>
                <Text style={styles.customerPriceLabel}>SHOWROOM ASKING QUOTE</Text>
                <Text style={styles.customerPriceValue}>
                  {formatCurrency(vehicle.selling_price || vehicle.bought_price)}
                </Text>
                <Text style={styles.customerPriceSub}>Best Price • Exchange & Financing Support Available</Text>
              </View>
              <View style={styles.customerVerifiedBadge}>
                <Text style={styles.customerVerifiedText}>Certified</Text>
              </View>
            </View>

            <View style={styles.customerDealershipRow}>
              <Text style={styles.customerDealershipText}>
                Mani Auto Counsalting • Prop. M.V. Deena • Krishnagiri Main Road
              </Text>
            </View>

            {/* Customer Direct Action Buttons */}
            <View style={styles.customerBtnRow}>
              <TouchableOpacity
                style={styles.customerCallBtn}
                onPress={() => onPress(vehicle)}
                activeOpacity={0.8}
              >
                <Text style={styles.customerCallText}>Call: 7868882003</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.customerDetailBtn}
                onPress={() => onPress(vehicle)}
                activeOpacity={0.8}
              >
                <Text style={styles.customerDetailText}>View Details →</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            {/* Financial & Margin Pricing Matrix */}
            <View style={styles.priceMatrix}>
              <View style={styles.priceCol}>
                <Text style={styles.priceColLabel}>BOUGHT PRICE</Text>
                <Text style={styles.boughtValue}>{formatCurrency(vehicle.bought_price)}</Text>
              </View>

              <View style={styles.matrixDivider} />

              <View style={styles.priceCol}>
                <Text style={styles.priceColLabel}>PRICE CODE</Text>
                <View style={styles.codePill}>
                  <Text style={styles.codeText}>{vehicle.price_code || '---'}</Text>
                </View>
              </View>

              <View style={styles.matrixDivider} />

              <View style={styles.priceCol}>
                <Text style={styles.priceColLabel}>{isSold ? 'SOLD PRICE' : 'SELLING QUOTE'}</Text>
                <Text style={[styles.sellValue, isSold && styles.soldValue]}>
                  {formatCurrency(vehicle.selling_price)}
                </Text>
              </View>
            </View>

            {/* Acquisition & Sale Timestamps */}
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Acquired On</Text>
                <Text style={styles.metaValue}>{formatDateTime(vehicle.date_bought)}</Text>
              </View>
              {isSold ? (
                <View style={[styles.metaItem, styles.metaItemRight]}>
                  <Text style={[styles.metaLabel, { color: colors.sold }]}>Delivered On</Text>
                  <Text style={[styles.metaValue, { color: colors.sold }]}>{formatDateTime(vehicle.date_sold)}</Text>
                </View>
              ) : (
                <View style={[styles.metaItem, styles.metaItemRight]}>
                  <Text style={styles.metaLabel}>Stock Status</Text>
                  <Text style={[styles.metaValue, { color: colors.available }]}>Ready For Delivery</Text>
                </View>
              )}
            </View>

            {/* Action Controls */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.inspectBtn}
                onPress={() => onPress(vehicle)}
                activeOpacity={0.8}
              >
                <Text style={styles.inspectBtnText}>Inspect Details →</Text>
              </TouchableOpacity>

              {!isSold && onMarkSold && (
                <TouchableOpacity
                  style={styles.markSoldBtn}
                  onPress={() => onMarkSold(vehicle)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.markSoldBtnText}>Mark Sold</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3
  },
  imageWrapper: {
    width: '100%',
    height: 180,
    backgroundColor: '#F8FAFC',
    position: 'relative'
  },
  heroImage: {
    width: '100%',
    height: 180
  },
  topBar: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  idChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border
  },
  idText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900'
  },
  chipDivider: {
    width: 1,
    height: 10,
    backgroundColor: colors.borderLight,
    marginHorizontal: 6
  },
  typeText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  imageBottomStrip: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  regPlate: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#94A3B8',
    paddingVertical: 2,
    paddingRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2
  },
  regIndBand: {
    backgroundColor: '#003399',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
    marginRight: 6
  },
  regIndText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900'
  },
  regNumber: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.6
  },
  yearBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border
  },
  yearText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700'
  },
  body: {
    padding: 16
  },
  title: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.3,
    marginBottom: 2
  },
  brandSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12
  },
  priceMatrix: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginBottom: 12
  },
  priceCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  matrixDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border
  },
  priceColLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
    marginBottom: 3
  },
  boughtValue: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '800'
  },
  codePill: {
    backgroundColor: colors.accentGreenBg,
    borderWidth: 1,
    borderColor: colors.accentGreenBorder,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6
  },
  codeText: {
    color: colors.accentGreen,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  sellValue: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '900'
  },
  soldValue: {
    color: colors.textMuted
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: 14
  },
  metaItem: {
    flex: 1
  },
  metaItemRight: {
    alignItems: 'flex-end'
  },
  metaLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2
  },
  metaValue: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700'
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10
  },
  inspectBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary
  },
  inspectBtnText: {
    color: colors.primary,
    fontSize: 12.5,
    fontWeight: '800'
  },
  markSoldBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  markSoldBtnText: {
    color: colors.textInverse,
    fontSize: 12.5,
    fontWeight: '900'
  },
  customerPriceBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(37,99,235,0.15)',
    marginTop: 4
  },
  customerPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  customerPriceLabel: {
    fontSize: 9.5,
    fontWeight: '900',
    color: colors.textMuted,
    letterSpacing: 0.5
  },
  customerPriceValue: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.primary,
    marginTop: 2
  },
  customerPriceSub: {
    fontSize: 10,
    color: colors.available,
    fontWeight: '700',
    marginTop: 2
  },
  customerVerifiedBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(5,150,105,0.2)'
  },
  customerVerifiedText: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.available
  },
  customerDealershipRow: {
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: 10
  },
  customerDealershipText: {
    fontSize: 10,
    color: colors.textSubtle
  },
  customerBtnRow: {
    flexDirection: 'row',
    gap: 8
  },
  customerCallBtn: {
    flex: 1.2,
    backgroundColor: colors.available,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  customerCallText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900'
  },
  customerDetailBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary
  },
  customerDetailText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800'
  }
});
