import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  accentColor?: string;
  badgeText?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  accentColor = colors.primary,
  badgeText
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {badgeText && (
          <View style={[styles.badge, { backgroundColor: `${accentColor}14` }]}>
            <Text style={[styles.badgeText, { color: accentColor }]}>{badgeText}</Text>
          </View>
        )}
      </View>
      <Text style={styles.value}>{value}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  title: {
    color: '#64748B',
    fontSize: 10.5,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.3
  },
  value: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.3,
    marginBottom: 3
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600'
  }
});
