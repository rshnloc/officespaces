import { db } from '../database/store.js';
import { OfficeSpace } from '../models/types.js';

export interface CalculatePriceInput {
  officeSpace: OfficeSpace;
  bookingDate: string; // YYYY-MM-DD
  startTime: string;   // HH:mm:ss or HH:mm
  endTime: string;     // HH:mm:ss or HH:mm
  pricingUnit?: string;
  couponCode?: string;
  customerId?: number | null;
}

export class PricingService {
  public static calculate(input: CalculatePriceInput) {
    const {
      officeSpace,
      bookingDate,
      startTime,
      endTime,
      pricingUnit = officeSpace.pricing_unit || 'hourly',
      couponCode,
      customerId,
    } = input;

    // Normalizing time strings
    const startParts = startTime.split(':').map(Number);
    const endParts = endTime.split(':').map(Number);
    const startMinutes = startParts[0] * 60 + (startParts[1] || 0);
    const endMinutes = endParts[0] * 60 + (endParts[1] || 0);

    const diffMinutes = Math.max(1, endMinutes - startMinutes);
    const durationHours = Math.round((diffMinutes / 60) * 100) / 100;
    const durationDays = Math.max(1, Math.ceil(durationHours / 24));

    // Determine weekend & holiday
    const dateObj = new Date(`${bookingDate}T00:00:00Z`);
    const dayOfWeek = dateObj.getUTCDay(); // 0 is Sunday, 6 is Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const isHoliday = db.holidays.some((h) => {
      if (h.date === bookingDate) return true;
      if (h.is_recurring) {
        const hParts = h.date.split('-');
        return (
          dateObj.getUTCMonth() + 1 === parseInt(hParts[1], 10) &&
          dateObj.getUTCDate() === parseInt(hParts[2], 10)
        );
      }
      return false;
    });

    // Pricing Rule
    const rule = db.pricingRules.find(
      (r) => r.office_space_id === officeSpace.id && r.pricing_unit === pricingUnit && r.is_active
    );

    let rate = rule ? rule.base_price : officeSpace.base_price;

    if (isHoliday && rule?.holiday_price) {
      rate = rule.holiday_price;
    } else if (isHoliday && officeSpace.holiday_price) {
      rate = officeSpace.holiday_price;
    } else if (isWeekend && rule?.weekend_price) {
      rate = rule.weekend_price;
    } else if (isWeekend && officeSpace.weekend_price) {
      rate = officeSpace.weekend_price;
    }

    // Base price
    let basePrice = 0;
    switch (pricingUnit) {
      case 'hourly':
        basePrice = Math.round(rate * durationHours * 100) / 100;
        break;
      case 'daily':
        basePrice = Math.round(rate * durationDays * 100) / 100;
        break;
      case 'weekly':
        basePrice = Math.round(rate * Math.max(1, Math.ceil(durationDays / 7)) * 100) / 100;
        break;
      case 'monthly':
        basePrice = Math.round(rate * Math.max(1, Math.ceil(durationDays / 30)) * 100) / 100;
        break;
      default:
        basePrice = Math.round(rate * durationHours * 100) / 100;
        break;
    }

    // Coupon discount calculation
    let discountAmount = 0.0;
    let coupon = null;
    let couponMessage: string | undefined = undefined;

    if (couponCode && couponCode.trim()) {
      const codeUpper = couponCode.trim().toUpperCase();
      const foundCoupon = db.coupons.find((c) => c.code.toUpperCase() === codeUpper && c.status === 'active');

      if (foundCoupon) {
        let isValid = true;
        let message = '';

        if (foundCoupon.min_booking_amount && basePrice < foundCoupon.min_booking_amount) {
          isValid = false;
          message = `Minimum booking amount of ₹${foundCoupon.min_booking_amount} required for this coupon.`;
        }

        if (isValid && foundCoupon.usage_limit && foundCoupon.used_count >= foundCoupon.usage_limit) {
          isValid = false;
          message = 'This coupon has reached its maximum usage limit.';
        }

        if (isValid && customerId && foundCoupon.per_customer_limit) {
          const usedByCustomer = db.couponUsages.filter(
            (u) => u.coupon_id === foundCoupon.id && u.customer_id === customerId
          ).length;
          if (usedByCustomer >= foundCoupon.per_customer_limit) {
            isValid = false;
            message = 'You have already reached the usage limit for this coupon.';
          }
        }

        if (isValid) {
          coupon = foundCoupon;
          if (foundCoupon.discount_type === 'percentage') {
            let discount = Math.round(((basePrice * foundCoupon.discount_value) / 100) * 100) / 100;
            if (foundCoupon.max_discount && discount > foundCoupon.max_discount) {
              discount = foundCoupon.max_discount;
            }
            discountAmount = discount;
          } else {
            discountAmount = Math.min(basePrice, foundCoupon.discount_value);
          }
        } else {
          couponMessage = message;
        }
      } else {
        couponMessage = 'Invalid or expired coupon code.';
      }
    }

    const subtotal = Math.max(0, Math.round((basePrice - discountAmount) * 100) / 100);

    // Tax calculation (GST 18%)
    const activeTax = db.taxes.find((t) => t.is_active) || {
      id: 1,
      name: 'GST (18%)',
      percentage: 18.0,
    };
    const taxPercentage = activeTax.percentage || 18.0;
    const taxAmount = Math.round(((subtotal * taxPercentage) / 100) * 100) / 100;

    const finalAmount = Math.round((subtotal + taxAmount) * 100) / 100;

    return {
      pricing_unit: pricingUnit,
      duration_hours: durationHours,
      duration_days: durationDays,
      rate,
      base_price: basePrice,
      discount_amount: discountAmount,
      subtotal,
      tax_id: activeTax.id,
      tax_name: activeTax.name,
      tax_percentage: taxPercentage,
      tax_amount: taxAmount,
      final_amount: finalAmount,
      currency: officeSpace.currency || 'INR',
      coupon_id: coupon ? coupon.id : undefined,
      coupon_code: coupon ? coupon.code : undefined,
      coupon_message: couponMessage,
      is_weekend: isWeekend,
      is_holiday: isHoliday,
    };
  }
}
