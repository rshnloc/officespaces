export type UserRole = 'super_admin' | 'admin' | 'manager' | 'customer';

export interface User {
  id: number;
  uuid: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  company?: string;
  gst_number?: string;
  avatar?: string;
  role: UserRole;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

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
  status: 'active' | 'inactive';
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Amenity {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface OfficeSpaceImage {
  id: number;
  uuid: string;
  office_space_id: number;
  image_path: string;
  url: string;
  caption?: string;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
}

export type SpaceType =
  | 'private_office'
  | 'meeting_room'
  | 'conference_room'
  | 'coworking_desk'
  | 'dedicated_desk'
  | 'virtual_office'
  | 'training_room'
  | 'event_space';

export type PricingUnit = 'hourly' | 'daily' | 'weekly' | 'monthly';

export interface PricingRule {
  id: number;
  office_space_id: number;
  pricing_unit: PricingUnit;
  base_price: number;
  weekend_price?: number;
  holiday_price?: number;
  minimum_hours?: number;
  currency: string;
  is_active: boolean;
  created_at: string;
}

export interface AvailabilityRule {
  id: number;
  office_space_id: number | null;
  day_of_week: number; // 0=Sunday, 1=Monday...6=Saturday
  open_time: string; // "08:00:00"
  close_time: string; // "20:00:00"
  slot_duration_minutes: number;
  is_active: boolean;
  created_at: string;
}

export interface BlockedDate {
  id: number;
  office_space_id?: number | null;
  blocked_date: string; // YYYY-MM-DD
  start_time?: string | null;
  end_time?: string | null;
  reason?: string;
  created_at: string;
}

export interface Holiday {
  id: number;
  date: string; // YYYY-MM-DD
  name: string;
  is_recurring: boolean;
  created_at: string;
}

export interface OfficeSpace {
  id: number;
  uuid: string;
  location_id: number;
  name: string;
  slug: string;
  space_type: SpaceType;
  description?: string;
  short_description?: string;
  capacity: number;
  building?: string;
  floor?: string;
  area_sqft?: number;
  base_price: number;
  pricing_unit: PricingUnit;
  weekend_price?: number;
  holiday_price?: number;
  currency: string;
  status: 'active' | 'maintenance' | 'inactive';
  is_featured: boolean;
  terms?: string;
  cancellation_policy?: string;
  sort_order: number;
  amenity_ids: number[];
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: number;
  uuid: string;
  user_id?: number | null;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  gst_number?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export type PaymentStatus =
  | 'unpaid'
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

export interface Booking {
  id: number;
  uuid: string;
  booking_number: string;
  customer_id: number;
  user_id?: number | null;
  office_space_id: number;
  booking_date: string; // YYYY-MM-DD
  start_time: string; // HH:mm:ss
  end_time: string; // HH:mm:ss
  duration_hours: number;
  duration_days: number;
  pricing_unit: PricingUnit;
  num_people: number;
  base_price: number;
  discount_amount: number;
  coupon_id?: number | null;
  tax_amount: number;
  tax_id?: number | null;
  final_amount: number;
  currency: string;
  status: BookingStatus;
  payment_status: PaymentStatus;
  customer_notes?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BookingStatusHistory {
  id: number;
  booking_id: number;
  from_status: BookingStatus | null;
  to_status: BookingStatus;
  changed_by_user_id?: number | null;
  notes?: string;
  created_at: string;
}

export interface Payment {
  id: number;
  uuid: string;
  booking_id: number;
  customer_id: number;
  transaction_id: string;
  gateway: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: string;
  payment_date: string;
  created_at: string;
}

export interface Coupon {
  id: number;
  uuid: string;
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_booking_amount?: number;
  max_discount?: number;
  start_date?: string;
  end_date?: string;
  usage_limit?: number;
  per_customer_limit?: number;
  used_count: number;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface CouponUsage {
  id: number;
  coupon_id: number;
  customer_id: number;
  booking_id: number;
  discount_applied: number;
  created_at: string;
}

export interface Review {
  id: number;
  uuid: string;
  office_space_id?: number | null;
  customer_id?: number | null;
  author_name: string;
  author_title?: string;
  author_company?: string;
  author_avatar?: string;
  rating: number;
  comment: string;
  is_featured: boolean;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface CmsSection {
  id: number;
  page_slug: string;
  section_key: string;
  title?: string;
  subtitle?: string;
  data: Record<string, any>;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CmsPage {
  id: number;
  slug: string;
  title: string;
  content?: string;
  meta_title?: string;
  meta_description?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Setting {
  id: number;
  key: string;
  value: string;
  group: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConsultationInquiry {
  id: number;
  uuid: string;
  full_name: string;
  email: string;
  phone: string;
  company_name?: string;
  service: string;
  consultation_type: string;
  preferred_date: string;
  message?: string;
  status: 'new' | 'contacted' | 'scheduled' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface Tax {
  id: number;
  name: string;
  code: string;
  percentage: number;
  is_active: boolean;
  description?: string;
  created_at: string;
}

export interface CancellationRule {
  id: number;
  name: string;
  hours_before: number;
  refund_percentage: number;
  is_active: boolean;
  description?: string;
  created_at: string;
}

export interface AuditLog {
  id: number;
  user_id?: number | null;
  action: string;
  description: string;
  entity_type?: string;
  entity_id?: number | string;
  ip_address?: string;
  old_values?: any;
  new_values?: any;
  created_at: string;
}
