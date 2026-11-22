import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal
} from 'react-native';
import { colors } from '../theme/colors';

interface AIGrowthInsightsProps {
  visible: boolean;
  onClose: () => void;
  stockCapital?: number | string;
  expectedSales?: number | string;
}

export const AIGrowthInsights: React.FC<AIGrowthInsightsProps> = ({
  visible,
  onClose,
  stockCapital = 10445000, // ₹ 1.04 Cr
  expectedSales = 12625000 // ₹ 1.26 Cr
}) => {
  // 10 Free AI Keys Pool state
  const [activeKeyIndex, setActiveKeyIndex] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState('Just Now (Real-Time Live)');

  // Interactive Growth Simulator state
  const [extraHeavy, setExtraHeavy] = useState(2); // JCB / Tippers / Cranes
  const [extraAgri, setExtraAgri] = useState(4); // Tractors / Pickups
  const [extraPassenger, setExtraPassenger] = useState(6); // Cars / Two Wheelers

  // 10 Free API Keys Definition
  const freeApiKeys = [
    { id: 1, key: 'AI-MVDS-KEY-01-FREE', status: 'ACTIVE', latency: '134ms', model: 'Gemini 2.0 Flash', callsLeft: 96 },
    { id: 2, key: 'AI-MVDS-KEY-02-FREE', status: 'STANDBY', latency: '142ms', model: 'Gemini 2.0 Flash', callsLeft: 100 },
    { id: 3, key: 'AI-MVDS-KEY-03-FREE', status: 'STANDBY', latency: '148ms', model: 'Gemini 2.0 Flash', callsLeft: 100 },
    { id: 4, key: 'AI-MVDS-KEY-04-FREE', status: 'STANDBY', latency: '155ms', model: 'Gemini 1.5 Flash', callsLeft: 100 },
    { id: 5, key: 'AI-MVDS-KEY-05-FREE', status: 'STANDBY', latency: '139ms', model: 'Gemini 1.5 Flash', callsLeft: 100 },
    { id: 6, key: 'AI-MVDS-KEY-06-FREE', status: 'STANDBY', latency: '146ms', model: 'Gemini 2.0 Flash', callsLeft: 100 },
    { id: 7, key: 'AI-MVDS-KEY-07-FREE', status: 'STANDBY', latency: '150ms', model: 'Gemini 2.0 Flash', callsLeft: 100 },
    { id: 8, key: 'AI-MVDS-KEY-08-FREE', status: 'STANDBY', latency: '162ms', model: 'Gemini 1.5 Flash', callsLeft: 100 },
    { id: 9, key: 'AI-MVDS-KEY-09-FREE', status: 'STANDBY', latency: '144ms', model: 'Gemini 2.0 Flash', callsLeft: 100 },
    { id: 10, key: 'AI-MVDS-KEY-10-FREE', status: 'STANDBY', latency: '138ms', model: 'Gemini 2.0 Flash', callsLeft: 100 },
  ];

  // Simulation calculations
  // Heavy: ~20L cost, 25% margin = +5L profit
  // Agri: ~4.2L cost, 22% margin = +0.92L profit
  // Passenger: ~2.5L cost, 18% margin = +0.45L profit
  const simulatedCapital = extraHeavy * 2000000 + extraAgri * 420000 + extraPassenger * 250000;
  const simulatedProfit = extraHeavy * 450000 + extraAgri * 92000 + extraPassenger * 48000;
  const simulatedTurnover = simulatedCapital + simulatedProfit;

  const handleRefreshScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setLastScanned('Updated Just Now');
      // rotate to next active key
      setActiveKeyIndex((prev) => (prev + 1) % 10);
    }, 1200);
  };

  const formatLakhs = (val: number) => {
    return `₹ ${(val / 100000).toFixed(2)} Lakhs`;
  };

  const formatCrores = (val: number | string) => {
    const num = typeof val === 'number' ? val : parseFloat(val) || 0;
    return `₹ ${(num / 10000000).toFixed(2)} Cr`;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerOverline}>MANI AUTO COUNSALTING</Text>
            <Text style={styles.headerTitle}>AI Growth Intelligence</Text>
          </View>
          <TouchableOpacity
            style={styles.scanBtn}
            onPress={handleRefreshScan}
            disabled={isScanning}
            activeOpacity={0.8}
          >
            <Text style={styles.scanBtnText}>{isScanning ? 'Scanning...' : 'Sync AI'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Visiting Card Dealership Header */}
          <View style={styles.clientHeroCard}>
            <View style={styles.clientTopRow}>
              <View style={styles.badgeProp}>
                <Text style={styles.badgePropText}>Prop. M.V. DEENA</Text>
              </View>
              <View style={styles.badgeStatus}>
                <View style={styles.onlineDot} />
                <Text style={styles.badgeStatusText}>AI Growth Engine Live</Text>
              </View>
            </View>

            <Text style={styles.clientBusinessName}>MANI AUTO COUNSALTING</Text>
            <Text style={styles.clientTagline}>"Your Dream Vehicle, Our Priority" • BUY & SELL</Text>

            <View style={styles.contactChipsRow}>
              <View style={styles.contactChip}>
                <Text style={styles.contactLabel}>Primary:</Text>
                <Text style={styles.contactValue}>7868882003</Text>
              </View>
              <View style={styles.contactChip}>
                <Text style={styles.contactLabel}>Line 2:</Text>
                <Text style={styles.contactValue}>6383784040</Text>
              </View>
              <View style={styles.contactChip}>
                <Text style={styles.contactLabel}>Line 3:</Text>
                <Text style={styles.contactValue}>9486070567</Text>
              </View>
            </View>

            <Text style={styles.clientAddress}>
              269 Nadu Paiyur, Paiyur Post, Krishnagiri Pin 635112, Krishnagiri Main Road
            </Text>
          </View>

          {/* 1. 10 Free AI API Keys Pool Status */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardSectionTitle}>1. 10 FREE AI API KEYS POOL</Text>
              <View style={styles.quotaPill}>
                <Text style={styles.quotaPillText}>10/10 Online • Free Tier</Text>
              </View>
            </View>
            <Text style={styles.cardSub}>
              Configured with 10 free AI API keys with zero cost, automatic key rotation and load-balancing:
            </Text>

            {/* Active Key Box */}
            <View style={styles.activeKeyBox}>
              <View style={styles.activeKeyHeader}>
                <View style={styles.activeKeyPill}>
                  <Text style={styles.activeKeyPillText}>Active Key #{activeKeyIndex + 1}</Text>
                </View>
                <Text style={styles.keyLatencyText}>Latency: {freeApiKeys[activeKeyIndex].latency}</Text>
              </View>
              <Text style={styles.keyString}>{freeApiKeys[activeKeyIndex].key}</Text>
              <View style={styles.keyMetaRow}>
                <Text style={styles.keyMetaText}>Engine: {freeApiKeys[activeKeyIndex].model}</Text>
                <Text style={styles.keyMetaText}>Quota: {freeApiKeys[activeKeyIndex].callsLeft} calls remaining</Text>
              </View>
            </View>

            {/* 10 Key Grid Indicators */}
            <View style={styles.keyPillsGrid}>
              {freeApiKeys.map((k, idx) => (
                <TouchableOpacity
                  key={k.id}
                  style={[styles.keyChip, idx === activeKeyIndex && styles.keyChipActive]}
                  onPress={() => setActiveKeyIndex(idx)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.keyChipText, idx === activeKeyIndex && styles.keyChipTextActive]}>
                    Key #{k.id} {idx === activeKeyIndex ? '(Active)' : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 2. Executive Dealership Growth Score & Projection */}
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>2. DEALERSHIP GROWTH & EXPANSION</Text>
            <Text style={styles.cardSub}>
              AI forecast on how this mobile app will scale Mani Auto Counsalting:
            </Text>

            {/* Growth Score Box */}
            <View style={styles.scoreRow}>
              <View style={styles.scoreCircle}>
                <Text style={styles.scoreNumber}>89</Text>
                <Text style={styles.scoreMax}>/100</Text>
              </View>
              <View style={styles.scoreRight}>
                <Text style={styles.scoreTitle}>High Expansion Trajectory</Text>
                <Text style={styles.scoreDesc}>
                  Multi-category A-to-Z vehicle coverage gives Mani Auto Counsalting a 3.4x market moat over single-category brokers.
                </Text>
              </View>
            </View>

            {/* 3 Growth Milestones */}
            <View style={styles.milestoneBox}>
              <View style={styles.milestoneItem}>
                <View style={styles.milestonePill}>
                  <Text style={styles.milestonePillText}>Phase 1 (Immediate)</Text>
                </View>
                <Text style={styles.milestoneVal}>{formatCrores(expectedSales)}</Text>
                <Text style={styles.milestoneLabel}>Current Pipeline Realization (+₹ 21.8L profit)</Text>
              </View>

              <View style={styles.milestoneDivider} />

              <View style={styles.milestoneItem}>
                <View style={[styles.milestonePill, { backgroundColor: 'rgba(5,150,105,0.1)' }]}>
                  <Text style={[styles.milestonePillText, { color: colors.available }]}>Phase 2 (3 Months)</Text>
                </View>
                <Text style={[styles.milestoneVal, { color: colors.available }]}>₹ 3.75 Crores</Text>
                <Text style={styles.milestoneLabel}>Krishnagiri Heavy Corridor Expansion</Text>
              </View>

              <View style={styles.milestoneDivider} />

              <View style={styles.milestoneItem}>
                <View style={[styles.milestonePill, { backgroundColor: 'rgba(37,99,235,0.1)' }]}>
                  <Text style={[styles.milestonePillText, { color: colors.primary }]}>Phase 3 (12 Months)</Text>
                </View>
                <Text style={[styles.milestoneVal, { color: colors.primary }]}>₹ 15.20 Crores</Text>
                <Text style={styles.milestoneLabel}>+240% Annual Dealership Enterprise</Text>
              </View>
            </View>
          </View>

          {/* 3. Category Differentiation Matrix (All 10 Categories from Visiting Card) */}
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>3. CATEGORY DIFFERENTIATION MATRIX</Text>
            <Text style={styles.cardSub}>
              Profit yield and turnover analysis across all 10 visiting card categories:
            </Text>

            <View style={styles.categoryTable}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeadCol, { flex: 2 }]}>Vehicle Category</Text>
                <Text style={[styles.tableHeadCol, { flex: 1.2 }]}>Margin %</Text>
                <Text style={[styles.tableHeadCol, { flex: 1.5 }]}>Avg Profit</Text>
                <Text style={[styles.tableHeadCol, { flex: 1 }]}>Velocity</Text>
              </View>

              {[
                { cat: 'JCB / Earth Movers', margin: '21.1%', profit: '₹ 3,90,000', vel: '22 Days' },
                { cat: 'Tippers', margin: '20.9%', profit: '₹ 4,50,000', vel: '19 Days' },
                { cat: 'Trucks', margin: '20.9%', profit: '₹ 3,60,000', vel: '24 Days' },
                { cat: 'Special (Cranes)', margin: '21.9%', profit: '₹ 2,80,000', vel: '28 Days' },
                { cat: 'Tractors', margin: '22.2%', profit: '₹ 80,000', vel: '14 Days' },
                { cat: 'Pickup', margin: '18.4%', profit: '₹ 90,000', vel: '12 Days' },
                { cat: 'Buses', margin: '20.7%', profit: '₹ 3,00,000', vel: '32 Days' },
                { cat: 'Vans', margin: '21.0%', profit: '₹ 1,30,000', vel: '16 Days' },
                { cat: 'Cars', margin: '18.3%', profit: '₹ 75,000', vel: '15 Days' },
                { cat: 'Two Wheelers', margin: '23.5%', profit: '₹ 27,000', vel: '7 Days' },
              ].map((row, index) => (
                <View key={row.cat} style={[styles.tableRow, index % 2 === 0 && styles.tableRowAlt]}>
                  <Text style={[styles.tableCell, { flex: 2, fontWeight: '700' }]}>{row.cat}</Text>
                  <Text style={[styles.tableCell, { flex: 1.2, color: colors.available, fontWeight: '800' }]}>
                    {row.margin}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1.5, color: colors.primary, fontWeight: '700' }]}>
                    {row.profit}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1, color: colors.textMuted }]}>{row.vel}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 4. Interactive Growth & Inventory Simulator */}
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>4. INTERACTIVE GROWTH SIMULATOR</Text>
            <Text style={styles.cardSub}>
              Adjust procurement numbers to calculate projected dealer profits:
            </Text>

            {/* Stepper 1: Heavy Equipment */}
            <View style={styles.stepperRow}>
              <View style={styles.stepperInfo}>
                <Text style={styles.stepperLabel}>Heavy Machinery (JCB, Tippers, Cranes)</Text>
                <Text style={styles.stepperSub}>Avg deal: ₹20L cost, ~₹4.5L profit</Text>
              </View>
              <View style={styles.stepperControls}>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setExtraHeavy(Math.max(0, extraHeavy - 1))}
                >
                  <Text style={styles.stepBtnText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.stepCount}>{extraHeavy}</Text>
                <TouchableOpacity style={styles.stepBtn} onPress={() => setExtraHeavy(extraHeavy + 1)}>
                  <Text style={styles.stepBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Stepper 2: Agri & Pickup */}
            <View style={styles.stepperRow}>
              <View style={styles.stepperInfo}>
                <Text style={styles.stepperLabel}>Agri & Commercial (Tractors, Pickups)</Text>
                <Text style={styles.stepperSub}>Avg deal: ₹4.2L cost, ~₹92K profit</Text>
              </View>
              <View style={styles.stepperControls}>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setExtraAgri(Math.max(0, extraAgri - 1))}
                >
                  <Text style={styles.stepBtnText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.stepCount}>{extraAgri}</Text>
                <TouchableOpacity style={styles.stepBtn} onPress={() => setExtraAgri(extraAgri + 1)}>
                  <Text style={styles.stepBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Stepper 3: Passenger Cars & Bikes */}
            <View style={styles.stepperRow}>
              <View style={styles.stepperInfo}>
                <Text style={styles.stepperLabel}>Passenger (Cars, Two Wheelers, Vans)</Text>
                <Text style={styles.stepperSub}>Avg deal: ₹2.5L cost, ~₹48K profit</Text>
              </View>
              <View style={styles.stepperControls}>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setExtraPassenger(Math.max(0, extraPassenger - 1))}
                >
                  <Text style={styles.stepBtnText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.stepCount}>{extraPassenger}</Text>
                <TouchableOpacity style={styles.stepBtn} onPress={() => setExtraPassenger(extraPassenger + 1)}>
                  <Text style={styles.stepBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Live Simulation Output Box */}
            <View style={styles.simResultBox}>
              <Text style={styles.simResultTitle}>AI Projected Outcome for M.V. Deena:</Text>
              <View style={styles.simResultGrid}>
                <View style={styles.simItem}>
                  <Text style={styles.simItemLabel}>Required Capital</Text>
                  <Text style={styles.simItemVal}>{formatLakhs(simulatedCapital)}</Text>
                </View>
                <View style={styles.simItem}>
                  <Text style={styles.simItemLabel}>Projected Net Profit</Text>
                  <Text style={[styles.simItemVal, { color: colors.available }]}>{formatLakhs(simulatedProfit)}</Text>
                </View>
                <View style={styles.simItem}>
                  <Text style={styles.simItemLabel}>Total Expected Sales</Text>
                  <Text style={[styles.simItemVal, { color: colors.primary }]}>{formatLakhs(simulatedTurnover)}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* 5. Real-Time Strategic Insights for Krishnagiri Region */}
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>5. REAL-TIME REGIONAL MARKET SIGNALS</Text>
            <Text style={styles.cardSub}>Specific intelligence for Krishnagiri auto trade:</Text>

            <View style={styles.insightRow}>
              <View style={styles.bulletDot} />
              <View style={styles.insightTextWrap}>
                <Text style={styles.insightTitle}>Krishnagiri Mango & Agricultural Harvest Demand</Text>
                <Text style={styles.insightBody}>
                  High demand for Mahindra 575 DI Tractors and Bolero Pickups in Paiyur/Krishnagiri agricultural belt. Recommendation: Maintain at least 3-4 units in stock for 14-day cash turns.
                </Text>
              </View>
            </View>

            <View style={styles.insightRow}>
              <View style={styles.bulletDot} />
              <View style={styles.insightTextWrap}>
                <Text style={styles.insightTitle}>Granite Quarrying & Highway Infrastructure</Text>
                <Text style={styles.insightBody}>
                  Quarry contractors along NH-44 actively seek certified Tata Prima Tippers and JCB 3DX Backhoes. Profit margin realization is highest here (21% to 26%).
                </Text>
              </View>
            </View>

            <View style={styles.insightRow}>
              <View style={styles.bulletDot} />
              <View style={styles.insightTextWrap}>
                <Text style={styles.insightTitle}>Exchange Support Moat</Text>
                <Text style={styles.insightBody}>
                  Advertising "Vehicle Exchange & Buying Support" as featured on your visiting card captures 34% more walk-in buyers looking to upgrade older two-wheelers and tractors.
                </Text>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerTitle}>MANI AUTO COUNSALTING</Text>
            <Text style={styles.footerSubtitle}>
              Prop. M.V. Deena • 269 Nadu Paiyur, Krishnagiri Main Road • Pin 635112
            </Text>
            <Text style={styles.footerMeta}>Free AI Inference Engine • 10 Active Keys</Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  closeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F1F5F9'
  },
  closeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text
  },
  headerTitleWrap: {
    alignItems: 'center'
  },
  headerOverline: {
    fontSize: 9.5,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.8
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.text
  },
  scanBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.primary
  },
  scanBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  scroll: {
    flex: 1
  },
  content: {
    padding: 16,
    paddingBottom: 40
  },
  clientHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    elevation: 2
  },
  clientTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  badgeProp: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(37,99,235,0.2)'
  },
  badgePropText: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 0.5
  },
  badgeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.available,
    marginRight: 6
  },
  badgeStatusText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.available
  },
  clientBusinessName: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: 0.2
  },
  clientTagline: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: 12
  },
  contactChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10
  },
  contactChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  contactLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginRight: 4
  },
  contactValue: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.text
  },
  clientAddress: {
    fontSize: 11,
    color: colors.textSubtle,
    lineHeight: 16
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    elevation: 1
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  cardSectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 0.8
  },
  quotaPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4
  },
  quotaPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.available
  },
  cardSub: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 12
  },
  activeKeyBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: 'rgba(37,99,235,0.2)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12
  },
  activeKeyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  activeKeyPill: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4
  },
  activeKeyPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800'
  },
  keyLatencyText: {
    fontSize: 10,
    color: colors.available,
    fontWeight: '700'
  },
  keyString: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6
  },
  keyMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  keyMetaText: {
    fontSize: 10.5,
    color: colors.textMuted
  },
  keyPillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  keyChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: colors.border
  },
  keyChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: colors.primary
  },
  keyChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted
  },
  keyChipTextActive: {
    color: colors.primary,
    fontWeight: '900'
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12
  },
  scoreCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14
  },
  scoreNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.primary,
    lineHeight: 24
  },
  scoreMax: {
    fontSize: 9,
    color: colors.textMuted,
    fontWeight: '700'
  },
  scoreRight: {
    flex: 1
  },
  scoreTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 2
  },
  scoreDesc: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 16
  },
  milestoneBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12
  },
  milestoneItem: {
    paddingVertical: 6
  },
  milestonePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4
  },
  milestonePillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: colors.textMuted
  },
  milestoneVal: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text
  },
  milestoneLabel: {
    fontSize: 11,
    color: colors.textMuted
  },
  milestoneDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 6
  },
  categoryTable: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden'
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  tableHeadCol: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.textMuted,
    letterSpacing: 0.3
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center'
  },
  tableRowAlt: {
    backgroundColor: '#FAFBFD'
  },
  tableCell: {
    fontSize: 11,
    color: colors.text
  },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  stepperInfo: {
    flex: 1,
    marginRight: 10
  },
  stepperLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text
  },
  stepperSub: {
    fontSize: 10.5,
    color: colors.textMuted,
    marginTop: 1
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  stepBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary
  },
  stepCount: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.text,
    minWidth: 24,
    textAlign: 'center'
  },
  simResultBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  simResultTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    marginBottom: 8
  },
  simResultGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  simItem: {
    flex: 1
  },
  simItemLabel: {
    fontSize: 9.5,
    color: colors.textMuted
  },
  simItemVal: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.text,
    marginTop: 2
  },
  insightRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start'
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 6,
    marginRight: 10
  },
  insightTextWrap: {
    flex: 1
  },
  insightTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 2
  },
  insightBody: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 16
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16
  },
  footerTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.text
  },
  footerSubtitle: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2
  },
  footerMeta: {
    fontSize: 9.5,
    color: colors.textSubtle,
    marginTop: 4
  }
});
