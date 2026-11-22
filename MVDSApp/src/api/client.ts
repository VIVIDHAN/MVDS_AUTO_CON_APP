import { BASE_URL } from './config';
import { User, Vehicle, Customer, ServiceRecord, DashboardStats } from '../types';

let authToken: string | null = null;
let currentUser: User | null = null;

export const setAuthToken = (token: string | null, user: User | null = null) => {
  authToken = token;
  currentUser = user;
};

export const getAuthToken = () => authToken;
export const getCurrentUser = () => currentUser;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  login: async (phone: string, password: string): Promise<{ success: boolean; token: string; user: User; message?: string }> => {
    const res = await request<{ success: boolean; token: string; user: User; message?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password })
    });
    setAuthToken(res.token, res.user);
    return res;
  },

  getProfile: async (): Promise<{ success: boolean; user: User }> => {
    return request<{ success: boolean; user: User }>('/auth/profile');
  },

  // Vehicles
  getVehicles: async (params?: { status?: string; q?: string; type?: string }): Promise<{ success: boolean; count: number; vehicles: Vehicle[] }> => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.q) query.append('q', params.q);
    if (params?.type) query.append('type', params.type);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<{ success: boolean; count: number; vehicles: Vehicle[] }>(`/vehicles${qs}`);
  },

  getVehicleById: async (id: number): Promise<{ success: boolean; vehicle: Vehicle }> => {
    return request<{ success: boolean; vehicle: Vehicle }>(`/vehicles/${id}`);
  },

  createVehicle: async (payload: Partial<Vehicle>): Promise<{ success: boolean; message: string; vehicle: Vehicle }> => {
    return request<{ success: boolean; message: string; vehicle: Vehicle }>('/vehicles', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  updateVehicle: async (id: number, payload: Partial<Vehicle>): Promise<{ success: boolean; message: string; vehicle: Vehicle }> => {
    return request<{ success: boolean; message: string; vehicle: Vehicle }>(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  markVehicleSold: async (id: number, payload: { customer_id?: number | null; selling_price?: number; date_sold?: string; notes?: string }): Promise<{ success: boolean; message: string; vehicle: Vehicle }> => {
    return request<{ success: boolean; message: string; vehicle: Vehicle }>(`/vehicles/${id}/sell`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  deleteVehicle: async (id: number): Promise<{ success: boolean; message: string }> => {
    return request<{ success: boolean; message: string }>(`/vehicles/${id}`, {
      method: 'DELETE'
    });
  },

  // Customers
  getCustomers: async (q?: string): Promise<{ success: boolean; customers: Customer[] }> => {
    const qs = q ? `?q=${encodeURIComponent(q)}` : '';
    return request<{ success: boolean; customers: Customer[] }>(`/customers${qs}`);
  },

  getCustomerById: async (id: number): Promise<{ success: boolean; customer: Customer }> => {
    return request<{ success: boolean; customer: Customer }>(`/customers/${id}`);
  },

  createCustomer: async (payload: { name: string; phone: string; email?: string; address?: string }): Promise<{ success: boolean; message: string; customer: Customer }> => {
    return request<{ success: boolean; message: string; customer: Customer }>('/customers', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  updateCustomer: async (id: number, payload: Partial<Customer>): Promise<{ success: boolean; message: string; customer: Customer }> => {
    return request<{ success: boolean; message: string; customer: Customer }>(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  deleteCustomer: async (id: number): Promise<{ success: boolean; message: string }> => {
    return request<{ success: boolean; message: string }>(`/customers/${id}`, {
      method: 'DELETE'
    });
  },

  // Services
  getServices: async (params?: { status?: string; vehicle_id?: number }): Promise<{ success: boolean; count: number; services: ServiceRecord[] }> => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.vehicle_id) query.append('vehicle_id', String(params.vehicle_id));
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<{ success: boolean; count: number; services: ServiceRecord[] }>(`/services${qs}`);
  },

  createService: async (payload: Partial<ServiceRecord>): Promise<{ success: boolean; message: string; service: ServiceRecord }> => {
    return request<{ success: boolean; message: string; service: ServiceRecord }>('/services', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  updateServiceStatus: async (id: number, payload: { status: string; delivery_date?: string; cost?: number; notes?: string }): Promise<{ success: boolean; message: string; service: ServiceRecord }> => {
    return request<{ success: boolean; message: string; service: ServiceRecord }>(`/services/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  deleteService: async (id: number): Promise<{ success: boolean; message: string }> => {
    return request<{ success: boolean; message: string }>(`/services/${id}`, {
      method: 'DELETE'
    });
  },

  // Dashboard
  getDashboardStats: async (): Promise<{ success: boolean; stats: DashboardStats; recentVehicles: Vehicle[] }> => {
    return request<{ success: boolean; stats: DashboardStats; recentVehicles: Vehicle[] }>('/dashboard/stats');
  },

  // AI Intelligence Engine
  getAiCluster: async (): Promise<{ success: boolean; cluster: any }> => {
    return request<{ success: boolean; cluster: any }>('/ai/cluster');
  },

  rotateAiKey: async (): Promise<{ success: boolean; message: string; activeKey: any }> => {
    return request<{ success: boolean; message: string; activeKey: any }>('/ai/rotate-key', {
      method: 'POST'
    });
  },

  computeAiValuation: async (payload: {
    category: string;
    vehicleName: string;
    modelYear: number;
    condition: string;
    boughtPrice: number;
  }): Promise<{ success: boolean; valuation: any }> => {
    return request<{ success: boolean; valuation: any }>('/ai/valuation', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  askAiAdvisor: async (question: string): Promise<{ success: boolean; advisor: any }> => {
    return request<{ success: boolean; advisor: any }>('/ai/advisor', {
      method: 'POST',
      body: JSON.stringify({ question })
    });
  }
};
