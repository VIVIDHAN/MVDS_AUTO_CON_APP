import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export type NavTabType = 'dashboard' | 'vehicles' | 'ai' | 'customers' | 'profile';

interface TeamsNavBarProps {
  activeTab: NavTabType;
  onTabChange: (tab: NavTabType) => void;
  bottomInset: number;
  inStockVehicleCount?: number;
}

// AI Engine Neural Chip Icon
const AiNavIcon = ({ active }: { active: boolean }) => {
  const c = active ? colors.primary : colors.textMuted;
  return (
    <View style={iconStyles.box}>
      {/* Outer Chip Box */}
      <View
        style={[
          iconStyles.aiChipBox,
          {
            borderColor: c,
            backgroundColor: active ? 'rgba(37,99,235,0.12)' : 'transparent'
          }
        ]}
      >
        <Text style={[iconStyles.aiChipLabel, { color: c }]}>AI</Text>
      </View>
      {/* Top Pins */}
      <View style={[iconStyles.aiPinTop1, { backgroundColor: c }]} />
      <View style={[iconStyles.aiPinTop2, { backgroundColor: c }]} />
      {/* Bottom Pins */}
      <View style={[iconStyles.aiPinBottom1, { backgroundColor: c }]} />
      <View style={[iconStyles.aiPinBottom2, { backgroundColor: c }]} />
      {/* Left/Right Pins */}
      <View style={[iconStyles.aiPinLeft, { backgroundColor: c }]} />
      <View style={[iconStyles.aiPinRight, { backgroundColor: c }]} />
    </View>
  );
};

// 1. Teams Pulse / Activity Bell Icon
const PulseNavIcon = ({ active }: { active: boolean }) => {
  const c = active ? colors.primary : colors.textMuted;
  return (
    <View style={iconStyles.box}>
      {/* Top loop */}
      <View style={[iconStyles.bellLoop, { borderColor: c }]} />
      {/* Bell body */}
      <View
        style={[
          iconStyles.bellBody,
          {
            borderColor: c,
            backgroundColor: active ? colors.primary : 'transparent'
          }
        ]}
      />
      {/* Bell base rim */}
      <View style={[iconStyles.bellRim, { backgroundColor: c }]} />
      {/* Bell clapper */}
      <View style={[iconStyles.bellClapper, { backgroundColor: c }]} />
    </View>
  );
};

// 2. Teams Vehicles / Showroom Car Icon
const VehiclesNavIcon = ({ active }: { active: boolean }) => {
  const c = active ? colors.primary : colors.textMuted;
  return (
    <View style={iconStyles.box}>
      {/* Cabin / Roof */}
      <View
        style={[
          iconStyles.carRoof,
          {
            borderColor: c,
            backgroundColor: active ? 'rgba(37,99,235,0.2)' : 'transparent'
          }
        ]}
      />
      {/* Chassis Body */}
      <View
        style={[
          iconStyles.carBody,
          {
            borderColor: c,
            backgroundColor: active ? colors.primary : 'transparent'
          }
        ]}
      />
      {/* Wheels */}
      <View style={[iconStyles.carWheelLeft, { backgroundColor: c }]} />
      <View style={[iconStyles.carWheelRight, { backgroundColor: c }]} />
    </View>
  );
};

// 3. Teams Dealership / Showroom Storefront Icon
const DealershipNavIcon = ({ active }: { active: boolean }) => {
  const c = active ? colors.primary : colors.textMuted;
  return (
    <View style={iconStyles.box}>
      {/* Storefront Roof / Pediment */}
      <View style={[iconStyles.shopRoof, { borderColor: c }]} />
      {/* Showroom Window / Door Pillars */}
      <View
        style={[
          iconStyles.shopBody,
          {
            borderColor: c,
            backgroundColor: active ? 'rgba(37,99,235,0.1)' : 'transparent'
          }
        ]}
      >
        <View style={[iconStyles.shopPillar, { backgroundColor: c }]} />
        <View style={[iconStyles.shopDoor, { borderColor: c }]} />
        <View style={[iconStyles.shopPillar, { backgroundColor: c }]} />
      </View>
    </View>
  );
};

// 4. Teams Clients / Directory Users Icon
const ClientsNavIcon = ({ active }: { active: boolean }) => {
  const c = active ? colors.primary : colors.textMuted;
  return (
    <View style={iconStyles.box}>
      {/* Back User (offset right) */}
      <View style={[iconStyles.userBackHead, { backgroundColor: c, opacity: 0.6 }]} />
      <View style={[iconStyles.userBackBody, { backgroundColor: c, opacity: 0.6 }]} />

      {/* Front User (centered/left) */}
      <View style={[iconStyles.userFrontHead, { backgroundColor: c }]} />
      <View style={[iconStyles.userFrontBody, { backgroundColor: c }]} />
    </View>
  );
};

// 5. Teams Settings / More "..." Icon
const SettingsNavIcon = ({ active }: { active: boolean }) => {
  const c = active ? colors.primary : colors.textMuted;
  return (
    <View style={iconStyles.box}>
      <View
        style={[
          iconStyles.moreBox,
          {
            borderColor: active ? colors.primary : colors.borderLight,
            backgroundColor: active ? 'rgba(37,99,235,0.08)' : 'transparent'
          }
        ]}
      >
        <View style={[iconStyles.moreDot, { backgroundColor: c }]} />
        <View style={[iconStyles.moreDot, { backgroundColor: c }]} />
        <View style={[iconStyles.moreDot, { backgroundColor: c }]} />
      </View>
    </View>
  );
};

export const TeamsNavBar: React.FC<TeamsNavBarProps> = ({
  activeTab,
  onTabChange,
  bottomInset,
  inStockVehicleCount = 0
}) => {
  const tabs = [
    {
      id: 'dashboard' as NavTabType,
      label: 'Pulse',
      icon: <PulseNavIcon active={activeTab === 'dashboard'} />
    },
    {
      id: 'vehicles' as NavTabType,
      label: 'Vehicles',
      icon: <VehiclesNavIcon active={activeTab === 'vehicles'} />,
      badge: inStockVehicleCount > 0 ? `${inStockVehicleCount}` : undefined,
      badgeColor: colors.primary
    },
    {
      id: 'ai' as NavTabType,
      label: 'AI Engine',
      icon: <AiNavIcon active={activeTab === 'ai'} />
    },
    {
      id: 'customers' as NavTabType,
      label: 'Clients',
      icon: <ClientsNavIcon active={activeTab === 'customers'} />
    },
    {
      id: 'profile' as NavTabType,
      label: 'Dealership',
      icon: <DealershipNavIcon active={activeTab === 'profile'} />
    }
  ];

  return (
    <View style={[styles.container, { paddingBottom: Math.max(bottomInset, 10) }]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabButton}
            onPress={() => onTabChange(tab.id)}
            activeOpacity={0.7}
          >
            {/* Active Top Bar Pill (Teams Style) */}
            <View
              style={[
                styles.topBarPill,
                isActive && styles.topBarPillActive
              ]}
            />

            {/* Icon Container with Optional Badge */}
            <View style={styles.iconContainer}>
              {tab.icon}
              {tab.badge && (
                <View
                  style={[
                    styles.badgePill,
                    { backgroundColor: tab.badgeColor || colors.primary }
                  ]}
                >
                  <Text style={styles.badgeText}>{tab.badge}</Text>
                </View>
              )}
            </View>

            {/* Label Underneath */}
            <Text
              style={[
                styles.tabLabel,
                isActive ? styles.tabLabelActive : styles.tabLabelInactive
              ]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 4,
    paddingHorizontal: 4,
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 10
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    minHeight: 52
  },
  topBarPill: {
    width: 24,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'transparent',
    marginBottom: 4
  },
  topBarPillActive: {
    backgroundColor: colors.primary
  },
  iconContainer: {
    width: 28,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  badgePill: {
    position: 'absolute',
    top: -3,
    right: -8,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF'
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
    lineHeight: 10
  },
  tabLabel: {
    fontSize: 10.5,
    marginTop: 3,
    letterSpacing: 0.1
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '800'
  },
  tabLabelInactive: {
    color: colors.textMuted,
    fontWeight: '600'
  }
});

const iconStyles = StyleSheet.create({
  box: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  // Pulse / Bell Icon
  bellLoop: {
    width: 5,
    height: 4,
    borderTopLeftRadius: 2.5,
    borderTopRightRadius: 2.5,
    borderWidth: 1.5,
    borderBottomWidth: 0,
    position: 'absolute',
    top: 2
  },
  bellBody: {
    width: 14,
    height: 11,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    borderWidth: 1.5,
    position: 'absolute',
    top: 5
  },
  bellRim: {
    width: 17,
    height: 2,
    borderRadius: 1,
    position: 'absolute',
    bottom: 5
  },
  bellClapper: {
    width: 4,
    height: 3,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    position: 'absolute',
    bottom: 2
  },

  // Vehicles / Car Icon
  carRoof: {
    width: 12,
    height: 6,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    borderWidth: 1.5,
    position: 'absolute',
    top: 4
  },
  carBody: {
    width: 20,
    height: 7,
    borderRadius: 2,
    borderWidth: 1.5,
    position: 'absolute',
    top: 9
  },
  carWheelLeft: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    bottom: 3,
    left: 4
  },
  carWheelRight: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    bottom: 3,
    right: 4
  },

  // Dealership / Storefront Icon
  shopRoof: {
    width: 19,
    height: 5,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    borderWidth: 1.5,
    borderBottomWidth: 0,
    position: 'absolute',
    top: 3
  },
  shopBody: {
    width: 17,
    height: 11,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    borderWidth: 1.5,
    position: 'absolute',
    top: 8,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    paddingBottom: 1
  },
  shopPillar: {
    width: 2,
    height: 7,
    borderRadius: 1
  },
  shopDoor: {
    width: 5,
    height: 6,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    borderWidth: 1,
    borderBottomWidth: 0
  },

  // Clients / Users Icon
  userBackHead: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    position: 'absolute',
    top: 4,
    right: 3
  },
  userBackBody: {
    width: 9,
    height: 6,
    borderTopLeftRadius: 4.5,
    borderTopRightRadius: 4.5,
    position: 'absolute',
    top: 10,
    right: 1
  },
  userFrontHead: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    top: 5,
    left: 4
  },
  userFrontBody: {
    width: 13,
    height: 7,
    borderTopLeftRadius: 6.5,
    borderTopRightRadius: 6.5,
    position: 'absolute',
    bottom: 5,
    left: 1
  },

  // Settings / More "..." Icon
  moreBox: {
    width: 22,
    height: 16,
    borderRadius: 5,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 2
  },
  moreDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5
  },

  // AI Chip Icon
  aiChipBox: {
    width: 17,
    height: 17,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  aiChipLabel: {
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: -0.5
  },
  aiPinTop1: {
    width: 2,
    height: 3,
    position: 'absolute',
    top: 1,
    left: 6
  },
  aiPinTop2: {
    width: 2,
    height: 3,
    position: 'absolute',
    top: 1,
    right: 6
  },
  aiPinBottom1: {
    width: 2,
    height: 3,
    position: 'absolute',
    bottom: 1,
    left: 6
  },
  aiPinBottom2: {
    width: 2,
    height: 3,
    position: 'absolute',
    bottom: 1,
    right: 6
  },
  aiPinLeft: {
    width: 3,
    height: 2,
    position: 'absolute',
    left: 0.5,
    top: 11
  },
  aiPinRight: {
    width: 3,
    height: 2,
    position: 'absolute',
    right: 0.5,
    top: 11
  }
});
