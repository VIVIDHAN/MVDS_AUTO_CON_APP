import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image
} from 'react-native';
import { colors } from '../theme/colors';
import { api } from '../api/client';
import { DashboardStats, Vehicle, User } from '../types';
import { StatCard } from '../components/StatCard';
import { Base64Image } from '../components/Base64Image';
import { StatusBadge } from '../components/StatusBadge';
import { AIGrowthInsights } from '../components/AIGrowthInsights';

interface DashboardScreenProps {
  user: User | null;
  onNavigateToVehicles: () => void;
  onNavigateToAddVehicle: () => void;
  onNavigateToCustomers: () => void;
  onNavigateToAi?: () => void;
  onNavigateToProfile?: () => void;
  onSelectVehicle: (vehicle: Vehicle) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  user,
  onNavigateToVehicles,
  onNavigateToAddVehicle,
  onNavigateToCustomers,
  onNavigateToAi,
  onNavigateToProfile,
  onSelectVehicle
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentVehicles, setRecentVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.getDashboardStats();
      if (res.success) {
        setStats(res.stats);
        setRecentVehicles(res.recentVehicles || []);
      }
    } catch (err) {
      console.error('Fetch dashboard error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const formatCurrency = (val?: number | string | null) => {
    if (!val || isNaN(Number(val))) return '₹0';
    return `₹ ${Number(val).toLocaleString('en-IN')}`;
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      {/* 1. PhonePe Iconic Top Header Bar */}
      <View style={styles.phonePeHeader}>
        {/* Left: User Avatar + Showroom / Location Details */}
        <TouchableOpacity
          style={styles.phonePeUserSection}
          onPress={onNavigateToProfile}
          activeOpacity={0.7}
        >
          <View style={styles.phonePeAvatarWrap}>
            <View style={styles.phonePeAvatar}>
              <Image
                source={require('../../assets/applogo.png')}
                style={styles.avatarLogoImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.phonePeFlagBadge}>
              <Text style={styles.phonePeFlagText}>IND</Text>
            </View>
          </View>
          <View style={styles.phonePeUserTextWrap}>
            <View style={styles.phonePeLocationRow}>
              <Text style={styles.phonePeShopName}>Mani Auto Counsalting</Text>
              <Text style={styles.phonePeDropdownArrow}>▾</Text>
            </View>
            <Text style={styles.phonePeSubLocation}>Prop. M.V. Deena • Krishnagiri Main Road</Text>
          </View>
        </TouchableOpacity>

        {/* Right: QR Code Scanner, Bell Notification, and Help / Sync */}
        <View style={styles.phonePeHeaderIcons}>
          {/* QR Scanner (PhonePe style viewfinder button) */}
          <TouchableOpacity
            style={styles.phonePeHeaderBtn}
            onPress={onNavigateToVehicles}
            activeOpacity={0.7}
          >
            <View style={styles.qrScannerIcon}>
              <View style={[styles.qrCorner, styles.qrTL]} />
              <View style={[styles.qrCorner, styles.qrTR]} />
              <View style={[styles.qrCorner, styles.qrBL]} />
              <View style={[styles.qrCorner, styles.qrBR]} />
              <View style={styles.qrLaserBeam} />
            </View>
          </TouchableOpacity>

          {/* Notification Bell with alert dot */}
          <TouchableOpacity
            style={styles.phonePeHeaderBtn}
            onPress={onNavigateToCustomers}
            activeOpacity={0.7}
          >
            <View style={styles.bellIconBox}>
              <View style={styles.bellTop} />
              <View style={styles.bellBody} />
              <View style={styles.bellBottom} />
            </View>
          </TouchableOpacity>

          {/* Refresh Circle Button */}
          <TouchableOpacity
            style={styles.phonePeHelpBtn}
            onPress={onRefresh}
            activeOpacity={0.7}
          >
            <Text style={styles.phonePeHelpText}>↻</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. PhonePe 4-Circle Quick Action Card */}
      <View style={styles.phonePeActionsCard}>
        <Text style={styles.phonePeCardTitle}>QUICK DEALERSHIP ACTIONS</Text>
        <View style={styles.phonePeFourColRow}>
          {/* Tile 1: Add Vehicle */}
          <TouchableOpacity
            style={styles.phonePeActionTile}
            onPress={onNavigateToAddVehicle}
            activeOpacity={0.7}
          >
            <View style={[styles.phonePeCircleIcon, { backgroundColor: colors.primary }]}>
              <View style={styles.tileCarIcon}>
                <View style={styles.tileCarRoof} />
                <View style={styles.tileCarBody} />
                <View style={styles.tileCarWheelL} />
                <View style={styles.tileCarWheelR} />
              </View>
            </View>
            <Text style={styles.phonePeActionLabel}>Add Vehicle</Text>
          </TouchableOpacity>

          {/* Tile 2: Add Client / Buyer */}
          <TouchableOpacity
            style={styles.phonePeActionTile}
            onPress={onNavigateToCustomers}
            activeOpacity={0.7}
          >
            <View style={[styles.phonePeCircleIcon, { backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0' }]}>
              <View style={styles.tileUserIcon}>
                <View style={styles.tileUserHead} />
                <View style={styles.tileUserBody} />
              </View>
            </View>
            <Text style={styles.phonePeActionLabel}>Add Client</Text>
          </TouchableOpacity>

          {/* Tile 3: AI Valuation & Margins */}
          <TouchableOpacity
            style={styles.phonePeActionTile}
            onPress={() => (onNavigateToAi ? onNavigateToAi() : setShowAiModal(true))}
            activeOpacity={0.7}
          >
            <View style={[styles.phonePeCircleIcon, { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: colors.primary }]}>
              <View style={styles.tileAiBox}>
                <Text style={styles.tileAiText}>AI</Text>
              </View>
            </View>
            <Text style={styles.phonePeActionLabel}>Valuation</Text>
          </TouchableOpacity>

          {/* Tile 4: Showroom (All 10 Categories) */}
          <TouchableOpacity
            style={styles.phonePeActionTile}
            onPress={onNavigateToVehicles}
            activeOpacity={0.7}
          >
            <View style={[styles.phonePeCircleIcon, { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: colors.borderLight }]}>
              <Text style={styles.tileAtoZText}>A-Z</Text>
            </View>
            <Text style={styles.phonePeActionLabel}>All Fleet</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Showroom Intelligence Hero Banner */}
      <TouchableOpacity
        style={styles.aiHeroBanner}
        onPress={() => (onNavigateToAi ? onNavigateToAi() : setShowAiModal(true))}
        activeOpacity={0.85}
      >
        <View style={styles.aiHeroTopRow}>
          <View style={styles.aiHeroBadge}>
            <Text style={styles.aiHeroBadgeText}>SHOWROOM INTELLIGENCE</Text>
          </View>
          <Text style={styles.aiHeroKeysText}>MV-Cipher & Margin</Text>
        </View>

        <Text style={styles.aiHeroTitle}>Vehicle Valuation & Deal Pricing</Text>
        <Text style={styles.aiHeroDesc}>
          Calculate customer quote codes (MV-Codes), projected dealer margins, and review Krishnagiri regional demand signals.
        </Text>

        <View style={styles.aiHeroFooter}>
          <Text style={styles.aiHeroCta}>Open Valuation Engine →</Text>
        </View>
      </TouchableOpacity>

      {/* Section Header: Dealership Pulse */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>DEALERSHIP PULSE</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.syncBtn}>
          <Text style={styles.syncText}>Sync</Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.loaderText}>Syncing metrics with MySQL...</Text>
        </View>
      ) : (
        <>
          {/* Key Metric Cards */}
          <View style={styles.statsGrid}>
            <View style={styles.halfCol}>
              <StatCard
                title="In Stock"
                value={`${stats?.vehicles?.available ?? 0} Units`}
                subtitle="Ready for sale"
                accentColor={colors.available}
                badgeText="AVAILABLE"
              />
            </View>
            <View style={styles.halfCol}>
              <StatCard
                title="Total Sold"
                value={`${stats?.vehicles?.sold ?? 0} Units`}
                subtitle="Delivered to buyers"
                accentColor={colors.sold}
                badgeText="SOLD"
              />
            </View>
          </View>

          {/* Capital & Margin Metrics */}
          <StatCard
            title="Current Stock Capital (Bought)"
            value={formatCurrency(stats?.financials?.current_investment)}
            subtitle="Total capital tied in current inventory"
            accentColor={colors.primary}
          />

          <View style={styles.statsGrid}>
            <View style={styles.halfCol}>
              <StatCard
                title="Expected Sell"
                value={formatCurrency(stats?.financials?.expected_inventory_value)}
                subtitle="Quoted inventory"
                accentColor={colors.available}
              />
            </View>
            <View style={styles.halfCol}>
              <StatCard
                title="Projected Margin"
                value={formatCurrency(
                  Math.max(0, Number(stats?.financials?.expected_inventory_value ?? 0) - Number(stats?.financials?.current_investment ?? 0))
                )}
                subtitle="Estimated showroom profit"
                accentColor={colors.available}
                badgeText="PROFIT"
              />
            </View>
          </View>

          {/* Dealership Expansion & Margin Strategy */}
          <View style={styles.aiGrowthCard}>
            <View style={styles.aiGrowthCardTop}>
              <Text style={styles.aiPillText}>SHOWROOM EXPANSION FORECAST</Text>
              <Text style={styles.aiScorePillText}>10 Fleet Types A to Z</Text>
            </View>

            <Text style={styles.aiGrowthCardTitle}>
              Turnover & Profit Target
            </Text>
            <Text style={styles.aiGrowthCardDesc}>
              Krishnagiri regional demand across Cars, JCBs, Tractors & Heavy Tippers projects up to ₹15.20 Cr annualized showroom turnover with 20-25% target deal margins.
            </Text>

            <View style={styles.aiGrowthMetricRow}>
              <View style={styles.aiMetricCol}>
                <Text style={styles.aiMetricLabel}>Stock Invested</Text>
                <Text style={styles.aiMetricVal}>{formatCurrency(stats?.financials?.current_investment ?? 21520000)}</Text>
              </View>
              <View style={styles.aiMetricCol}>
                <Text style={styles.aiMetricLabel}>Target Sales</Text>
                <Text style={[styles.aiMetricVal, { color: colors.available }]}>{formatCurrency(stats?.financials?.expected_inventory_value ?? 25819000)}</Text>
              </View>
              <View style={styles.aiMetricCol}>
                <Text style={styles.aiMetricLabel}>Est. Margin</Text>
                <Text style={[styles.aiMetricVal, { color: colors.primary }]}>
                  {formatCurrency(Math.max(0, Number(stats?.financials?.expected_inventory_value ?? 25819000) - Number(stats?.financials?.current_investment ?? 21520000)))}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.aiGrowthCardBtn}
              onPress={() => (onNavigateToAi ? onNavigateToAi() : setShowAiModal(true))}
              activeOpacity={0.8}
            >
              <Text style={styles.aiGrowthCardBtnText}>Open AI Strategic Advisor & Simulator →</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Showroom Arrivals Section */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>RECENT SHOWROOM ARRIVALS</Text>
        <TouchableOpacity onPress={onNavigateToVehicles}>
          <Text style={styles.viewAllLink}>
            View All ({stats?.vehicles?.total ?? recentVehicles.length}) →
          </Text>
        </TouchableOpacity>
      </View>

      {recentVehicles.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No vehicles in database yet.</Text>
        </View>
      ) : (
        <View style={styles.recentList}>
          {recentVehicles.map((vehicle) => (
            <TouchableOpacity
              key={vehicle.id}
              style={styles.recentItemCard}
              onPress={() => onSelectVehicle(vehicle)}
              activeOpacity={0.85}
            >
              {/* Vehicle Thumbnail */}
              <View style={styles.thumbWrapper}>
                <Base64Image
                  base64String={vehicle.image_base64}
                  style={styles.thumbImage}
                  vehicleType={vehicle.vehicle_type}
                  brand={vehicle.brand}
                  compact
                />
              </View>

              {/* Vehicle Info */}
              <View style={styles.recentDetails}>
                <View style={styles.recentHeader}>
                  <Text style={styles.recentReg}>
                    {vehicle.registration_number || 'UNREGISTERED'}
                  </Text>
                  <StatusBadge status={vehicle.status} size="sm" />
                </View>

                <Text style={styles.recentName} numberOfLines={1}>
                  {vehicle.vehicle_name}
                </Text>

                <View style={styles.recentPrices}>
                  <Text style={styles.recentBought}>
                    Bought: <Text style={styles.boldPrice}>{formatCurrency(vehicle.bought_price)}</Text>
                  </Text>
                  <View style={styles.codePill}>
                    <Text style={styles.codeText}>{vehicle.price_code || '---'}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* AI Growth Intelligence & Free 10 Keys Modal */}
      <AIGrowthInsights
        visible={showAiModal}
        onClose={() => setShowAiModal(false)}
        stockCapital={stats?.financials?.current_investment ?? 10445000}
        expectedSales={stats?.financials?.expected_inventory_value ?? 12625000}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: 16,
    paddingBottom: 35
  },
  // PhonePe Iconic Header Styles
  phonePeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingTop: 4
  },
  phonePeUserSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  phonePeAvatarWrap: {
    position: 'relative',
    marginRight: 10
  },
  phonePeAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 2
  },
  avatarLogoImage: {
    width: '100%',
    height: '100%'
  },
  phonePeFlagBadge: {
    position: 'absolute',
    bottom: -2,
    right: -4,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: colors.border
  },
  phonePeFlagText: {
    color: colors.primary,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.3
  },
  phonePeUserTextWrap: {
    justifyContent: 'center'
  },
  phonePeLocationRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  phonePeShopName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3
  },
  phonePeDropdownArrow: {
    color: colors.primary,
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '900'
  },
  phonePeSubLocation: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1
  },
  phonePeHeaderIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  phonePeHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2
  },
  phonePeHelpBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryMuted,
    borderWidth: 1,
    borderColor: colors.borderActive,
    alignItems: 'center',
    justifyContent: 'center'
  },
  phonePeHelpText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '900'
  },

  // QR Scanner Icon
  qrScannerIcon: {
    width: 16,
    height: 16,
    position: 'relative'
  },
  qrCorner: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderColor: colors.textPrimary
  },
  qrTL: {
    top: 0,
    left: 0,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5
  },
  qrTR: {
    top: 0,
    right: 0,
    borderTopWidth: 1.5,
    borderRightWidth: 1.5
  },
  qrBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 1.5,
    borderLeftWidth: 1.5
  },
  qrBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5
  },
  qrLaserBeam: {
    position: 'absolute',
    top: 7,
    left: 1,
    right: 1,
    height: 1.5,
    backgroundColor: colors.primary,
    borderRadius: 1
  },

  // Notification Bell
  bellIconBox: {
    width: 16,
    height: 16,
    position: 'relative',
    alignItems: 'center'
  },
  bellTop: {
    width: 4,
    height: 3,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: colors.textPrimary,
    position: 'absolute',
    top: 0
  },
  bellBody: {
    width: 12,
    height: 9,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.textPrimary,
    position: 'absolute',
    top: 2
  },
  bellBottom: {
    width: 14,
    height: 1.5,
    borderRadius: 1,
    backgroundColor: colors.textPrimary,
    position: 'absolute',
    bottom: 3
  },
  bellRedDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.available,
    position: 'absolute',
    top: 0,
    right: 0
  },

  // PhonePe 4-Circle Quick Action Card
  phonePeActionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2
  },
  phonePeCardTitle: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 12
  },
  phonePeFourColRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  phonePeActionTile: {
    flex: 1,
    alignItems: 'center'
  },
  phonePeCircleIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2
  },
  phonePeActionLabel: {
    color: colors.textPrimary,
    fontSize: 10.5,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 13
  },

  // Quick Action Tile Icons
  tileCarIcon: {
    width: 20,
    height: 12,
    position: 'relative',
    alignItems: 'center'
  },
  tileCarRoof: {
    width: 10,
    height: 5,
    borderTopLeftRadius: 2.5,
    borderTopRightRadius: 2.5,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    position: 'absolute',
    top: 0
  },
  tileCarBody: {
    width: 18,
    height: 5.5,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    top: 4
  },
  tileCarWheelL: {
    width: 3.5,
    height: 3.5,
    borderRadius: 1.75,
    backgroundColor: colors.primary,
    position: 'absolute',
    bottom: -0.5,
    left: 2.5
  },
  tileCarWheelR: {
    width: 3.5,
    height: 3.5,
    borderRadius: 1.75,
    backgroundColor: colors.primary,
    position: 'absolute',
    bottom: -0.5,
    right: 2.5
  },
  tilePlusBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.available,
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF'
  },
  tilePlusText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    lineHeight: 11
  },
  tileUserIcon: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  tileUserHead: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: colors.available
  },
  tileUserBody: {
    width: 16,
    height: 7,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: colors.available,
    marginTop: 2
  },
  tileRupeeText: {
    color: colors.available,
    fontSize: 20,
    fontWeight: '900'
  },

  // AI Intelligence Hero Banner
  aiHeroBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  aiHeroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  aiHeroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  aiHeroDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: 6
  },
  aiHeroBadgeText: {
    color: colors.primary,
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  aiHeroKeysText: {
    color: colors.available,
    fontSize: 10.5,
    fontWeight: '800'
  },
  aiHeroTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.textPrimary,
    marginBottom: 3
  },
  aiHeroDesc: {
    fontSize: 11.5,
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: 10
  },
  aiHeroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight
  },
  aiHeroCta: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.primary
  },
  aiHeroModel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600'
  },

  // PhonePe UPI Lite / Live Database Strip
  phonePeUpiStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.accentGreenBg,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.accentGreenBorder
  },
  phonePeUpiLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  phonePeUpiDbText: {
    color: colors.accentGreen,
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 6
  },
  phonePeUpiRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  phonePeUpiBalanceLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700'
  },
  phonePeUpiBalanceVal: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
    fontFamily: 'Courier'
  },
  phonePeUpiArrow: {
    color: colors.accentGreen,
    fontSize: 12,
    fontWeight: '900'
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accentGreen
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 10
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8
  },
  syncBtn: {
    paddingVertical: 2,
    paddingHorizontal: 6
  },
  syncText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800'
  },
  viewAllLink: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800'
  },
  loaderWrap: {
    paddingVertical: 40,
    alignItems: 'center'
  },
  loaderText: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 8
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10
  },
  halfCol: {
    flex: 1
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13
  },
  recentList: {
    gap: 10
  },
  recentItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2
  },
  thumbWrapper: {
    width: 75,
    height: 65,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC'
  },
  thumbImage: {
    width: 75,
    height: 65
  },
  recentDetails: {
    flex: 1
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  recentReg: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900'
  },
  recentName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 6
  },
  recentPrices: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  recentBought: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600'
  },
  boldPrice: {
    color: colors.textSecondary,
    fontWeight: '800'
  },
  codePill: {
    backgroundColor: colors.accentGreenBg,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.accentGreenBorder
  },
  codeText: {
    color: colors.accentGreen,
    fontSize: 11,
    fontWeight: '900'
  },
  // AI Growth and Category Tiles
  tileAiBox: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  tileAiText: {
    color: colors.primary,
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 0.5
  },
  tileAtoZText: {
    color: colors.available,
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 0.5
  },
  aiGrowthCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  aiGrowthCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  aiPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 5
  },
  aiPillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary
  },
  aiPillText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4
  },
  aiScorePill: {
    backgroundColor: colors.availableBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.availableBorder
  },
  aiScorePillText: {
    color: colors.available,
    fontSize: 11,
    fontWeight: '900'
  },
  aiGrowthCardTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 6
  },
  aiGrowthCardDesc: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 12
  },
  aiGrowthMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  aiMetricCol: {
    flex: 1
  },
  aiMetricLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 2
  },
  aiMetricVal: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '900'
  },
  aiGrowthCardBtn: {
    backgroundColor: colors.primary,
    borderRadius: 9,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  aiGrowthCardBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3
  }
});
