import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar, Image } from 'react-native';
import { colors } from '../theme/colors';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true
      })
    ]).start();

    const timer = setTimeout(() => {
      onFinish();
    }, 1800);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, onFinish]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        {/* Official Brand Logo */}
        <View style={styles.logoWrap}>
          <Image
            source={require('../../assets/applogo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.proprietorText}>Prop. M.V. Deena</Text>
        <Text style={styles.subtitle}>All Types of Vehicles A to Z • Krishnagiri</Text>

        <View style={styles.badgeWrap}>
          <Text style={styles.badgeText}>AUTHORIZED SHOWROOM SUITE</Text>
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Hotlines: 7868882003 • 6383784040 • 9486070567</Text>
        <Text style={styles.versionText}>269 Nadu Paiyur, Krishnagiri Main Road • Pin 635112</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoWrap: {
    width: 260,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  logoImage: {
    width: '100%',
    height: '100%'
  },
  proprietorText: {
    color: colors.primaryDark,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 4
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 12.5,
    fontWeight: '600',
    marginBottom: 16
  },
  badgeWrap: {
    backgroundColor: colors.accentGreenBg,
    borderColor: colors.accentGreenBorder,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20
  },
  badgeText: {
    color: colors.accentGreen,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1
  },
  footer: {
    position: 'absolute',
    bottom: 36,
    alignItems: 'center'
  },
  footerText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700'
  },
  versionText: {
    color: colors.textMuted,
    fontSize: 9.5,
    marginTop: 3
  }
});
