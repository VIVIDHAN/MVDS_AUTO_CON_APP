export type VehicleStatus = 'AVAILABLE' | 'BOOKED' | 'SOLD' | 'IN_SERVICE';
export type VehicleType =
  | 'Cars'
  | 'Two Wheelers'
  | 'JCB / Earth Movers'
  | 'Tractors'
  | 'Pickup'
  | 'Tippers'
  | 'Trucks'
  | 'Buses'
  | 'Vans'
  | 'Special Vehicles'
  | 'Four Wheeler'
  | 'Commercial'
  | string;
export type ServiceStatus = 'PENDING' | 'IN_PROGRESS' | 'READY' | 'DELIVERED';

export interface User {
  id: number;
  name: string;
  phone: string;
  role: 'OWNER' | 'MANAGER' | 'STAFF';
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  total_vehicles_purchased?: number;
  total_services?: number;
  created_at?: string;
  vehicles?: Vehicle[];
  services?: ServiceRecord[];
}

export interface Vehicle {
  id: number;
  vehicle_name: string;
  brand: string | null;
  model_year: number | null;
  registration_number: string | null;
  vehicle_type: VehicleType;
  bought_price: number | string;
  price_code: string;
  selling_price: number | string | null;
  date_bought: string;
  date_sold?: string | null;
  status: VehicleStatus;
  customer_id?: number | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_email?: string | null;
  customer_address?: string | null;
  image_base64?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  services?: ServiceRecord[];
}

export interface ServiceRecord {
  id: number;
  vehicle_id: number;
  vehicle_name?: string;
  registration_number?: string;
  brand?: string;
  customer_id?: number | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_email?: string | null;
  customer_address?: string | null;
  service_type: string;
  cost: number | string;
  service_date: string;
  delivery_date?: string | null;
  status: ServiceStatus;
  notes?: string | null;
  created_at?: string;
}

export interface DashboardStats {
  vehicles: {
    total: number;
    available: number | string;
    sold: number | string;
    in_service: number | string;
    booked: number | string;
  };
  financials: {
    current_investment: number | string;
    expected_inventory_value: number | string;
    total_sales_revenue: number | string;
    total_profit_realized: number | string;
  };
  services: {
    total_services: number;
    active_services: number | string;
    total_service_revenue: number | string;
  };
  customers: {
    total_customers: number;
  };
}
