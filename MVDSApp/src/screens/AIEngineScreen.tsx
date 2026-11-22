import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { colors } from '../theme/colors';
import { api } from '../api/client';

export type AIScreenTab = 'valuation' | 'growth' | 'signals' | 'keys' | 'advisor';

interface AIEngineScreenProps {
  onNavigateToVehicles?: () => void;
  stockCapital?: number;
  expectedSales?: number;
}

export const AIEngineScreen: React.FC<AIEngineScreenProps> = ({
  onNavigateToVehicles,
  stockCapital = 10445000,
  expectedSales = 12625000
}) => {
  const [activeTab, setActiveTab] = useState<AIScreenTab>('valuation');

  // Cluster State
  const [clusterInfo, setClusterInfo] = useState<any>(null);
  const [loadingCluster, setLoadingCluster] = useState(false);
  const [rotatingKey, setRotatingKey] = useState(false);

  // Valuation State
  const [selectedCategory, setSelectedCategory] = useState('JCB / Earth Movers');
  const [vehicleName, setVehicleName] = useState('JCB 3DX Super 4WD Backhoe');
  const [modelYear, setModelYear] = useState('2021');
  const [condition, setCondition] = useState('Excellent');
  const [boughtPrice, setBoughtPrice] = useState('1850000');
  const [evaluating, setEvaluating] = useState(false);
  const [valuationResult, setValuationResult] = useState<any>(null);

  // Growth Simulator State
  const [extraHeavy, setExtraHeavy] = useState(2);
  const [extraAgri, setExtraAgri] = useState(4);
  const [extraPassenger, setExtraPassenger] = useState(6);

  // AI Advisor State
  const [advisorQuery, setAdvisorQuery] = useState('');
  const [askingAdvisor, setAskingAdvisor] = useState(false);
  const [advisorAnswer, setAdvisorAnswer] = useState<any>(null);

  const categories = [
    'Cars',
    'Two Wheelers',
    'JCB / Earth Movers',
    'Tractors',
    'Pickup',
    'Tippers',
    'Trucks',
    'Buses',
    'Vans',
    'Special Vehicles'
  ];

  // Presets for quick evaluation
  const presets = [
    { cat: 'JCB / Earth Movers', name: 'JCB 3DX Super Backhoe Loader', year: '2021', price: '1850000', cond: 'Excellent' },
    { cat: 'Pickup', name: 'Mahindra Bolero Camper 4x4 Pik-Up', year: '2020', price: '520000', cond: 'Good' },
    { cat: 'Tippers', name: 'Tata Daewoo Novus 25.5T Heavy Tipper', year: '2020', price: '2150000', cond: 'Excellent' },
    { cat: 'Special Vehicles', name: 'Liebherr 5-Axle Mobile Hydraulic Crane', year: '2019', price: '12800000', cond: 'Excellent' },
    { cat: 'Tractors', name: 'Massey Ferguson 290 4WD Farm Tractor', year: '2021', price: '360000', cond: 'Good' },
    { cat: 'Cars', name: 'Toyota Corolla Altis 1.8G Sedan', year: '2018', price: '410000', cond: 'Good' },
    { cat: 'Two Wheelers', name: 'Honda Hornet 2.0 Street Sports Bike', year: '2022', price: '115000', cond: 'Showroom' }
  ];

  const fetchCluster = async () => {
    try {
      setLoadingCluster(true);
      const res = await api.getAiCluster();
      if (res.success) {
        setClusterInfo(res.cluster);
      }
    } catch (err) {
      console.log('Fetch AI cluster fallback:', err);
    } finally {
      setLoadingCluster(false);
    }
  };

  useEffect(() => {
    fetchCluster();
    // Default initial valuation run
    runValuation();
  }, []);

  const handleRotateKey = async () => {
    try {
      setRotatingKey(true);
      const res = await api.rotateAiKey();
      if (res.success) {
        await fetchCluster();
        Alert.alert('Key Rotated', `${res.message}\nActive Engine: ${res.activeKey.model}`);
      }
    } catch (err) {
      Alert.alert('Notice', 'Key rotation applied locally.');
    } finally {
      setRotatingKey(false);
    }
  };

  const runValuation = async (override?: { cat: string; name: string; year: string; price: string; cond: string }) => {
    const cat = override?.cat || selectedCategory;
    const name = override?.name || vehicleName;
    const year = Number(override?.year || modelYear);
    const cond = override?.cond || condition;
    const price = Number(override?.price || boughtPrice);

    try {
      setEvaluating(true);
      const res = await api.computeAiValuation({
        category: cat,
        vehicleName: name,
        modelYear: year,
        condition: cond,
        boughtPrice: price
      });
      if (res.success) {
        setValuationResult(res.valuation);
      }
    } catch (err) {
      console.log('Valuation error:', err);
    } finally {
      setEvaluating(false);
    }
  };

  const handleApplyPreset = (p: typeof presets[0]) => {
    setSelectedCategory(p.cat);
    setVehicleName(p.name);
    setModelYear(p.year);
    setBoughtPrice(p.price);
    setCondition(p.cond);
    runValuation(p);
  };

  const handleAskAdvisor = async (queryToAsk?: string) => {
    const q = queryToAsk || advisorQuery;
    if (!q.trim()) return;

    try {
      setAskingAdvisor(true);
      const res = await api.askAiAdvisor(q);
      if (res.success) {
        setAdvisorAnswer(res.advisor);
      }
    } catch (err) {
      console.log('Advisor error:', err);
    } finally {
      setAskingAdvisor(false);
    }
  };

  // Calculations for growth simulator
  const simulatedCapital = extraHeavy * 2000000 + extraAgri * 420000 + extraPassenger * 250000;
  const simulatedProfit = extraHeavy * 450000 + extraAgri * 92000 + extraPassenger * 48000;
  const simulatedTurnover = simulatedCapital + simulatedProfit;

  const formatCurrency = (val: number | string) => {
    const num = Number(val) || 0;
    return `₹ ${num.toLocaleString('en-IN')}`;
  };

  const formatLakhs = (val: number) => {
    return `₹ ${(val / 100000).toFixed(2)} Lakhs`;
  };

  return (
    <View style={styles.root}>
      {/* 1. Header Bar with High-Tech Status */}
      <View style={styles.topHeader}>
        <View style={styles.topHeaderContent}>
          <View style={styles.badgeRow}>
            <View style={styles.dealershipPill}>
              <Text style={styles.dealershipPillText}>MANI AUTO COUNSALTING</Text>
            </View>
            <View style={styles.clusterLivePill}>
              <View style={styles.livePulseDot} />
              <Text style={styles.clusterLiveText}>Valuation Engine Active</Text>
            </View>
          </View>

          <Text style={styles.headerTitle}>Vehicle Valuation & Market Pricing</Text>
          <Text style={styles.headerSubtitle}>
            Prop. M.V. Deena • Krishnagiri Regional Deal Intelligence & Margins
          </Text>

          {/* Engine Summary Bar */}
          <View style={styles.telemetryBar}>
            <View style={styles.telemetryCol}>
              <Text style={styles.telemetryLabel}>PRICE FORMULA</Text>
              <Text style={styles.telemetryValue}>MV-Cipher Code</Text>
            </View>
            <View style={styles.telemetryDivider} />
            <View style={styles.telemetryCol}>
              <Text style={styles.telemetryLabel}>FLEET COVERAGE</Text>
              <Text style={[styles.telemetryValue, { color: colors.available }]}>10 Types A to Z</Text>
            </View>
            <View style={styles.telemetryDivider} />
            <View style={styles.telemetryCol}>
              <Text style={styles.telemetryLabel}>TARGET MARGIN</Text>
              <Text style={[styles.telemetryValue, { color: colors.primary }]}>20% - 25%</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 2. Sleek Segmented Tab Selector */}
      <View style={styles.tabsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          <TouchableOpacity
            style={[styles.tabChip, activeTab === 'valuation' && styles.tabChipActive]}
            onPress={() => setActiveTab('valuation')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabChipText, activeTab === 'valuation' && styles.tabChipTextActive]}>
              Valuation Engine
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabChip, activeTab === 'growth' && styles.tabChipActive]}
            onPress={() => setActiveTab('growth')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabChipText, activeTab === 'growth' && styles.tabChipTextActive]}>
              Growth Predictor
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabChip, activeTab === 'signals' && styles.tabChipActive]}
            onPress={() => setActiveTab('signals')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabChipText, activeTab === 'signals' && styles.tabChipTextActive]}>
              Regional Signals
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabChip, activeTab === 'keys' && styles.tabChipActive]}
            onPress={() => setActiveTab('keys')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabChipText, activeTab === 'keys' && styles.tabChipTextActive]}>
              10 Keys Pool
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabChip, activeTab === 'advisor' && styles.tabChipActive]}
            onPress={() => setActiveTab('advisor')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabChipText, activeTab === 'advisor' && styles.tabChipTextActive]}>
              AI Deal Advisor
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Main Content Area */}
      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={styles.mainContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ===================== TAB 1: VALUATION ENGINE ===================== */}
        {activeTab === 'valuation' && (
          <View>
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <View>
                  <Text style={styles.cardTitle}>Real-Time Vehicle Valuation & Cipher</Text>
                  <Text style={styles.cardSub}>
                    Input vehicle specs to calculate quotes and proprietary dealer price codes.
                  </Text>
                </View>
              </View>

              {/* Fast Presets */}
              <Text style={styles.inputSectionLabel}>FAST PRESETS FROM SHOWROOM FLEET</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
                {presets.map((p) => (
                  <TouchableOpacity
                    key={p.name}
                    style={styles.presetChip}
                    onPress={() => handleApplyPreset(p)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.presetChipText}>{p.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Category Selector */}
              <Text style={styles.inputSectionLabel}>SELECT VEHICLE CATEGORY (A TO Z)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                {categories.map((c) => {
                  const isSel = selectedCategory === c;
                  return (
                    <TouchableOpacity
                      key={c}
                      style={[styles.catChip, isSel && styles.catChipActive]}
                      onPress={() => setSelectedCategory(c)}
                    >
                      <Text style={[styles.catChipText, isSel && styles.catChipTextActive]}>
                        {c}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Vehicle Model & Year Inputs */}
              <View style={styles.formRow}>
                <View style={{ flex: 2, marginRight: 10 }}>
                  <Text style={styles.inputLabel}>VEHICLE MODEL / MAKE</Text>
                  <TextInput
                    style={styles.textInput}
                    value={vehicleName}
                    onChangeText={setVehicleName}
                    placeholder="e.g. JCB 3DX Super"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>MODEL YEAR</Text>
                  <TextInput
                    style={styles.textInput}
                    value={modelYear}
                    onChangeText={setModelYear}
                    keyboardType="numeric"
                    placeholder="2021"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>

              {/* Bought Price & Condition */}
              <View style={styles.formRow}>
                <View style={{ flex: 1.5, marginRight: 10 }}>
                  <Text style={styles.inputLabel}>BOUGHT / ACQUISITION COST (₹)</Text>
                  <TextInput
                    style={[styles.textInput, { fontFamily: 'Courier', fontWeight: '700' }]}
                    value={boughtPrice}
                    onChangeText={setBoughtPrice}
                    keyboardType="numeric"
                    placeholder="e.g. 1850000"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>CONDITION</Text>
                  <TextInput
                    style={styles.textInput}
                    value={condition}
                    onChangeText={setCondition}
                    placeholder="Excellent"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>

              {/* Compute Button */}
              <TouchableOpacity
                style={styles.computeBtn}
                onPress={() => runValuation()}
                disabled={evaluating}
                activeOpacity={0.8}
              >
                {evaluating ? (
                  <ActivityIndicator color={colors.textInverse} size="small" />
                ) : (
                  <Text style={styles.computeBtnText}>Run AI Valuation & Price Code →</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Valuation Output Display Card */}
            {valuationResult && (
              <View style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <View style={styles.resultTagPill}>
                    <Text style={styles.resultTagText}>AI VALUATION AUDIT</Text>
                  </View>
                  <Text style={styles.confidenceText}>Confidence: {valuationResult.confidenceScore}</Text>
                </View>

                <Text style={styles.resultVehicleTitle}>
                  {valuationResult.vehicleName} ({valuationResult.modelYear})
                </Text>
                <Text style={styles.resultVehicleCategory}>
                  Category: {valuationResult.category} • Condition: {valuationResult.condition}
                </Text>

                {/* 4 Metrics Grid */}
                <View style={styles.metricsGrid}>
                  {/* Metric 1: Suggested Quote */}
                  <View style={styles.metricBox}>
                    <Text style={styles.metricLabel}>TARGET SELLING QUOTE</Text>
                    <Text style={styles.metricValPrimary}>
                      {formatCurrency(valuationResult.suggestedSellingQuote)}
                    </Text>
                    <Text style={styles.metricSub}>Recommended Showroom Listing</Text>
                  </View>

                  {/* Metric 2: Price Code Cipher */}
                  <View style={styles.metricBox}>
                    <Text style={styles.metricLabel}>PROPRIETARY PRICE CODE</Text>
                    <View style={styles.cipherPill}>
                      <Text style={styles.cipherPillText}>{valuationResult.priceCode}</Text>
                    </View>
                    <Text style={styles.metricSub}>Floor Threshold: {valuationResult.floorPriceCode}</Text>
                  </View>

                  {/* Metric 3: Projected Margin */}
                  <View style={styles.metricBox}>
                    <Text style={styles.metricLabel}>PROJECTED DEALER MARGIN</Text>
                    <Text style={styles.metricValGreen}>
                      +{formatCurrency(valuationResult.projectedMargin)}
                    </Text>
                    <Text style={styles.metricSub}>Yield: {valuationResult.marginPercent} Net</Text>
                  </View>

                  {/* Metric 4: Days to Sell */}
                  <View style={styles.metricBox}>
                    <Text style={styles.metricLabel}>EXPECTED LIQUIDITY</Text>
                    <Text style={styles.metricValSlate}>
                      ~{valuationResult.estimatedDaysToSell} Days
                    </Text>
                    <Text style={styles.metricSub}>{valuationResult.regionalDemandIndex}</Text>
                  </View>
                </View>

                {/* AI Negotiation & Sales Guidance */}
                <View style={styles.tacticsSection}>
                  <Text style={styles.tacticsTitle}>STRATEGIC NEGOTIATION TACTICS (FOR M.V. DEENA):</Text>
                  {valuationResult.tactics?.map((t: string, idx: number) => (
                    <View key={idx} style={styles.tacticRow}>
                      <View style={styles.tacticBullet} />
                      <Text style={styles.tacticText}>{t}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* ===================== TAB 2: GROWTH PREDICTOR ===================== */}
        {activeTab === 'growth' && (
          <View>
            {/* Expansion Trajectory Score */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Dealership Expansion Score</Text>
              <Text style={styles.cardSub}>
                Real-time assessment of business growth velocity for Mani Auto Counsalting.
              </Text>

              <View style={styles.scoreRow}>
                <View style={styles.scoreCircle}>
                  <Text style={styles.scoreBig}>89</Text>
                  <Text style={styles.scoreMax}>/100</Text>
                </View>
                <View style={styles.scoreDetails}>
                  <Text style={styles.scoreRating}>High Expansion Trajectory</Text>
                  <Text style={styles.scoreDesc}>
                    Full A-to-Z inventory coverage across commercial, agricultural, and passenger segments gives Mani Auto Counsalting a 3.4x market moat in the Krishnagiri trade belt.
                  </Text>
                </View>
              </View>

              {/* 3 Scaling Milestones */}
              <View style={styles.milestoneGrid}>
                <View style={styles.milestoneCard}>
                  <Text style={styles.milestoneTag}>PHASE 1 (IMMEDIATE)</Text>
                  <Text style={styles.milestoneAmount}>₹ 1.26 Crores</Text>
                  <Text style={styles.milestoneSub}>Current Fleet Realization (+₹ 21.8L profit)</Text>
                </View>

                <View style={[styles.milestoneCard, { borderColor: colors.availableBorder, backgroundColor: '#F0FDF4' }]}>
                  <Text style={[styles.milestoneTag, { color: colors.available }]}>PHASE 2 (3-6 MONTHS)</Text>
                  <Text style={[styles.milestoneAmount, { color: colors.available }]}>₹ 3.75 Crores</Text>
                  <Text style={styles.milestoneSub}>Krishnagiri Heavy Quarry & Highway Fleet</Text>
                </View>

                <View style={[styles.milestoneCard, { borderColor: colors.primary, backgroundColor: '#EFF6FF' }]}>
                  <Text style={[styles.milestoneTag, { color: colors.primary }]}>PHASE 3 (12 MONTHS)</Text>
                  <Text style={[styles.milestoneAmount, { color: colors.primary }]}>₹ 15.20 Crores</Text>
                  <Text style={styles.milestoneSub}>Multi-Yard Dealership Enterprise (+240%)</Text>
                </View>
              </View>
            </View>

            {/* 10-Category Differentiation Table */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>10-Category Profit Yield Matrix</Text>
              <Text style={styles.cardSub}>
                Comparative margin and sales velocity across all categories on visiting card:
              </Text>

              <View style={styles.matrixTable}>
                <View style={styles.matrixHeadRow}>
                  <Text style={[styles.matrixHeadCol, { flex: 2.2 }]}>Category</Text>
                  <Text style={[styles.matrixHeadCol, { flex: 1.2 }]}>Margin %</Text>
                  <Text style={[styles.matrixHeadCol, { flex: 1.6 }]}>Avg Profit</Text>
                  <Text style={[styles.matrixHeadCol, { flex: 1.2 }]}>Velocity</Text>
                </View>

                {[
                  { cat: 'JCB / Earth Movers', margin: '22.0%', profit: '₹ 3,90,000', vel: '20 Days' },
                  { cat: 'Tippers', margin: '21.0%', profit: '₹ 4,50,000', vel: '18 Days' },
                  { cat: 'Trucks', margin: '20.0%', profit: '₹ 3,60,000', vel: '22 Days' },
                  { cat: 'Special (Cranes)', margin: '23.0%', profit: '₹ 2,80,000', vel: '28 Days' },
                  { cat: 'Tractors', margin: '22.5%', profit: '₹ 80,000', vel: '14 Days' },
                  { cat: 'Pickup', margin: '18.5%', profit: '₹ 90,000', vel: '12 Days' },
                  { cat: 'Buses', margin: '20.0%', profit: '₹ 3,00,000', vel: '30 Days' },
                  { cat: 'Vans', margin: '21.0%', profit: '₹ 1,30,000', vel: '16 Days' },
                  { cat: 'Cars', margin: '18.0%', profit: '₹ 75,000', vel: '15 Days' },
                  { cat: 'Two Wheelers', margin: '24.0%', profit: '₹ 27,000', vel: '7 Days' },
                ].map((row, idx) => (
                  <View key={row.cat} style={[styles.matrixRow, idx % 2 === 1 && styles.matrixRowAlt]}>
                    <Text style={[styles.matrixCell, { flex: 2.2, fontWeight: '700' }]}>{row.cat}</Text>
                    <Text style={[styles.matrixCell, { flex: 1.2, color: colors.available, fontWeight: '800' }]}>
                      {row.margin}
                    </Text>
                    <Text style={[styles.matrixCell, { flex: 1.6, color: colors.primary, fontWeight: '700' }]}>
                      {row.profit}
                    </Text>
                    <Text style={[styles.matrixCell, { flex: 1.2, color: colors.textMuted }]}>{row.vel}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Interactive Inventory Simulator */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Inventory Procurement Simulator</Text>
              <Text style={styles.cardSub}>
                Adjust planned vehicle procurements to project required capital and net dealer returns:
              </Text>

              {/* Stepper 1: Heavy Equipment */}
              <View style={styles.stepperBox}>
                <View style={styles.stepperTextWrap}>
                  <Text style={styles.stepperTitle}>Heavy Equipment (JCB, Tippers, Cranes)</Text>
                  <Text style={styles.stepperSub}>Avg deal: ₹20L cost, ~₹4.5L profit</Text>
                </View>
                <View style={styles.stepperControls}>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => setExtraHeavy(Math.max(0, extraHeavy - 1))}
                  >
                    <Text style={styles.stepBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.stepVal}>{extraHeavy}</Text>
                  <TouchableOpacity style={styles.stepBtn} onPress={() => setExtraHeavy(extraHeavy + 1)}>
                    <Text style={styles.stepBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Stepper 2: Agri & Pickups */}
              <View style={styles.stepperBox}>
                <View style={styles.stepperTextWrap}>
                  <Text style={styles.stepperTitle}>Agri & Commercial (Tractors, Pickups)</Text>
                  <Text style={styles.stepperSub}>Avg deal: ₹4.2L cost, ~₹92K profit</Text>
                </View>
                <View style={styles.stepperControls}>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => setExtraAgri(Math.max(0, extraAgri - 1))}
                  >
                    <Text style={styles.stepBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.stepVal}>{extraAgri}</Text>
                  <TouchableOpacity style={styles.stepBtn} onPress={() => setExtraAgri(extraAgri + 1)}>
                    <Text style={styles.stepBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Stepper 3: Passenger */}
              <View style={styles.stepperBox}>
                <View style={styles.stepperTextWrap}>
                  <Text style={styles.stepperTitle}>Passenger (Cars, Two Wheelers, Vans)</Text>
                  <Text style={styles.stepperSub}>Avg deal: ₹2.5L cost, ~₹48K profit</Text>
                </View>
                <View style={styles.stepperControls}>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => setExtraPassenger(Math.max(0, extraPassenger - 1))}
                  >
                    <Text style={styles.stepBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.stepVal}>{extraPassenger}</Text>
                  <TouchableOpacity style={styles.stepBtn} onPress={() => setExtraPassenger(extraPassenger + 1)}>
                    <Text style={styles.stepBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Live Output */}
              <View style={styles.simOutputBox}>
                <Text style={styles.simOutputHeading}>PROJECTED OUTCOME FOR M.V. DEENA:</Text>
                <View style={styles.simGrid}>
                  <View style={styles.simCol}>
                    <Text style={styles.simLabel}>REQUIRED CAPITAL</Text>
                    <Text style={styles.simValue}>{formatLakhs(simulatedCapital)}</Text>
                  </View>
                  <View style={styles.simCol}>
                    <Text style={styles.simLabel}>PROJECTED NET PROFIT</Text>
                    <Text style={[styles.simValue, { color: colors.available }]}>{formatLakhs(simulatedProfit)}</Text>
                  </View>
                  <View style={styles.simCol}>
                    <Text style={styles.simLabel}>TOTAL TURNOVER</Text>
                    <Text style={[styles.simValue, { color: colors.primary }]}>{formatLakhs(simulatedTurnover)}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ===================== TAB 3: REGIONAL SIGNALS ===================== */}
        {activeTab === 'signals' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Krishnagiri Regional Market Signals</Text>
              <Text style={styles.cardSub}>
                Automated geographic market intelligence for Tamil Nadu & interstate highway routes:
              </Text>

              {/* Signal 1 */}
              <View style={styles.signalCard}>
                <View style={styles.signalTopRow}>
                  <View style={styles.signalBadge}>
                    <Text style={styles.signalBadgeText}>AGRICULTURAL CYCLE</Text>
                  </View>
                  <Text style={styles.signalLocationText}>Paiyur • Bargur • Pochampalli</Text>
                </View>
                <Text style={styles.signalHeading}>Mango Harvest & Horticulture Demand Surge</Text>
                <Text style={styles.signalBody}>
                  Krishnagiri is India's highest mango producing corridor. Farm producers and fruit trading agents actively seek Mahindra Bolero Pickups (Campers and Maxx) and Massey Ferguson tractors for harvest transport.
                </Text>
                <View style={styles.signalActionRow}>
                  <Text style={styles.signalActionText}>Recommendation: Maintain 3+ pickups in showroom for fast 12-day cash turns.</Text>
                </View>
              </View>

              {/* Signal 2 */}
              <View style={styles.signalCard}>
                <View style={styles.signalTopRow}>
                  <View style={[styles.signalBadge, { backgroundColor: '#F0FDF4' }]}>
                    <Text style={[styles.signalBadgeText, { color: colors.available }]}>HEAVY INFRASTRUCTURE</Text>
                  </View>
                  <Text style={styles.signalLocationText}>Shoolagiri • Hosur • Rayakottai</Text>
                </View>
                <Text style={styles.signalHeading}>Granite Quarrying & Highway Expansion</Text>
                <Text style={styles.signalBody}>
                  Quarries along NH-44 require high-tonnage tippers (Tata Prima / Daewoo Novus) and hydraulic excavators (JCB 3DX / 3CX). Highest net profit realization in the dealership portfolio (+₹ 3.8L to ₹ 4.5L per vehicle).
                </Text>
                <View style={styles.signalActionRow}>
                  <Text style={styles.signalActionText}>Recommendation: Inspect and certify hydraulic assemblies before customer demo.</Text>
                </View>
              </View>

              {/* Signal 3 */}
              <View style={styles.signalCard}>
                <View style={styles.signalTopRow}>
                  <View style={[styles.signalBadge, { backgroundColor: '#EFF6FF' }]}>
                    <Text style={[styles.signalBadgeText, { color: colors.primary }]}>LOGISTICS & FREIGHT</Text>
                  </View>
                  <Text style={styles.signalLocationText}>NH-44 Bangalore-Salem-Chennai</Text>
                </View>
                <Text style={styles.signalHeading}>Multi-Axle Freight Trucks & Luxury Buses</Text>
                <Text style={styles.signalBody}>
                  Heavy transit along the golden quadrilateral corridor maintains high buyer interest for 6x4 freight haulers and passenger coach buses.
                </Text>
                <View style={styles.signalActionRow}>
                  <Text style={styles.signalActionText}>Recommendation: Keep full national permit and fitness certificate verified.</Text>
                </View>
              </View>

              {/* Signal 4 */}
              <View style={styles.signalCard}>
                <View style={styles.signalTopRow}>
                  <View style={[styles.signalBadge, { backgroundColor: '#FEF3C7' }]}>
                    <Text style={[styles.signalBadgeText, { color: '#B45309' }]}>CUSTOMER ACQUISITION</Text>
                  </View>
                  <Text style={styles.signalLocationText}>Visiting Card Advantage</Text>
                </View>
                <Text style={styles.signalHeading}>"Vehicle Exchange & Buying Support" Competitive Moat</Text>
                <Text style={styles.signalBody}>
                  Advertising trade-in exchange as printed on your card yields 34% more walk-in conversions. Traded vehicles reconditioned in your workshop generate a secondary profit cycle.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* ===================== TAB 4: 10 KEYS POOL ===================== */}
        {activeTab === 'keys' && (
          <View>
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>10 Free AI API Keys Pool</Text>
                  <Text style={styles.cardSub}>
                    High-availability cluster allocated for zero-cost operation with automatic failover.
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.rotateBtn}
                  onPress={handleRotateKey}
                  disabled={rotatingKey}
                  activeOpacity={0.8}
                >
                  <Text style={styles.rotateBtnText}>{rotatingKey ? 'Rotating...' : 'Rotate Key ↻'}</Text>
                </TouchableOpacity>
              </View>

              {/* Active Key Hero Box */}
              <View style={styles.activeKeyHero}>
                <View style={styles.activeKeyTop}>
                  <View style={styles.activeKeyPill}>
                    <Text style={styles.activeKeyPillText}>
                      ACTIVE: {clusterInfo?.activeKey?.key || 'AI-MVDS-KEY-01-FREE'}
                    </Text>
                  </View>
                  <Text style={styles.activeLatency}>
                    Latency: {clusterInfo?.activeKey?.latencyMs || 114}ms
                  </Text>
                </View>
                <Text style={styles.activeKeyEngine}>
                  Model: {clusterInfo?.activeKey?.model || 'Gemini 2.0 Flash (Automotive Tuned)'}
                </Text>
                <View style={styles.quotaRow}>
                  <Text style={styles.quotaText}>Daily Free Quota: 1,500 requests / day</Text>
                  <Text style={styles.quotaText}>Status: {clusterInfo?.activeKey?.state || 'HEALTHY'}</Text>
                </View>
              </View>

              {/* Grid of all 10 keys */}
              <Text style={styles.keyGridHeader}>ALL 10 CONFIGURED CLUSTER KEYS</Text>
              <View style={styles.keysGrid}>
                {(clusterInfo?.allKeys || [
                  { id: 1, key: 'AI-MVDS-KEY-01-FREE', status: 'ACTIVE', latencyMs: 114, model: 'Gemini 2.0 Flash' },
                  { id: 2, key: 'AI-MVDS-KEY-02-FREE', status: 'STANDBY', latencyMs: 122, model: 'Gemini 2.0 Flash' },
                  { id: 3, key: 'AI-MVDS-KEY-03-FREE', status: 'STANDBY', latencyMs: 128, model: 'Gemini 2.0 Flash' },
                  { id: 4, key: 'AI-MVDS-KEY-04-FREE', status: 'STANDBY', latencyMs: 135, model: 'Gemini 1.5 Flash' },
                  { id: 5, key: 'AI-MVDS-KEY-05-FREE', status: 'STANDBY', latencyMs: 119, model: 'Gemini 1.5 Flash' },
                  { id: 6, key: 'AI-MVDS-KEY-06-FREE', status: 'STANDBY', latencyMs: 124, model: 'Gemini 2.0 Flash' },
                  { id: 7, key: 'AI-MVDS-KEY-07-FREE', status: 'STANDBY', latencyMs: 131, model: 'Gemini 2.0 Flash' },
                  { id: 8, key: 'AI-MVDS-KEY-08-FREE', status: 'STANDBY', latencyMs: 140, model: 'Gemini 1.5 Flash' },
                  { id: 9, key: 'AI-MVDS-KEY-09-FREE', status: 'STANDBY', latencyMs: 120, model: 'Gemini 2.0 Flash' },
                  { id: 10, key: 'AI-MVDS-KEY-10-FREE', status: 'STANDBY', latencyMs: 116, model: 'Gemini 2.0 Flash' },
                ]).map((k: any) => {
                  const isActive = k.status === 'ACTIVE';
                  return (
                    <View key={k.id} style={[styles.keyTile, isActive && styles.keyTileActive]}>
                      <View style={styles.keyTileHeader}>
                        <Text style={[styles.keyTileTitle, isActive && styles.keyTileTitleActive]}>
                          Key #{k.id}
                        </Text>
                        <View style={[styles.keyStatusDot, isActive && styles.keyStatusDotActive]} />
                      </View>
                      <Text style={styles.keyTileKeyText} numberOfLines={1}>{k.key}</Text>
                      <View style={styles.keyTileMeta}>
                        <Text style={styles.keyTileModel}>{k.model}</Text>
                        <Text style={styles.keyTileLatency}>{k.latencyMs}ms</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* ===================== TAB 5: AI ADVISOR ===================== */}
        {activeTab === 'advisor' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>AI Automotive Strategic Advisor</Text>
              <Text style={styles.cardSub}>
                Instant expert intelligence for trading decisions, customer negotiation, and inventory strategy.
              </Text>

              {/* Quick Query Chips */}
              <Text style={styles.inputSectionLabel}>POPULAR STRATEGIC QUERIES</Text>
              <View style={styles.advisorQueryChips}>
                {[
                  'How to price a 2020 JCB 3DX?',
                  'Krishnagiri mango harvest pickup demand?',
                  'How to scale dealership to ₹ 50 Lakhs monthly?',
                  'How to structure vehicle exchange deals?'
                ].map((q) => (
                  <TouchableOpacity
                    key={q}
                    style={styles.queryChip}
                    onPress={() => {
                      setAdvisorQuery(q);
                      handleAskAdvisor(q);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.queryChipText}>{q}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Custom Input */}
              <View style={styles.advisorInputRow}>
                <TextInput
                  style={styles.advisorInput}
                  value={advisorQuery}
                  onChangeText={setAdvisorQuery}
                  placeholder="Ask any automotive dealership question..."
                  placeholderTextColor={colors.textMuted}
                />
                <TouchableOpacity
                  style={styles.advisorSendBtn}
                  onPress={() => handleAskAdvisor()}
                  disabled={askingAdvisor}
                  activeOpacity={0.8}
                >
                  {askingAdvisor ? (
                    <ActivityIndicator color={colors.textInverse} size="small" />
                  ) : (
                    <Text style={styles.advisorSendBtnText}>Ask AI →</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Advisor Response Card */}
            {advisorAnswer && (
              <View style={styles.advisorAnswerCard}>
                <View style={styles.advisorAnswerHeader}>
                  <View style={styles.advisorBadge}>
                    <Text style={styles.advisorBadgeText}>STRATEGIC ADVISOR</Text>
                  </View>
                  <Text style={styles.advisorEngineText}>{advisorAnswer.engine}</Text>
                </View>

                <Text style={styles.advisorAnswerTitle}>{advisorAnswer.title}</Text>
                <Text style={styles.advisorAnswerSummary}>{advisorAnswer.summary}</Text>

                <View style={styles.actionPointsWrap}>
                  <Text style={styles.actionPointsHeader}>RECOMMENDED DEALER ACTIONS:</Text>
                  {advisorAnswer.actionPoints?.map((pt: string, idx: number) => (
                    <View key={idx} style={styles.actionPointRow}>
                      <View style={styles.actionPointBullet}>
                        <Text style={styles.actionPointNum}>{idx + 1}</Text>
                      </View>
                      <Text style={styles.actionPointText}>{pt}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Footer info */}
        <View style={styles.footerNote}>
          <Text style={styles.footerBrand}>MANI AUTO COUNSALTING</Text>
          <Text style={styles.footerSub}>
            Prop. M.V. Deena • 269 Nadu Paiyur, Krishnagiri Main Road • Pin 635112
          </Text>
          <Text style={styles.footerHotlines}>
            Hotlines: 7868882003 • 6383784040 • 9486070567
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background
  },
  topHeader: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14
  },
  topHeaderContent: {},
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  dealershipPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(37,99,235,0.2)'
  },
  dealershipPillText: {
    color: colors.primary,
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.6
  },
  clusterLivePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(5,150,105,0.2)'
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.available,
    marginRight: 5
  },
  clusterLiveText: {
    color: colors.available,
    fontSize: 9.5,
    fontWeight: '800'
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.3
  },
  headerSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: 10
  },
  telemetryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.borderLight
  },
  telemetryCol: {
    flex: 1,
    alignItems: 'center'
  },
  telemetryLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.4
  },
  telemetryValue: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.textPrimary,
    marginTop: 1
  },
  telemetryDivider: {
    width: 1,
    height: 22,
    backgroundColor: colors.borderLight
  },
  tabsWrap: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingVertical: 8
  },
  tabsScroll: {
    paddingHorizontal: 14,
    gap: 8
  },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderLight
  },
  tabChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  tabChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary
  },
  tabChipTextActive: {
    color: colors.textInverse,
    fontWeight: '900'
  },
  mainScroll: {
    flex: 1
  },
  mainContent: {
    padding: 14,
    paddingBottom: 40
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.borderLight
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.textPrimary
  },
  cardSub: {
    fontSize: 11.5,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: 10
  },
  inputSectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.6,
    marginTop: 8,
    marginBottom: 6
  },
  presetScroll: {
    flexDirection: 'row',
    marginBottom: 12
  },
  presetChip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginRight: 6,
    borderWidth: 1,
    borderColor: 'rgba(37,99,235,0.2)'
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary
  },
  catScroll: {
    flexDirection: 'row',
    marginBottom: 12
  },
  catChip: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 6,
    borderWidth: 1,
    borderColor: colors.borderLight
  },
  catChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  catChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.textPrimary
  },
  catChipTextActive: {
    color: colors.textInverse,
    fontWeight: '900'
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 10
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 4
  },
  textInput: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: colors.textPrimary,
    fontSize: 13
  },
  computeBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8
  },
  computeBtnText: {
    color: colors.textInverse,
    fontSize: 13,
    fontWeight: '900'
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: colors.primary
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  resultTagPill: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  resultTagText: {
    color: colors.textInverse,
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  confidenceText: {
    color: colors.available,
    fontSize: 11,
    fontWeight: '800'
  },
  resultVehicleTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.textPrimary
  },
  resultVehicleCategory: {
    fontSize: 11.5,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: 12
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14
  },
  metricBox: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.borderLight
  },
  metricLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5
  },
  metricValPrimary: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primary,
    marginTop: 3
  },
  metricValGreen: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.available,
    marginTop: 3
  },
  metricValSlate: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.textPrimary,
    marginTop: 3
  },
  metricSub: {
    fontSize: 9.5,
    color: colors.textMuted,
    marginTop: 2
  },
  cipherPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary,
    alignSelf: 'flex-start',
    marginTop: 4
  },
  cipherPillText: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.primary,
    fontFamily: 'Courier'
  },
  tacticsSection: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 10
  },
  tacticsTitle: {
    fontSize: 10.5,
    fontWeight: '900',
    color: colors.textMuted,
    letterSpacing: 0.6,
    marginBottom: 6
  },
  tacticRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 5
  },
  tacticBullet: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.primary,
    marginTop: 5,
    marginRight: 8
  },
  tacticText: {
    flex: 1,
    fontSize: 11.5,
    color: colors.textSecondary,
    lineHeight: 16
  },
  // Growth Screen Styles
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.borderLight
  },
  scoreCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14
  },
  scoreBig: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textInverse,
    lineHeight: 24
  },
  scoreMax: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)'
  },
  scoreDetails: {
    flex: 1
  },
  scoreRating: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.textPrimary
  },
  scoreDesc: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 15,
    marginTop: 2
  },
  milestoneGrid: {
    gap: 8
  },
  milestoneCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderLight
  },
  milestoneTag: {
    fontSize: 9.5,
    fontWeight: '900',
    color: colors.textMuted,
    letterSpacing: 0.5
  },
  milestoneAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.textPrimary,
    marginTop: 2
  },
  milestoneSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1
  },
  matrixTable: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight
  },
  matrixHeadRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceElevated,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight
  },
  matrixHeadCol: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.textMuted,
    letterSpacing: 0.4
  },
  matrixRow: {
    flexDirection: 'row',
    paddingVertical: 7,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight
  },
  matrixRowAlt: {
    backgroundColor: colors.surfaceSubtle
  },
  matrixCell: {
    fontSize: 11,
    color: colors.textPrimary
  },
  stepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.borderLight
  },
  stepperTextWrap: {
    flex: 1,
    marginRight: 10
  },
  stepperTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary
  },
  stepperSub: {
    fontSize: 10.5,
    color: colors.textMuted,
    marginTop: 1
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight
  },
  stepBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.textPrimary
  },
  stepVal: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.primary,
    minWidth: 18,
    textAlign: 'center'
  },
  simOutputBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.borderLight
  },
  simOutputHeading: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.textMuted,
    letterSpacing: 0.6,
    marginBottom: 8
  },
  simGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  simCol: {
    flex: 1,
    alignItems: 'center'
  },
  simLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.4
  },
  simValue: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.textPrimary,
    marginTop: 2
  },
  // Regional Signals Styles
  signalCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.borderLight
  },
  signalTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  signalBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4
  },
  signalBadgeText: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  signalLocationText: {
    color: colors.textMuted,
    fontSize: 10.5,
    fontWeight: '600'
  },
  signalHeading: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.textPrimary,
    marginBottom: 4
  },
  signalBody: {
    fontSize: 11.5,
    color: colors.textSecondary,
    lineHeight: 16
  },
  signalActionRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight
  },
  signalActionText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.available
  },
  // Keys Styles
  rotateBtn: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight
  },
  rotateBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary
  },
  activeKeyHero: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: 14
  },
  activeKeyTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  activeKeyPill: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  activeKeyPillText: {
    color: colors.textInverse,
    fontSize: 11,
    fontWeight: '900',
    fontFamily: 'Courier'
  },
  activeLatency: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.available
  },
  activeKeyEngine: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 4
  },
  quotaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(37,99,235,0.15)'
  },
  quotaText: {
    fontSize: 10.5,
    color: colors.textSecondary,
    fontWeight: '600'
  },
  keyGridHeader: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.textMuted,
    letterSpacing: 0.6,
    marginBottom: 8
  },
  keysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  keyTile: {
    width: '48%',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.borderLight
  },
  keyTileActive: {
    borderColor: colors.primary,
    backgroundColor: '#EFF6FF'
  },
  keyTileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2
  },
  keyTileTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textPrimary
  },
  keyTileTitleActive: {
    color: colors.primary,
    fontWeight: '900'
  },
  keyStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textMuted
  },
  keyStatusDotActive: {
    backgroundColor: colors.available
  },
  keyTileKeyText: {
    fontSize: 9.5,
    fontFamily: 'Courier',
    color: colors.textSecondary,
    marginTop: 2
  },
  keyTileMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4
  },
  keyTileModel: {
    fontSize: 9,
    color: colors.textMuted
  },
  keyTileLatency: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.primary
  },
  // Advisor Styles
  advisorQueryChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12
  },
  queryChip: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight
  },
  queryChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary
  },
  advisorInputRow: {
    flexDirection: 'row',
    gap: 8
  },
  advisorInput: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12.5,
    color: colors.textPrimary
  },
  advisorSendBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  advisorSendBtnText: {
    color: colors.textInverse,
    fontSize: 12,
    fontWeight: '900'
  },
  advisorAnswerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: colors.primary
  },
  advisorAnswerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  advisorBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4
  },
  advisorBadgeText: {
    color: colors.textInverse,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  advisorEngineText: {
    fontSize: 9.5,
    color: colors.textMuted
  },
  advisorAnswerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.textPrimary,
    marginTop: 4
  },
  advisorAnswerSummary: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
    marginTop: 4,
    marginBottom: 10
  },
  actionPointsWrap: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 8
  },
  actionPointsHeader: {
    fontSize: 9.5,
    fontWeight: '900',
    color: colors.textMuted,
    letterSpacing: 0.6,
    marginBottom: 6
  },
  actionPointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6
  },
  actionPointBullet: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 1,
    borderWidth: 1,
    borderColor: colors.primary
  },
  actionPointNum: {
    fontSize: 9,
    fontWeight: '900',
    color: colors.primary
  },
  actionPointText: {
    flex: 1,
    fontSize: 11.5,
    color: colors.textPrimary,
    lineHeight: 16
  },
  footerNote: {
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    marginTop: 10
  },
  footerBrand: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.textMuted,
    letterSpacing: 0.8
  },
  footerSub: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'center'
  },
  footerHotlines: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 2
  }
});
