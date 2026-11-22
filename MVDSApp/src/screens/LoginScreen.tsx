import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Animated,
  Easing,
  Image
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { api } from '../api/client';
import { User } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('1234567890');
  const [password, setPassword] = useState('reset123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Focus tracking for interactive UI states
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Smooth Entrance Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      })
    ]).start();

    // Subtle pulse for live status dot
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.25,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ])
    ).start();
  }, [fadeAnim, slideAnim, pulseAnim]);

  const handlePressIn = () => {
    Animated.spring(btnScale, {
      toValue: 0.98,
      useNativeDriver: true
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(btnScale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true
    }).start();
  };

  const fillTestCredentials = () => {
    setPhone('1234567890');
    setPassword('reset123');
    setErrorMessage(null);
  };

  const handleLogin = async () => {
    if (!phone.trim() || !password.trim()) {
      setErrorMessage('Please enter both mobile number and password.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await api.login(phone.trim(), password.trim());
      if (response.success && response.user) {
        onLoginSuccess(response.user);
      } else {
        setErrorMessage(response.message || 'Login failed. Please verify credentials.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMessage(err.message || 'Unable to connect to backend server. Ensure MySQL and server are running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" />

      {/* Deep Royal Brand Top Backdrop */}
      <View style={styles.topBackdrop}>
        {/* Official Brand Logo Illuminated Card */}
        <View style={styles.logoCardWrapper}>
          <Image
            source={require('../../assets/applogo.png')}
            style={styles.officialLogoImage}
            resizeMode="contain"
          />
        </View>

        {/* Proprietor & Fleet Spectrum */}
        <Text style={styles.proprietorText}>Prop. M.V. Deena</Text>
        <Text style={styles.brandTagline}>Buy & Sell • All Types of Vehicles A to Z • Krishnagiri</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.animatedContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Main Floating Elevated Login Card */}
          <View style={styles.loginCard}>
            {/* Card Header Row */}
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>Dealer Portal Sign In</Text>
                <Text style={styles.cardSubtitle}>
                  Access showroom fleet, AI price cipher & customer records
                </Text>
              </View>
              <View style={styles.securityBadge}>
                <View style={styles.lockIconBox}>
                  <View style={styles.lockShackle} />
                  <View style={styles.lockBody} />
                </View>
                <Text style={styles.securityText}>256-Bit SSL</Text>
              </View>
            </View>

            {/* Error Message Alert */}
            {errorMessage && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            {/* Mobile Number Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>REGISTERED MOBILE NUMBER</Text>
              <View style={[styles.inputWrapper, phoneFocused && styles.inputWrapperFocused]}>
                <View style={styles.prefixPill}>
                  <Text style={styles.prefixText}>+91</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="10-digit phone number"
                  placeholderTextColor={colors.textMuted}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  onFocus={() => setPhoneFocused(true)}
                  onBlur={() => setPhoneFocused(false)}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>DEALER SECURITY PASSWORD</Text>
              <View style={[styles.inputWrapper, passwordFocused && styles.inputWrapperFocused]}>
                <TextInput
                  style={[styles.textInput, { flex: 1 }]}
                  placeholder="Enter secret password"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.toggleBtn}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.toggleBtnText}>{showPassword ? 'HIDE' : 'SHOW'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Animated Sign-In Button */}
            <Animated.View style={{ transform: [{ scale: btnScale }] }}>
              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleLogin}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={loading}
                activeOpacity={0.9}
              >
                {loading ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator color={colors.textInverse} size="small" />
                    <Text style={styles.loadingText}>Authenticating with Showroom Vault...</Text>
                  </View>
                ) : (
                  <Text style={styles.submitButtonText}>Sign In to Showroom Portal →</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Discreet One-Tap Demo Helper Chip */}
            <TouchableOpacity
              style={styles.demoFillChip}
              onPress={fillTestCredentials}
              activeOpacity={0.75}
            >
              <View style={styles.demoDot} />
              <Text style={styles.demoFillText}>
                Demo Account: <Text style={styles.demoFillBold}>1234567890 / reset123</Text> (Tap to Auto-Fill)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Clean Commercial Footer */}
          <View style={styles.footerWrap}>
            <Text style={styles.footerLocation}>
              269 Nadu Paiyur, Krishnagiri Main Road • Pin 635112
            </Text>
            <Text style={styles.footerHotlines}>
              Hotlines: 7868882003 • 6383784040 • 9486070567
            </Text>
            <Text style={styles.footerMotto}>
              "Your Dream Vehicle, Our Priority" • Safe & Transparent Dealings
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9'
  },
  topBackdrop: {
    backgroundColor: '#0F172A',
    paddingTop: 24,
    paddingBottom: 42,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28
  },
  logoCardWrapper: {
    width: 240,
    height: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)'
  },
  officialLogoImage: {
    width: '100%',
    height: '100%'
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37,99,235,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(37,99,235,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 12,
    marginBottom: 8,
    gap: 6
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.available
  },
  brandBadgeText: {
    color: '#93C5FD',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.8
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.2,
    textAlign: 'center'
  },
  brandTagline: {
    color: '#94A3B8',
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginTop: 2,
    textAlign: 'center'
  },
  proprietorText: {
    color: '#60A5FA',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4,
    textAlign: 'center'
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    marginTop: -24,
    paddingBottom: 24
  },
  animatedContainer: {
    width: '100%'
  },
  loginCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.06)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.2
  },
  cardSubtitle: {
    fontSize: 11.5,
    color: colors.textMuted,
    marginTop: 2,
    maxWidth: 240,
    lineHeight: 15
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 4
  },
  lockIconBox: {
    alignItems: 'center',
    width: 8,
    height: 10
  },
  lockShackle: {
    width: 6,
    height: 4,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    borderWidth: 1,
    borderColor: colors.available,
    borderBottomWidth: 0
  },
  lockBody: {
    width: 8,
    height: 5,
    borderRadius: 1,
    backgroundColor: colors.available
  },
  securityText: {
    color: colors.available,
    fontSize: 9.5,
    fontWeight: '800'
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 14
  },
  errorText: {
    color: '#DC2626',
    fontSize: 11.5,
    fontWeight: '700',
    lineHeight: 16
  },
  inputGroup: {
    marginBottom: 14
  },
  inputLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    height: 48
  },
  inputWrapperFocused: {
    borderColor: colors.primary,
    backgroundColor: '#EFF6FF'
  },
  prefixPill: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.borderLight
  },
  prefixText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '900'
  },
  textInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    paddingVertical: 0
  },
  toggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  toggleBtnText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 6,
    elevation: 3
  },
  submitButtonDisabled: {
    opacity: 0.6
  },
  submitButtonText: {
    color: colors.textInverse,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.3
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  loadingText: {
    color: colors.textInverse,
    fontSize: 12.5,
    fontWeight: '800'
  },
  demoFillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: 6
  },
  demoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary
  },
  demoFillText: {
    fontSize: 11,
    color: colors.textSecondary
  },
  demoFillBold: {
    fontWeight: '800',
    color: colors.primary,
    fontFamily: 'Courier'
  },
  trustRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.borderLight
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  trustBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.available
  },
  trustText: {
    color: colors.textMuted,
    fontSize: 9.5,
    fontWeight: '700'
  },
  trustDivider: {
    width: 1,
    height: 12,
    backgroundColor: colors.borderLight
  },
  footerWrap: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
    gap: 3
  },
  footerLocation: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textAlign: 'center'
  },
  footerHotlines: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 1
  },
  footerMotto: {
    fontSize: 10,
    fontStyle: 'italic',
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'center'
  }
});
