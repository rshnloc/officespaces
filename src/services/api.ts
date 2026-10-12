import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to attach Bearer token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle authentication expiry
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If token expired, clear localStorage
      const hadToken = !!localStorage.getItem('auth_token');
      if (hadToken && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
    return Promise.reject(error);
  }
);

// Types
export interface Location {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  state?: string;
  country?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  google_maps_url?: string;
  contact_phone?: string;
  contact_email?: string;
  image?: string;
  status: string;
  office_spaces_count?: number;
}

export interface Amenity {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  status: string;
}

export interface OfficeSpaceImage {
  id: number;
  uuid: string;
  image_path: string;
  url: string;
  caption?: string;
  is_primary: boolean;
}

export interface OfficeSpace {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  space_type: string;
  description?: string;
  short_description?: string;
  capacity: number;
  building?: string;
  floor?: string;
  area_sqft?: number;
  base_price: number;
  pricing_unit: 'hourly' | 'daily' | 'weekly' | 'monthly';
  weekend_price?: number;
  holiday_price?: number;
  currency: string;
  status: string;
  is_featured: boolean;
  terms?: string;
  cancellation_policy?: string;
  location?: Location;
  amenities?: Amenity[];
  images?: OfficeSpaceImage[];
  primary_image?: { url: string };
}

export interface TimeSlot {
  start_time: string;
  end_time: string;
  display: string;
  is_available: boolean;
  reason?: string;
}

export interface PriceCalculation {
  pricing_unit: string;
  duration_hours: number;
  duration_days: number;
  rate: number;
  base_price: number;
  discount_amount: number;
  subtotal: number;
  tax_id: number;
  tax_name: string;
  tax_percentage: number;
  tax_amount: number;
  final_amount: number;
  currency: string;
  coupon_id?: number;
  coupon_code?: string;
  coupon_message?: string;
}

export interface Booking {
  id: number;
  uuid: string;
  booking_number: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  duration_days: number;
  pricing_unit: string;
  num_people: number;
  base_price: number;
  discount_amount: number;
  tax_amount: number;
  final_amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled' | 'rejected';
  payment_status: 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  customer_notes?: string;
  admin_notes?: string;
  customer?: any;
  office_space?: OfficeSpace;
  payments?: any[];
  status_history?: any[];
  created_at: string;
}

export interface User {
  id: number;
  uuid: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  gst_number?: string;
  avatar?: string;
  role: 'super_admin' | 'admin' | 'manager' | 'customer';
  status: string;
}

export interface Review {
  id: number;
  uuid: string;
  author_name: string;
  author_title?: string;
  author_company?: string;
  author_avatar?: string;
  rating: number;
  comment: string;
  is_featured: boolean;
}

// API Service Methods
export const ApiService = {
  // Public Space Endpoints
  getSpaces: async (params?: Record<string, any>) => {
    const res = await apiClient.get('/spaces', { params });
    return res.data;
  },

  getSpace: async (identifier: string) => {
    const res = await apiClient.get(`/spaces/${identifier}`);
    return res.data;
  },

  getSpaceAvailability: async (spaceId: number | string, date: string) => {
    const res = await apiClient.get(`/spaces/${spaceId}/availability`, { params: { date } });
    return res.data;
  },

  calculatePrice: async (spaceId: number | string, data: {
    booking_date: string;
    start_time: string;
    end_time: string;
    pricing_unit?: string;
    coupon_code?: string;
  }) => {
    const res = await apiClient.post(`/spaces/${spaceId}/calculate-price`, data);
    return res.data;
  },

  // Locations
  getLocations: async (params?: Record<string, any>) => {
    const res = await apiClient.get('/locations', { params });
    return res.data;
  },

  getLocation: async (identifier: string) => {
    const res = await apiClient.get(`/locations/${identifier}`);
    return res.data;
  },

  // Amenities
  getAmenities: async () => {
    const res = await apiClient.get('/amenities');
    return res.data;
  },

  // Coupons
  validateCoupon: async (code: string, amount: number, officeSpaceId?: number) => {
    const res = await apiClient.post('/coupons/validate', {
      code,
      amount,
      office_space_id: officeSpaceId,
    });
    return res.data;
  },

  // Reviews
  getReviews: async (params?: { featured?: boolean; office_space_id?: number }) => {
    const res = await apiClient.get('/reviews', { params });
    return res.data;
  },

  submitReview: async (data: {
    author_name: string;
    author_title?: string;
    author_company?: string;
    rating: number;
    comment: string;
    office_space_id?: number;
  }) => {
    const res = await apiClient.post('/reviews', data);
    return res.data;
  },

  // CMS Sections
  getCmsSections: async (pageSlug: string = 'home') => {
    const res = await apiClient.get(`/cms/sections/${pageSlug}`);
    return res.data;
  },

  // Settings
  getPublicSettings: async () => {
    const res = await apiClient.get('/settings');
    return res.data;
  },

  // Consultations & Contact Form
  submitConsultation: async (data: {
    full_name: string;
    email: string;
    phone: string;
    company_name: string;
    service: string;
    consultation_type: string;
    preferred_date: string;
    message: string;
  }) => {
    const res = await apiClient.post('/consultations', data);
    return res.data;
  },

  // Bookings
  createBooking: async (data: {
    office_space_id: number;
    booking_date: string;
    start_time: string;
    end_time: string;
    pricing_unit?: string;
    num_people?: number;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    coupon_code?: string;
    customer_notes?: string;
  }) => {
    const res = await apiClient.post('/bookings', data);
    return res.data;
  },

  getBooking: async (identifier: string) => {
    const res = await apiClient.get(`/bookings/${identifier}`);
    return res.data;
  },

  // Auth
  login: async (credentials: { email: string; password: string }) => {
    const res = await apiClient.post('/auth/login', credentials);
    if (res.data?.data?.token) {
      localStorage.setItem('auth_token', res.data.data.token);
      localStorage.setItem('auth_user', JSON.stringify(res.data.data.user));
    }
    return res.data;
  },

  register: async (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone?: string;
    company?: string;
  }) => {
    const res = await apiClient.post('/auth/register', data);
    if (res.data?.data?.token) {
      localStorage.setItem('auth_token', res.data.data.token);
      localStorage.setItem('auth_user', JSON.stringify(res.data.data.user));
    }
    return res.data;
  },

  getProfile: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  },

  // Customer Bookings
  getMyBookings: async (params?: { status?: string; page?: number }) => {
    const res = await apiClient.get('/customer/my-bookings', { params });
    return res.data;
  },

  cancelMyBooking: async (bookingId: number, reason: string) => {
    const res = await apiClient.post(`/bookings/${bookingId}/cancel`, { reason });
    return res.data;
  },

  // ================= ADMIN APIs =================
  admin: {
    getDashboardSummary: async (filter = 'this_month') => {
      const res = await apiClient.get('/admin/dashboard/summary', { params: { filter } });
      return res.data;
    },

    getDashboardCharts: async (filter = 'this_month') => {
      const res = await apiClient.get('/admin/dashboard/charts', { params: { filter } });
      return res.data;
    },

    getBookings: async (params?: Record<string, any>) => {
      const res = await apiClient.get('/admin/bookings', { params });
      return res.data;
    },

    updateBookingStatus: async (bookingId: number, status: string, notes?: string) => {
      const res = await apiClient.put(`/admin/bookings/${bookingId}/status`, { status, notes });
      return res.data;
    },

    rescheduleBooking: async (bookingId: number, data: { booking_date: string; start_time: string; end_time: string; reason?: string }) => {
      const res = await apiClient.post(`/admin/bookings/${bookingId}/reschedule`, data);
      return res.data;
    },

    recordPayment: async (bookingId: number, data: { amount: number; gateway: string; payment_method?: string; transaction_id?: string }) => {
      const res = await apiClient.post(`/admin/bookings/${bookingId}/payments`, data);
      return res.data;
    },

    getCustomers: async (params?: Record<string, any>) => {
      const res = await apiClient.get('/admin/customers', { params });
      return res.data;
    },

    getSpaces: async (params?: Record<string, any>) => {
      const res = await apiClient.get('/spaces', { params: { ...params, per_page: 50 } });
      return res.data;
    },

    createSpace: async (data: any) => {
      const res = await apiClient.post('/admin/spaces', data);
      return res.data;
    },

    updateSpace: async (id: number, data: any) => {
      const res = await apiClient.put(`/admin/spaces/${id}`, data);
      return res.data;
    },

    deleteSpace: async (id: number) => {
      const res = await apiClient.delete(`/admin/spaces/${id}`);
      return res.data;
    },

    getCoupons: async () => {
      const res = await apiClient.get('/admin/coupons');
      return res.data;
    },

    createCoupon: async (data: any) => {
      const res = await apiClient.post('/admin/coupons', data);
      return res.data;
    },

    deleteCoupon: async (id: number) => {
      const res = await apiClient.delete(`/admin/coupons/${id}`);
      return res.data;
    },

    getConsultations: async (params?: Record<string, any>) => {
      const res = await apiClient.get('/admin/consultations', { params });
      return res.data;
    },

    updateConsultation: async (id: number, data: any) => {
      const res = await apiClient.put(`/admin/consultations/${id}`, data);
      return res.data;
    },

    getAuditLogs: async () => {
      const res = await apiClient.get('/admin/audit-logs');
      return res.data;
    },
  },
};
