import { Router } from 'express';
import { optionalAuth, requireAuth, requireAdmin } from '../middleware/auth.js';
import { AuthController } from '../controllers/authController.js';
import { OfficeSpaceController } from '../controllers/officeSpaceController.js';
import { LocationController } from '../controllers/locationController.js';
import { AmenityController } from '../controllers/amenityController.js';
import { AvailabilityController } from '../controllers/availabilityController.js';
import { PricingController } from '../controllers/pricingController.js';
import { BookingController } from '../controllers/bookingController.js';
import { CouponController } from '../controllers/couponController.js';
import { ReviewController } from '../controllers/reviewController.js';
import { CmsController } from '../controllers/cmsController.js';
import { SettingController } from '../controllers/settingController.js';
import { ConsultationController } from '../controllers/consultationController.js';
import { CustomerController } from '../controllers/customerController.js';
import { PaymentController } from '../controllers/paymentController.js';
import { ReportController } from '../controllers/reportController.js';
import { TaxController } from '../controllers/taxController.js';
import { CancellationRuleController } from '../controllers/cancellationRuleController.js';
import { AuditLogController } from '../controllers/auditLogController.js';

export const apiRouter = Router();

// ==========================================
// Public Endpoints
// ==========================================

// Auth
apiRouter.post('/auth/register', AuthController.register);
apiRouter.post('/auth/login', AuthController.login);

// Locations
apiRouter.get('/locations', LocationController.index);
apiRouter.get('/locations/:identifier', LocationController.show);

// Office Spaces
apiRouter.get('/spaces', optionalAuth, OfficeSpaceController.index);
apiRouter.get('/spaces/:identifier', OfficeSpaceController.show);

// Amenities
apiRouter.get('/amenities', AmenityController.index);

// Availability & Pricing calculation
apiRouter.get('/spaces/:officeSpace/availability', AvailabilityController.getSlots);
apiRouter.get('/spaces/:officeSpace/check-slot', AvailabilityController.checkSlot);
apiRouter.get('/spaces/:officeSpace/calendar', AvailabilityController.getMonthlyCalendar);
apiRouter.post('/spaces/:officeSpace/calculate-price', optionalAuth, PricingController.calculate);

// Public Bookings
apiRouter.post('/bookings', optionalAuth, BookingController.store);
apiRouter.get('/bookings/:identifier', BookingController.show);

// Coupons
apiRouter.post('/coupons/validate', CouponController.validateCoupon);

// Reviews & Testimonials
apiRouter.get('/reviews', ReviewController.index);
apiRouter.post('/reviews', optionalAuth, ReviewController.store);

// CMS & Dynamic Content
apiRouter.get('/cms/sections/:pageSlug', CmsController.getSections);
apiRouter.get('/cms/sections/:pageSlug/:sectionKey', CmsController.getSection);
apiRouter.get('/cms/pages/:slug', CmsController.getPage);

// Public Settings
apiRouter.get('/settings', SettingController.getPublicSettings);

// Consultation Inquiries
apiRouter.post('/consultations', ConsultationController.store);

// ==========================================
// Authenticated Customer / User Endpoints
// ==========================================
apiRouter.get('/auth/me', requireAuth, AuthController.me);
apiRouter.put('/auth/profile', requireAuth, AuthController.updateProfile);
apiRouter.post('/auth/change-password', requireAuth, AuthController.changePassword);
apiRouter.post('/auth/logout', requireAuth, AuthController.logout);

// Customer bookings
apiRouter.get('/customer/my-bookings', requireAuth, BookingController.myBookings);
apiRouter.post('/bookings/:booking/cancel', requireAuth, BookingController.cancel);

// ==========================================
// Admin Protected Endpoints
// ==========================================
const adminRouter = Router();
adminRouter.use(requireAuth, requireAdmin);

// Dashboard & Analytics
adminRouter.get('/dashboard/summary', ReportController.dashboard);
adminRouter.get('/dashboard/charts', ReportController.charts);

// Locations Management
adminRouter.get('/locations', LocationController.index);
adminRouter.post('/locations', LocationController.store);
adminRouter.put('/locations/:id', LocationController.update);
adminRouter.delete('/locations/:id', LocationController.destroy);

// Office Spaces Management
adminRouter.post('/spaces', OfficeSpaceController.store);
adminRouter.put('/spaces/:id', OfficeSpaceController.update);
adminRouter.delete('/spaces/:id', OfficeSpaceController.destroy);
adminRouter.post('/spaces/:id/images', OfficeSpaceController.uploadImage);
adminRouter.delete('/spaces/:id/images/:image', OfficeSpaceController.deleteImage);

// Pricing Rules
adminRouter.get('/spaces/:officeSpace/pricing-rules', PricingController.indexRules);
adminRouter.post('/spaces/:officeSpace/pricing-rules', PricingController.storeRule);
adminRouter.delete('/spaces/:officeSpace/pricing-rules/:pricingRule', PricingController.destroyRule);

// Amenities Management
adminRouter.post('/amenities', AmenityController.store);
adminRouter.put('/amenities/:id', AmenityController.update);
adminRouter.delete('/amenities/:id', AmenityController.destroy);

// Blocked Dates
adminRouter.get('/blocked-dates', AvailabilityController.listBlockedDates);
adminRouter.post('/blocked-dates', AvailabilityController.storeBlockedDate);
adminRouter.delete('/blocked-dates/:id', AvailabilityController.destroyBlockedDate);

// Customers Management
adminRouter.get('/customers', CustomerController.index);
adminRouter.get('/customers/:id', CustomerController.show);
adminRouter.get('/customers/:customer/bookings', CustomerController.bookings);

// Bookings Management
adminRouter.get('/bookings', BookingController.adminIndex);
adminRouter.put('/bookings/:booking/status', BookingController.updateStatus);
adminRouter.post('/bookings/:booking/cancel', BookingController.cancel);
adminRouter.post('/bookings/:booking/reschedule', BookingController.reschedule);
adminRouter.get('/bookings-export', BookingController.exportCsv);

// Payments & Refunds
adminRouter.get('/payments', PaymentController.index);
adminRouter.post('/bookings/:booking/payments', PaymentController.store);
adminRouter.post('/payments/:payment/refund', PaymentController.processRefund);

// Coupons Management
adminRouter.get('/coupons', CouponController.adminIndex);
adminRouter.post('/coupons', CouponController.store);
adminRouter.delete('/coupons/:id', CouponController.destroy);

// Taxes & Cancellation Rules
adminRouter.get('/taxes', TaxController.index);
adminRouter.post('/taxes', TaxController.store);
adminRouter.get('/cancellation-rules', CancellationRuleController.index);
adminRouter.post('/cancellation-rules', CancellationRuleController.store);

// Reviews Management
adminRouter.put('/reviews/:review', ReviewController.update);
adminRouter.delete('/reviews/:review', ReviewController.destroy);

// CMS Management
adminRouter.put('/cms/sections/:pageSlug/:sectionKey', CmsController.updateSection);

// Settings Management
adminRouter.get('/settings', SettingController.adminIndex);
adminRouter.post('/settings/batch', SettingController.updateBatch);

// Consultation Inquiries
adminRouter.get('/consultations', ConsultationController.index);
adminRouter.put('/consultations/:consultationInquiry', ConsultationController.update);

// Audit Logs
adminRouter.get('/audit-logs', AuditLogController.index);

apiRouter.use('/admin', adminRouter);
