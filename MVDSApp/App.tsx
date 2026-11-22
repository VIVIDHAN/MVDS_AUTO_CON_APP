import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from './src/theme/colors';
import { User, Vehicle } from './src/types';
import { setAuthToken } from './src/api/client';
import { SplashScreen } from './src/screens/SplashScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { VehiclesScreen } from './src/screens/VehiclesScreen';
import { VehicleDetailScreen } from './src/screens/VehicleDetailScreen';
import { AddVehicleScreen } from './src/screens/AddVehicleScreen';
import { CustomersScreen } from './src/screens/CustomersScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { AIEngineScreen } from './src/screens/AIEngineScreen';
import { TeamsNavBar, NavTabType } from './src/components/TeamsNavBar';

type TabKey = NavTabType;

function MainApp(): React.JSX.Element {
  const insets = useSafeAreaInsets();

  // Splash & Auth states
  const [showSplash, setShowSplash] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Tab & Sub-screen navigation states
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | null>(null);
  const [inventoryRefreshKey, setInventoryRefreshKey] = useState(0);

  // 1. Splash Screen
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // 2. Login Screen
  if (!currentUser) {
    return (
      <LoginScreen
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setActiveTab('dashboard');
        }}
      />
    );
  }

  const handleLogout = () => {
    setAuthToken(null, null);
    setCurrentUser(null);
    setSelectedVehicleId(null);
    setShowAddVehicle(false);
  };

  const handleOpenVehicleDetail = (vehicle: Vehicle) => {
    setSelectedVehicleId(vehicle.id);
  };

  const handleOpenAddVehicle = () => {
    setVehicleToEdit(null);
    setShowAddVehicle(true);
  };

  const handleOpenEditVehicle = (vehicle: Vehicle) => {
    setVehicleToEdit(vehicle);
    setShowAddVehicle(true);
  };

  const handleVehicleSaved = () => {
    setShowAddVehicle(false);
    setVehicleToEdit(null);
    setInventoryRefreshKey((prev) => prev + 1);
  };

  // Sub-screens
  let currentContent: React.ReactNode = null;

  if (showAddVehicle) {
    currentContent = (
      <AddVehicleScreen
        vehicleToEdit={vehicleToEdit}
        onBack={() => setShowAddVehicle(false)}
        onSuccess={handleVehicleSaved}
      />
    );
  } else if (selectedVehicleId) {
    currentContent = (
      <VehicleDetailScreen
        vehicleId={selectedVehicleId}
        onBack={() => setSelectedVehicleId(null)}
        onEdit={(v) => {
          setSelectedVehicleId(null);
          handleOpenEditVehicle(v);
        }}
        onVehicleUpdated={() => {
          setInventoryRefreshKey((prev) => prev + 1);
        }}
      />
    );
  } else {
    // Main Tab Screens
    switch (activeTab) {
      case 'dashboard':
        currentContent = (
          <DashboardScreen
            user={currentUser}
            onNavigateToVehicles={() => setActiveTab('vehicles')}
            onNavigateToAddVehicle={handleOpenAddVehicle}
            onNavigateToCustomers={() => setActiveTab('customers')}
            onNavigateToAi={() => setActiveTab('ai')}
            onNavigateToProfile={() => setActiveTab('profile')}
            onSelectVehicle={handleOpenVehicleDetail}
          />
        );
        break;
      case 'vehicles':
        currentContent = (
          <VehiclesScreen
            key={`vehicles-${inventoryRefreshKey}`}
            onSelectVehicle={handleOpenVehicleDetail}
            onNavigateToAddVehicle={handleOpenAddVehicle}
            onMarkSold={handleOpenVehicleDetail}
          />
        );
        break;
      case 'ai':
        currentContent = (
          <AIEngineScreen
            onNavigateToVehicles={() => setActiveTab('vehicles')}
          />
        );
        break;
      case 'customers':
        currentContent = (
          <CustomersScreen
            onNavigateToProfile={() => setActiveTab('profile')}
          />
        );
        break;
      case 'profile':
        currentContent = (
          <ProfileScreen
            user={currentUser}
            onLogout={handleLogout}
            onNavigateToCustomers={() => setActiveTab('customers')}
          />
        );
        break;
    }
  }

  const isSubScreenOpen = showAddVehicle || Boolean(selectedVehicleId);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Main Screen Content Body */}
      <View style={styles.body}>{currentContent}</View>

      {/* Microsoft Teams Style Bottom Navigation Bar */}
      {!isSubScreenOpen && (
        <TeamsNavBar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setSelectedVehicleId(null);
            setShowAddVehicle(false);
            setActiveTab(tab);
          }}
          bottomInset={insets.bottom}
          inStockVehicleCount={3}
        />
      )}
    </View>
  );
}

export default function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <MainApp />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background
  },
  body: {
    flex: 1
  }
});
