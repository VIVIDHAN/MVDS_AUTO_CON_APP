import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface StatusBadgeProps {
  status: 'AVAILABLE' | 'SOLD' | 'IN_SERVICE' | 'BOOKED' | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md'
}) => {
  const getStatusConfig = () => {
    switch (status?.toUpperCase()) {
      case 'AVAILABLE':
        return {
          label: 'IN STOCK',
          color: colors.available,
          bg: colors.availableBg,
          border: colors.availableBorder
        };
      case 'SOLD':
        return {
          label: 'SOLD',
          color: colors.sold,
          bg: colors.soldBg,
          border: colors.soldBorder
        };
      case 'IN_SERVICE':
        return {
          label: 'IN WORKSHOP',
          color: colors.inService,
          bg: colors.inServiceBg,
          border: colors.inServiceBorder
        };
      case 'BOOKED':
        return {
          label: 'RESERVED',
          color: colors.booked,
          bg: colors.bookedBg,
          border: colors.bookedBorder
        };
      default:
        return {
          label: status,
          color: colors.textSecondary,
          bg: colors.surfaceSubtle,
          border: colors.border
        };
    }
  };

  const config = getStatusConfig();
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bg,
          borderColor: config.border
        },
        isSm && styles.badgeSm,
        isLg && styles.badgeLg
      ]}
    >
      <View
        style={[
          styles.dot,
          { backgroundColor: config.color },
          isSm && styles.dotSm,
          isLg && styles.dotLg
        ]}
      />
      <Text
        style={[
          styles.text,
          { color: config.color },
          isSm && styles.textSm,
          isLg && styles.textLg
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 16,
    borderWidth: 1.2
  },
  badgeSm: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 12
  },
  badgeLg: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 20
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5
  },
  dotSm: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 4
  },
  dotLg: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 7
  },
  text: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.4
  },
  textSm: {
    fontSize: 9.5,
    fontWeight: '800'
  },
  textLg: {
    fontSize: 12,
    fontWeight: '900'
  }
});
