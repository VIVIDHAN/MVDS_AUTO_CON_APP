import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image
} from 'react-native';
import { colors } from '../theme/colors';
import { User } from '../types';
import { BASE_URL, setCustomBaseUrl } from '../api/config';

interface ProfileScreenProps {
  user: User | null;
  onLogout: () => void;
  onNavigateToCustomers?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onLogout, onNavigateToCustomers }) => {
  const [apiUrl, setApiUrl] = useState(BASE_URL);
  const [showApiEditor, setShowApiEditor] = useState(false);

  const handleUpdateApiUrl = () => {
    setCustomBaseUrl(apiUrl.trim());
    Alert.alert('Configuration Saved', `Backend API Endpoint updated to:\n${apiUrl.trim()}`);
    setShowApiEditor(false);
  };

  const handleConfirmLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of MVDS App?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: onLogout }
    ]);
  };

  const handleShowCipherInfo = () => {
    Alert.alert(
      'Price Cipher Logic (MV-Codes)',
      'The price code is a secret merchant cipher for sales staff to know the minimum selling threshold without revealing acquisition cost to customers.\n\n• For ₹1,00,000+: MV-{Lakhs}L (e.g. MV-4.90L)\n• Below ₹1,00,000: MV-{Thousands}K (e.g. MV-95K)\n\nAuto-calculates acquisition cost + 20-25% target margin.'
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Aura Gold Top Hero Merchant Card */}
      <View style={styles.auraHeroCard}>
        {/* Top Badges Row */}
        <View style={styles.auraHeroTopRow}>
          <View style={styles.auraMerchantBadge}>
            <View style={styles.auraVerifiedDot} />
            <Text style={styles.auraMerchantBadgeText}>VERIFIED DEALERSHIP</Text>
          </View>
          <Text style={styles.auraUidText}>ID: MVDS-2026</Text>
        </View>

        {/* User Identity Row */}
        <View style={styles.auraProfileRow}>
          <View style={styles.auraAvatarContainer}>
            <View style={styles.auraAvatar}>
              <Image
                source={require('../../assets/applogo.png')}
                style={styles.auraAvatarImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.auraKycBadge}>
              <Text style={styles.auraKycText}>KYC</Text>
            </View>
          </View>

          <View style={styles.auraProfileDetails}>
            <Text style={styles.auraUserName}>Prop. M.V. Deena</Text>
            <Text style={styles.auraUserRole}>Proprietor • Mani Auto Counsalting</Text>
            <View style={styles.auraPhoneRow}>
              <Text style={styles.auraPhoneLabel}>Hotlines:</Text>
              <Text style={styles.auraPhoneVal}>+91 7868882003 / 6383784040</Text>
            </View>
          </View>
        </View>

        {/* Asset / Vault Summary Ribbon (Aura Gold Style) */}
        <View style={styles.auraRibbonContainer}>
          <View style={styles.auraRibbonCol}>
            <Text style={styles.auraRibbonLabel}>STOCK CAPITAL</Text>
            <Text style={styles.auraRibbonVal}>₹ 1.04 Cr</Text>
          </View>

          <View style={styles.auraRibbonDivider} />

          <View style={styles.auraRibbonCol}>
            <Text style={styles.auraRibbonLabel}>FLEET SPECTRUM</Text>
            <Text style={[styles.auraRibbonVal, { color: colors.available }]}>10 Categories</Text>
          </View>

          <View style={styles.auraRibbonDivider} />

          <View style={styles.auraRibbonCol}>
            <Text style={styles.auraRibbonLabel}>DEALINGS</Text>
            <Text style={[styles.auraRibbonVal, { color: colors.primary }]}>Safe & Genuine</Text>
          </View>
        </View>
      </View>

      {/* 2. Grouped Section: Dealership & Shop Info */}
      <Text style={styles.sectionHeader}>DEALERSHIP & SHOWROOM</Text>
      <View style={styles.groupedCard}>
        {/* Item 1 */}
        <TouchableOpacity style={styles.menuRow} activeOpacity={0.7}>
          <View style={[styles.menuIconBox, { backgroundColor: 'rgba(37, 99, 235, 0.08)' }]}>
            <View style={styles.iconBuilding}>
              <View style={styles.buildingRoof} />
              <View style={styles.buildingBody} />
              <View style={styles.buildingDoor} />
            </View>
          </View>
          <View style={styles.menuTextWrap}>
            <Text style={styles.menuTitle}>Mani Auto Counsalting (Buy & Sell)</Text>
            <Text style={styles.menuSubtitle}>269 Nadu Paiyur, Paiyur Post, Krishnagiri Main Road (Pin 635112)</Text>
          </View>
          <Text style={styles.chevronArrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.rowDivider} />

        {/* Item 2 */}
        <TouchableOpacity style={styles.menuRow} activeOpacity={0.7}>
          <View style={[styles.menuIconBox, { backgroundColor: 'rgba(5, 150, 105, 0.08)' }]}>
            <View style={styles.iconGst}>
              <Text style={styles.iconGstText}>A-Z</Text>
            </View>
          </View>
          <View style={styles.menuTextWrap}>
            <Text style={styles.menuTitle}>Core Offerings (Visiting Card)</Text>
            <Text style={styles.menuSubtitle}>Cars, Two Wheelers, JCB, Tractors, Tippers, Trucks, Cranes</Text>
          </View>
          <View style={styles.statusPillGreen}>
            <Text style={styles.statusPillGreenText}>Verified</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.rowDivider} />

        {/* Item 3 */}
        <TouchableOpacity style={styles.menuRow} activeOpacity={0.7}>
          <View style={[styles.menuIconBox, { backgroundColor: 'rgba(37, 99, 235, 0.08)' }]}>
            <View style={styles.iconUserGroup}>
              <View style={styles.userHeadMini} />
              <View style={styles.userBodyMini} />
            </View>
          </View>
          <View style={styles.menuTextWrap}>
            <Text style={styles.menuTitle}>Staff & Role Privileges</Text>
            <Text style={styles.menuSubtitle}>Owner Role • Full Inventory & Ledger Control</Text>
          </View>
          <Text style={styles.chevronArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Grouped Section: Pricing & Margin Cipher */}
      <Text style={styles.sectionHeader}>PRICING & CIPHER SYSTEM</Text>
      <View style={styles.groupedCard}>
        {/* Item 1: Price Cipher */}
        <TouchableOpacity style={styles.menuRow} onPress={handleShowCipherInfo} activeOpacity={0.7}>
          <View style={[styles.menuIconBox, { backgroundColor: 'rgba(5, 150, 105, 0.08)' }]}>
            <Text style={styles.cipherTagText}>#</Text>
          </View>
          <View style={styles.menuTextWrap}>
            <Text style={styles.menuTitle}>Secret Price Cipher (MV-Code)</Text>
            <Text style={styles.menuSubtitle}>Protects acquisition cost from customer quote</Text>
          </View>
          <View style={styles.statusPillGreen}>
            <Text style={styles.statusPillGreenText}>Active</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.rowDivider} />

        {/* Item 2: Currency */}
        <TouchableOpacity style={styles.menuRow} activeOpacity={0.7}>
          <View style={[styles.menuIconBox, { backgroundColor: 'rgba(37, 99, 235, 0.08)' }]}>
            <Text style={styles.rupeeIconText}>₹</Text>
          </View>
          <View style={styles.menuTextWrap}>
            <Text style={styles.menuTitle}>Currency & Valuation</Text>
            <Text style={styles.menuSubtitle}>Indian Rupee (INR) • Lakhs & Thousands</Text>
          </View>
          <View style={styles.statusPillBlue}>
            <Text style={styles.statusPillBlueText}>INR</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 3. Grouped Section: Showroom Operations & Guarantees */}
      <Text style={styles.sectionHeader}>SHOWROOM GUARANTEE & OPERATIONS</Text>
      <View style={styles.groupedCard}>
        <View style={styles.menuRow}>
          <View style={[styles.menuIconBox, { backgroundColor: 'rgba(5, 150, 105, 0.08)' }]}>
            <View style={styles.iconCheckmark}>
              <View style={styles.checkLine1} />
              <View style={styles.checkLine2} />
            </View>
          </View>
          <View style={styles.menuTextWrap}>
            <Text style={styles.menuTitle}>Vehicle Exchange & Buying Support</Text>
            <Text style={styles.menuSubtitle}>Immediate spot valuation & fair appraisal</Text>
          </View>
          <View style={styles.statusPillGreen}>
            <Text style={styles.statusPillGreenText}>Verified</Text>
          </View>
        </View>

        <View style={styles.rowDivider} />

        <View style={styles.menuRow}>
          <View style={[styles.menuIconBox, { backgroundColor: 'rgba(37, 99, 235, 0.08)' }]}>
            <View style={styles.iconShield}>
              <View style={styles.shieldBody} />
            </View>
          </View>
          <View style={styles.menuTextWrap}>
            <Text style={styles.menuTitle}>Safe & Transparent Dealings</Text>
            <Text style={styles.menuSubtitle}>Genuine RTO paperwork & clean ownership</Text>
          </View>
          <View style={styles.statusPillGreen}>
            <Text style={styles.statusPillGreenText}>Active</Text>
          </View>
        </View>
      </View>

      {/* 4. Grouped Section: Network Connection */}
      <Text style={styles.sectionHeader}>SERVER HOST CONNECTION</Text>
      <View style={styles.groupedCard}>
        <TouchableOpacity
          style={styles.menuRow}
          onPress={() => setShowApiEditor(!showApiEditor)}
          activeOpacity={0.7}
        >
          <View style={[styles.menuIconBox, { backgroundColor: 'rgba(37, 99, 235, 0.08)' }]}>
            <View style={styles.iconApi}>
              <Text style={styles.iconApiText}>API</Text>
            </View>
          </View>
          <View style={styles.menuTextWrap}>
            <Text style={styles.menuTitle}>Backend Server Host</Text>
            <Text style={styles.menuSubtitle} numberOfLines={1}>{apiUrl}</Text>
          </View>
          <Text style={styles.editToggleText}>{showApiEditor ? 'Hide' : 'Configure'}</Text>
        </TouchableOpacity>

        {/* Collapsible API Configuration Sub-panel */}
        {showApiEditor && (
          <View style={styles.apiEditorWrap}>
            <Text style={styles.apiInputLabel}>BACKEND API HOST</Text>
            <TextInput
              style={styles.apiInput}
              value={apiUrl}
              onChangeText={setApiUrl}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="http://10.0.2.2:5001/api"
              placeholderTextColor={colors.textMuted}
            />

            <TouchableOpacity
              style={styles.apiSaveBtn}
              onPress={handleUpdateApiUrl}
              activeOpacity={0.8}
            >
              <Text style={styles.apiSaveBtnText}>Save Connection</Text>
            </TouchableOpacity>

            <Text style={styles.presetHeading}>Quick Preset Hosts:</Text>
            <View style={styles.presetButtonsRow}>
              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => setApiUrl('http://10.0.2.2:5001/api')}
              >
                <Text style={styles.presetChipText}>Android Emulator (10.0.2.2)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => setApiUrl('http://192.168.31.175:5001/api')}
              >
                <Text style={styles.presetChipText}>Wi-Fi IP (192.168.31.175)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => setApiUrl('http://localhost:5001/api')}
              >
                <Text style={styles.presetChipText}>Localhost (5001)</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* 6. Sign Out Action Button */}
      <TouchableOpacity
        style={styles.auraLogoutBtn}
        onPress={handleConfirmLogout}
        activeOpacity={0.8}
      >
        <Text style={styles.auraLogoutText}>Sign Out of MVDS App</Text>
      </TouchableOpacity>

      {/* 7. App Info & Version Footer */}
      <View style={styles.footerWrap}>
        <Text style={styles.footerBrand}>MANI AUTO COUNSALTING (BUY AND SELL)</Text>
        <Text style={styles.footerVersion}>Prop. M.V. Deena • "Your Dream Vehicle, Our Priority"</Text>
        <Text style={styles.footerSub}>269 Nadu Paiyur, Paiyur Post, Krishnagiri Pin 635112</Text>
        <Text style={[styles.footerSub, { marginTop: 4, color: colors.primary, fontWeight: '700' }]}>
          Hotlines: 7868882003 • 6383784040 • 9486070567
        </Text>
      </View>
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
    paddingBottom: 40
  },

  // 1. Aura Gold Hero Merchant Card
  auraHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3
  },
  auraHeroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  auraMerchantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentGreenBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.accentGreenBorder
  },
  auraVerifiedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.available,
    marginRight: 5
  },
  auraMerchantBadgeText: {
    color: colors.available,
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  auraUidText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'Courier'
  },
  auraProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  auraAvatarContainer: {
    position: 'relative',
    marginRight: 14
  },
  auraAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 3
  },
  auraAvatarImage: {
    width: '100%',
    height: '100%'
  },
  auraKycBadge: {
    position: 'absolute',
    bottom: -2,
    right: -4,
    backgroundColor: colors.available,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF'
  },
  auraKycText: {
    color: '#FFFFFF',
    fontSize: 7.5,
    fontWeight: '900'
  },
  auraProfileDetails: {
    flex: 1
  },
  auraUserName: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3
  },
  auraUserRole: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 1
  },
  auraPhoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3
  },
  auraPhoneLabel: {
    color: colors.textMuted,
    fontSize: 11,
    marginRight: 4
  },
  auraPhoneVal: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'Courier'
  },

  // Vault / Asset Ribbon inside Aura Card
  auraRibbonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  auraRibbonCol: {
    flex: 1,
    alignItems: 'center'
  },
  auraRibbonLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2
  },
  auraRibbonVal: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '900',
    fontFamily: 'Courier'
  },
  auraRibbonDivider: {
    width: 1,
    height: 22,
    backgroundColor: colors.borderLight
  },

  // 2. Section Headers
  sectionHeader: {
    color: colors.textMuted,
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
    marginTop: 4
  },

  // Grouped Cards (Aura Gold Signature)
  groupedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13
  },
  menuIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  menuTextWrap: {
    flex: 1
  },
  menuTitle: {
    color: colors.textPrimary,
    fontSize: 13.5,
    fontWeight: '800'
  },
  menuSubtitle: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2
  },
  chevronArrow: {
    color: colors.textSubtle,
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8
  },
  rowDivider: {
    height: 1,
    backgroundColor: colors.border
  },

  // Status Pills
  statusPillGreen: {
    backgroundColor: colors.accentGreenBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.accentGreenBorder,
    flexDirection: 'row',
    alignItems: 'center'
  },
  statusPillGreenText: {
    color: colors.available,
    fontSize: 10,
    fontWeight: '800'
  },
  statusPillBlue: {
    backgroundColor: colors.soldBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.soldBorder
  },
  statusPillBlueText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800'
  },
  editToggleText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800'
  },

  // API Configurator Subpanel
  apiEditorWrap: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: colors.border
  },
  apiInputLabel: {
    color: colors.textMuted,
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6
  },
  apiInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderActive,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    fontFamily: 'Courier',
    color: colors.textPrimary,
    marginBottom: 10
  },
  apiSaveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
    marginBottom: 10
  },
  apiSaveBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800'
  },
  presetHeading: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 6
  },
  presetButtonsRow: {
    gap: 6
  },
  presetChip: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border
  },
  presetChipText: {
    color: colors.textSecondary,
    fontSize: 10.5,
    fontWeight: '700'
  },

  // Vector Geometric Menu Icons
  iconBuilding: {
    width: 14,
    height: 14,
    alignItems: 'center'
  },
  buildingRoof: {
    width: 12,
    height: 3,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    backgroundColor: colors.primary
  },
  buildingBody: {
    width: 12,
    height: 9,
    borderWidth: 1.5,
    borderColor: colors.primary,
    marginTop: 1
  },
  buildingDoor: {
    width: 4,
    height: 4,
    backgroundColor: colors.primary,
    position: 'absolute',
    bottom: 0
  },
  iconGst: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconGstText: {
    color: colors.available,
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  iconUserGroup: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  userHeadMini: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary
  },
  userBodyMini: {
    width: 12,
    height: 5,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    backgroundColor: colors.primary,
    marginTop: 1
  },
  iconDb: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  dbDisc: {
    width: 12,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.available
  },
  iconApi: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconApiText: {
    color: colors.primary,
    fontSize: 9.5,
    fontWeight: '900'
  },
  iconStorage: {
    width: 14,
    height: 14,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 2,
    position: 'relative'
  },
  storageFrame: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    right: 2,
    height: 3,
    backgroundColor: colors.primary
  },
  storageSun: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.primary
  },
  cipherTagText: {
    color: colors.available,
    fontSize: 16,
    fontWeight: '900'
  },
  rupeeIconText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '900'
  },
  iconShield: {
    width: 12,
    height: 14,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6
  },
  shieldBody: {
    flex: 1
  },
  iconCheckmark: {
    width: 12,
    height: 12,
    position: 'relative'
  },
  checkLine1: {
    width: 4,
    height: 1.5,
    backgroundColor: colors.available,
    position: 'absolute',
    bottom: 3,
    left: 1,
    transform: [{ rotate: '45deg' }]
  },
  checkLine2: {
    width: 8,
    height: 1.5,
    backgroundColor: colors.available,
    position: 'absolute',
    bottom: 5,
    left: 3,
    transform: [{ rotate: '-45deg' }]
  },

  // 6. Sign Out Button
  auraLogoutBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 20
  },
  auraLogoutText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '800'
  },

  // 7. Footer
  footerWrap: {
    alignItems: 'center',
    paddingBottom: 20
  },
  footerBrand: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8
  },
  footerVersion: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 3
  },
  footerSub: {
    color: colors.textSubtle,
    fontSize: 9.5,
    marginTop: 2
  }
});
