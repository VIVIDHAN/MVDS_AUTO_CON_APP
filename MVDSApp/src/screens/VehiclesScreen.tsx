import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Alert
} from 'react-native';
import { colors } from '../theme/colors';
import { api } from '../api/client';
import { Vehicle } from '../types';
import { VehicleCard } from '../components/VehicleCard';

interface VehiclesScreenProps {
  onSelectVehicle: (vehicle: Vehicle) => void;
  onNavigateToAddVehicle: () => void;
  onMarkSold: (vehicle: Vehicle) => void;
  initialCustomerMode?: boolean;
}

export const VehiclesScreen: React.FC<VehiclesScreenProps> = ({
  onSelectVehicle,
  onNavigateToAddVehicle,
  onMarkSold,
  initialCustomerMode = false
}) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isCustomerMode, setIsCustomerMode] = useState(initialCustomerMode);

  // All 10 Categories from Visiting Card (A to Z)
  const categoryOptions = [
    { key: 'ALL', label: 'All A-to-Z' },
    { key: 'Cars', label: 'Cars' },
    { key: 'Two Wheelers', label: 'Two Wheelers' },
    { key: 'JCB / Earth Movers', label: 'JCB / Earth Movers' },
    { key: 'Tractors', label: 'Tractors' },
    { key: 'Pickup', label: 'Pickup' },
    { key: 'Tippers', label: 'Tippers' },
    { key: 'Trucks', label: 'Trucks' },
    { key: 'Buses', label: 'Buses' },
    { key: 'Vans', label: 'Vans' },
    { key: 'Special Vehicles', label: 'Special Vehicles' }
  ];

  const statusOptions = [
    { key: 'ALL', label: 'All Stock' },
    { key: 'AVAILABLE', label: 'In Showroom' },
    { key: 'SOLD', label: 'Sold Deals' },
    { key: 'BOOKED', label: 'Booked' }
  ];

  const fetchVehicles = useCallback(async () => {
    try {
      const res = await api.getVehicles({
        status: selectedStatus === 'ALL' ? undefined : selectedStatus,
        q: searchQuery
      });
      if (res.success) {
        setVehicles(res.vehicles);
      }
    } catch (err) {
      console.error('Fetch vehicles error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedStatus, searchQuery]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchVehicles();
  };

  // Filter by category locally
  const filteredVehicles = vehicles.filter((v) => {
    if (selectedCategory === 'ALL') return true;
    const cat = (v.vehicle_type || '').toLowerCase();
    const sel = selectedCategory.toLowerCase();
    if (sel.includes('jcb') && (cat.includes('jcb') || cat.includes('earth'))) return true;
    if (sel.includes('special') && (cat.includes('special') || cat.includes('crane'))) return true;
    return cat.includes(sel);
  });

  const toggleCustomerMode = () => {
    if (isCustomerMode) {
      setIsCustomerMode(false);
      Alert.alert('Dealer Mode Activated', 'Full dealer margins, bought prices and price codes are now visible.');
    } else {
      setIsCustomerMode(true);
      Alert.alert(
        'Customer Showcase Mode',
        'Confidential acquisition costs and profit ciphers are now hidden. Safe for customer viewing.'
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Showroom Top Header */}
      <View style={[styles.header, isCustomerMode && styles.headerCustomer]}>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerSub}>
            {isCustomerMode ? 'CUSTOMER SHOWCASE VIEW' : 'MANI AUTO COUNSALTING'}
          </Text>
          <Text style={styles.headerTitle}>
            {isCustomerMode ? 'Vehicle Collection' : 'Showroom Inventory'}
          </Text>
          <Text style={styles.headerLocation}>
            Prop. M.V. Deena • Krishnagiri Main Road
          </Text>
        </View>

        <View style={styles.headerActions}>
          {/* Mode Switcher Button */}
          <TouchableOpacity
            style={[styles.modeToggleBtn, isCustomerMode && styles.modeToggleBtnActive]}
            onPress={toggleCustomerMode}
            activeOpacity={0.8}
          >
            <Text style={[styles.modeToggleText, isCustomerMode && styles.modeToggleTextActive]}>
              {isCustomerMode ? 'Exit Customer Mode' : 'Customer Mode'}
            </Text>
          </TouchableOpacity>

          {!isCustomerMode && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={onNavigateToAddVehicle}
              activeOpacity={0.8}
            >
              <Text style={styles.addButtonText}>+ Add Vehicle</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Customer Mode Notice Banner */}
      {isCustomerMode && (
        <View style={styles.customerNoticeBanner}>
          <View style={styles.shieldDot} />
          <Text style={styles.customerNoticeText}>
            Customer Safe View Active: Confidential dealer costs and price codes are hidden. Call: 7868882003
          </Text>
        </View>
      )}

      {/* 2. Quick Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <Text style={styles.searchPrefix}>SEARCH</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={isCustomerMode ? "Search cars, tractors, JCB, bikes..." : "Search by name, reg number, price code..."}
            placeholderTextColor={colors.textSubtle}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
              <Text style={styles.clearSearch}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 3. All 10 Visiting Card Categories (Horizontal Scrolling Chips) */}
      <View style={styles.categoryChipsSection}>
        <Text style={styles.categorySectionLabel}>ALL TYPES OF VEHICLES - A TO Z</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categoryOptions.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
                onPress={() => setSelectedCategory(cat.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextSelected]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 4. Status Filter Pills (In Stock, Sold) */}
      {!isCustomerMode && (
        <View style={styles.statusChipsSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusScroll}>
            {statusOptions.map((st) => {
              const isSelected = selectedStatus === st.key;
              return (
                <TouchableOpacity
                  key={st.key}
                  style={[styles.statusChip, isSelected && styles.statusChipSelected]}
                  onPress={() => setSelectedStatus(st.key)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.statusChipText, isSelected && styles.statusChipTextSelected]}>
                    {st.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Showroom Vehicle Grid */}
      {loading && !refreshing ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.loaderText}>Syncing vehicle fleet with MySQL...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredVehicles}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <VehicleCard
              vehicle={item}
              onPress={onSelectVehicle}
              onMarkSold={onMarkSold}
              isCustomerMode={isCustomerMode}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Vehicles Found</Text>
              <Text style={styles.emptySub}>
                {searchQuery || selectedCategory !== 'ALL'
                  ? 'Try selecting another category or clear your search query.'
                  : 'No vehicles registered in this category yet.'}
              </Text>
              {!isCustomerMode && (
                <TouchableOpacity style={styles.emptyButton} onPress={onNavigateToAddVehicle}>
                  <Text style={styles.emptyButtonText}>Add New Vehicle</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  headerCustomer: {
    backgroundColor: '#F8FAFC',
    borderBottomColor: colors.primary
  },
  headerTitleWrap: {
    flex: 1,
    marginRight: 10
  },
  headerSub: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 0.8
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
    marginTop: 1
  },
  headerLocation: {
    fontSize: 10.5,
    color: colors.textMuted,
    marginTop: 2
  },
  headerActions: {
    alignItems: 'flex-end',
    gap: 6
  },
  modeToggleBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border
  },
  modeToggleBtnActive: {
    backgroundColor: colors.available,
    borderColor: colors.available
  },
  modeToggleText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.text
  },
  modeToggleTextActive: {
    color: '#FFFFFF'
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  addButtonText: {
    color: colors.textInverse,
    fontSize: 11.5,
    fontWeight: '800'
  },
  customerNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(5,150,105,0.2)'
  },
  shieldDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.available,
    marginRight: 8
  },
  customerNoticeText: {
    fontSize: 10.5,
    color: colors.available,
    fontWeight: '700',
    flex: 1
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    height: 42
  },
  searchPrefix: {
    fontSize: 9.5,
    fontWeight: '900',
    color: colors.primary,
    marginRight: 8,
    letterSpacing: 0.5
  },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
    color: colors.text,
    paddingVertical: 0
  },
  clearBtn: {
    padding: 4
  },
  clearSearch: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600'
  },
  categoryChipsSection: {
    paddingTop: 8,
    paddingBottom: 4
  },
  categorySectionLabel: {
    fontSize: 9.5,
    fontWeight: '900',
    color: colors.textMuted,
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    marginBottom: 6
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 6
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border
  },
  categoryChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  categoryChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.text
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '900'
  },
  statusChipsSection: {
    paddingHorizontal: 16,
    paddingVertical: 4
  },
  statusScroll: {
    gap: 6
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F1F5F9'
  },
  statusChipSelected: {
    backgroundColor: 'rgba(37,99,235,0.12)',
    borderWidth: 1,
    borderColor: colors.primary
  },
  statusChipText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.textMuted
  },
  statusChipTextSelected: {
    color: colors.primary,
    fontWeight: '800'
  },
  listContent: {
    padding: 16,
    paddingBottom: 90
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60
  },
  loaderText: {
    marginTop: 12,
    fontSize: 12,
    color: colors.textMuted
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.text
  },
  emptySub: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18
  },
  emptyButton: {
    marginTop: 18,
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8
  },
  emptyButtonText: {
    color: colors.textInverse,
    fontSize: 12,
    fontWeight: '800'
  }
});
