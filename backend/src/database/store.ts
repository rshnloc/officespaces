import fs from 'fs';
import path from 'path';
import { config } from '../config/index.js';
import { getInitialSeedData } from './seed.js';
import {
  User,
  Location,
  Amenity,
  OfficeSpace,
  OfficeSpaceImage,
  PricingRule,
  AvailabilityRule,
  BlockedDate,
  Holiday,
  Coupon,
  CouponUsage,
  Customer,
  Booking,
  BookingStatusHistory,
  Payment,
  Review,
  CmsSection,
  CmsPage,
  Setting,
  ConsultationInquiry,
  Tax,
  CancellationRule,
  AuditLog,
} from '../models/types.js';

export interface DatabaseSchema {
  users: User[];
  locations: Location[];
  amenities: Amenity[];
  spaces: OfficeSpace[];
  images: OfficeSpaceImage[];
  pricingRules: PricingRule[];
  availabilityRules: AvailabilityRule[];
  blockedDates: BlockedDate[];
  holidays: Holiday[];
  coupons: Coupon[];
  couponUsages: CouponUsage[];
  customers: Customer[];
  bookings: Booking[];
  bookingStatusHistory: BookingStatusHistory[];
  payments: Payment[];
  reviews: Review[];
  cmsSections: CmsSection[];
  cmsPages: CmsPage[];
  settings: Setting[];
  consultations: ConsultationInquiry[];
  taxes: Tax[];
  cancellationRules: CancellationRule[];
  auditLogs: AuditLog[];
}

class DatabaseStore {
  private data: DatabaseSchema;
  private filePath: string;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    const dataDir = config.dataDir;
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.filePath = path.join(dataDir, 'db.json');
    this.data = this.loadOrSeed();
  }

  private loadOrSeed(): DatabaseSchema {
    if (fs.existsSync(this.filePath)) {
      try {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.spaces && parsed.users) {
          return parsed;
        }
      } catch (err) {
        console.error('Failed to parse existing db.json, creating new from seed...', err);
      }
    }

    const seed = getInitialSeedData();
    this.saveImmediate(seed);
    return seed;
  }

  private saveImmediate(dataToSave: DatabaseSchema) {
    const tempPath = `${this.filePath}.tmp.${Date.now()}`;
    fs.writeFileSync(tempPath, JSON.stringify(dataToSave, null, 2), 'utf-8');
    fs.renameSync(tempPath, this.filePath);
  }

  public save() {
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      this.saveImmediate(this.data);
    }, 100);
  }

  public forceSave() {
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveImmediate(this.data);
  }

  public get users() { return this.data.users; }
  public get locations() { return this.data.locations; }
  public get amenities() { return this.data.amenities; }
  public get spaces() { return this.data.spaces; }
  public get images() { return this.data.images; }
  public get pricingRules() { return this.data.pricingRules; }
  public get availabilityRules() { return this.data.availabilityRules; }
  public get blockedDates() { return this.data.blockedDates; }
  public get holidays() { return this.data.holidays; }
  public get coupons() { return this.data.coupons; }
  public get couponUsages() { return this.data.couponUsages; }
  public get customers() { return this.data.customers; }
  public get bookings() { return this.data.bookings; }
  public get bookingStatusHistory() { return this.data.bookingStatusHistory; }
  public get payments() { return this.data.payments; }
  public get reviews() { return this.data.reviews; }
  public get cmsSections() { return this.data.cmsSections; }
  public get cmsPages() { return this.data.cmsPages; }
  public get settings() { return this.data.settings; }
  public get consultations() { return this.data.consultations; }
  public get taxes() { return this.data.taxes; }
  public get cancellationRules() { return this.data.cancellationRules; }
  public get auditLogs() { return this.data.auditLogs; }

  public nextId(collection: keyof DatabaseSchema): number {
    const items = this.data[collection] as { id: number }[];
    if (!items || items.length === 0) return 1;
    return Math.max(...items.map((i) => i.id || 0)) + 1;
  }

  // Office Space with populated relations
  public populateSpace(space: OfficeSpace) {
    const location = this.locations.find((l) => l.id === space.location_id);
    const spaceImages = this.images
      .filter((img) => img.office_space_id === space.id)
      .sort((a, b) => a.sort_order - b.sort_order);
    const primaryImage = spaceImages.find((img) => img.is_primary) || spaceImages[0];
    const spaceAmenities = this.amenities.filter((a) => space.amenity_ids.includes(a.id));
    const rules = this.pricingRules.filter((r) => r.office_space_id === space.id && r.is_active);

    return {
      ...space,
      location,
      images: spaceImages,
      primary_image: primaryImage ? { url: primaryImage.url } : undefined,
      amenities: spaceAmenities,
      pricing_rules: rules,
    };
  }

  // Populate booking with customer, office space, coupon, etc.
  public populateBooking(booking: Booking) {
    const customer = this.customers.find((c) => c.id === booking.customer_id);
    const rawSpace = this.spaces.find((s) => s.id === booking.office_space_id);
    const officeSpace = rawSpace ? this.populateSpace(rawSpace) : undefined;
    const coupon = booking.coupon_id ? this.coupons.find((c) => c.id === booking.coupon_id) : undefined;
    const bookingPayments = this.payments.filter((p) => p.booking_id === booking.id);
    const history = this.bookingStatusHistory.filter((h) => h.booking_id === booking.id);

    return {
      ...booking,
      customer,
      office_space: officeSpace,
      coupon,
      payments: bookingPayments,
      status_history: history,
    };
  }

  public logAudit(action: string, description: string, user?: User | null, oldValues?: any, newValues?: any) {
    const entry: AuditLog = {
      id: this.nextId('auditLogs'),
      user_id: user?.id || null,
      action,
      description,
      old_values: oldValues,
      new_values: newValues,
      created_at: new Date().toISOString(),
    };
    this.auditLogs.unshift(entry);
    this.save();
  }
}

export const db = new DatabaseStore();
