import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineXMark,
  HiOutlineCalendar,
  HiOutlineUserGroup,
  HiOutlineTag,
  HiOutlineCheckCircle,
  HiOutlineMapPin,
  HiOutlineShieldCheck,
} from 'react-icons/hi2';
import { ApiService } from '../services/api';
import type { OfficeSpace, PriceCalculation, TimeSlot } from '../services/api';

interface BookingModalProps {
  space: OfficeSpace | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingModal({ space, isOpen, onClose }: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedStartTime, setSelectedStartTime] = useState<string>('10:00:00');
  const [selectedEndTime, setSelectedEndTime] = useState<string>('12:00:00');
  const [pricingUnit, setPricingUnit] = useState<string>('hourly');
  const [numPeople, setNumPeople] = useState<number>(1);
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponApplied, setCouponApplied] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [pricing, setPricing] = useState<PriceCalculation | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  // Prefill if logged in
  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        setName(u.name || '');
        setEmail(u.email || '');
        setPhone(u.phone || '');
        setCompany(u.company || '');
      } catch (e) {}
    }
  }, [isOpen]);

  // Load available slots whenever date changes
  useEffect(() => {
    if (!space || !isOpen || !selectedDate) return;

    let isMounted = true;
    setIsLoadingSlots(true);
    ApiService.getSpaceAvailability(space.id, selectedDate)
      .then((res) => {
        if (!isMounted) return;
        const slots: TimeSlot[] = res.data?.slots || [];
        setTimeSlots(slots);
        const available = slots.filter((s) => s.is_available);
        if (available.length > 0) {
          setSelectedStartTime(available[0].start_time);
          // Set 1-hour slot by default
          setSelectedEndTime(available[0].end_time);
        }
      })
      .catch((err) => {
        console.error('Failed to load slots:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingSlots(false);
      });

    return () => {
      isMounted = false;
    };
  }, [space, selectedDate, isOpen]);

  // Recalculate price whenever parameters change
  useEffect(() => {
    if (!space || !selectedDate || !selectedStartTime || !selectedEndTime) return;

    let isMounted = true;
    setErrorMessage(null);

    ApiService.calculatePrice(space.id, {
      booking_date: selectedDate,
      start_time: selectedStartTime,
      end_time: selectedEndTime,
      pricing_unit: pricingUnit,
      coupon_code: couponApplied || undefined,
    })
      .then((res) => {
        if (!isMounted) return;
        setPricing(res.data);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Price calculation error:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [space, selectedDate, selectedStartTime, selectedEndTime, pricingUnit, couponApplied]);

  if (!isOpen || !space) return null;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError(null);
    try {
      const res = await ApiService.validateCoupon(couponCode, pricing?.base_price || space.base_price, space.id);
      if (res.success) {
        setCouponApplied(couponCode.trim().toUpperCase());
      } else {
        setCouponError(res.message || 'Invalid coupon');
      }
    } catch (err: any) {
      setCouponError(err.response?.data?.message || 'Invalid or expired coupon code.');
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(null);
    setCouponCode('');
    setCouponError(null);
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      setErrorMessage('Please fill in your name and email.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await ApiService.createBooking({
        office_space_id: space.id,
        booking_date: selectedDate,
        start_time: selectedStartTime,
        end_time: selectedEndTime,
        pricing_unit: pricingUnit,
        num_people: numPeople,
        name,
        email,
        phone,
        company,
        coupon_code: couponApplied || undefined,
        customer_notes: customerNotes,
      });

      if (res.success) {
        setConfirmedBooking(res.data);
        setIsSuccess(true);
      } else {
        setErrorMessage(res.message || 'Booking could not be created. Please try another slot.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.errors || 'Booking failed. Time slot might have just been taken.';
      setErrorMessage(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-navy/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-gold/10 px-2 py-0.5 text-xs font-semibold text-gold">
                  {space.space_type.replace('_', ' ').toUpperCase()}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <HiOutlineMapPin className="h-3.5 w-3.5 text-gold" />
                  {space.location?.name || space.location?.city}
                </span>
              </div>
              <h3 className="mt-1 text-lg font-bold text-navy">{space.name}</h3>
            </div>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-navy"
            >
              <HiOutlineXMark className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            {isSuccess && confirmedBooking ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-500">
                  <HiOutlineCheckCircle className="h-10 w-10" />
                </div>
                <h4 className="text-2xl font-bold text-navy">Booking Request Received!</h4>
                <p className="mt-2 text-sm text-gray-500">
                  Your booking number is{' '}
                  <span className="font-bold text-navy">{confirmedBooking.booking_number}</span>.
                </p>
                <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50 p-4 text-left">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-400">Date:</span>
                      <p className="font-semibold text-navy">{confirmedBooking.booking_date}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Time:</span>
                      <p className="font-semibold text-navy">
                        {confirmedBooking.start_time} - {confirmedBooking.end_time}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">Total Amount:</span>
                      <p className="font-semibold text-gold">₹{confirmedBooking.final_amount} (incl. GST)</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Status:</span>
                      <span className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                        {confirmedBooking.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-xs text-gray-400">
                  A confirmation email and SMS will be sent with check-in instructions.
                </p>
                <button
                  onClick={onClose}
                  className="btn-primary mt-6 w-full justify-center py-3"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitBooking} className="space-y-6">
                {errorMessage && (
                  <div className="rounded-lg bg-red-50 p-3.5 text-sm text-red-600">
                    {errorMessage}
                  </div>
                )}

                {/* Section 1: Date & Time Selection */}
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-navy">
                    <HiOutlineCalendar className="h-4 w-4 text-gold" />
                    1. Select Date & Slot
                  </h4>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Booking Date</label>
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="form-input mt-1 w-full text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Pricing Plan</label>
                      <select
                        value={pricingUnit}
                        onChange={(e) => setPricingUnit(e.target.value)}
                        className="form-input mt-1 w-full text-sm"
                      >
                        <option value="hourly">Hourly (Flexible)</option>
                        <option value="daily">Daily Pass</option>
                        <option value="monthly">Monthly Dedicated</option>
                      </select>
                    </div>
                  </div>

                  {/* Available Time Slots */}
                  <div className="mt-4">
                    <label className="flex items-center justify-between text-xs font-semibold text-gray-600">
                      <span>Available Time Slots</span>
                      {isLoadingSlots && <span className="text-gold text-[11px]">Loading slots...</span>}
                    </label>

                    {timeSlots.length === 0 && !isLoadingSlots ? (
                      <p className="mt-2 text-xs text-red-500">
                        No available slots on this date (Closed/Holiday). Please select another date.
                      </p>
                    ) : (
                      <div className="mt-2 grid max-h-36 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
                        {timeSlots.map((slot) => {
                          const isSelected = selectedStartTime === slot.start_time;
                          return (
                            <button
                              key={slot.start_time}
                              type="button"
                              disabled={!slot.is_available}
                              onClick={() => {
                                setSelectedStartTime(slot.start_time);
                                setSelectedEndTime(slot.end_time);
                              }}
                              className={`rounded-lg border px-2.5 py-2 text-xs font-medium transition-all ${
                                !slot.is_available
                                  ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 line-through'
                                  : isSelected
                                  ? 'border-gold bg-navy text-white shadow-sm'
                                  : 'border-gray-200 bg-white text-navy hover:border-gold/50'
                              }`}
                            >
                              {slot.display.split(' - ')[0]}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 2: Details & Coupon */}
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-navy">
                    <HiOutlineTag className="h-4 w-4 text-gold" />
                    2. Apply Coupon Code
                  </h4>
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      placeholder="Try WELCOME10 or STARTUP500"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      disabled={!!couponApplied}
                      className="form-input flex-1 uppercase text-sm"
                    />
                    {couponApplied ? (
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-600 hover:bg-red-100"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="rounded-lg bg-navy px-4 text-xs font-semibold text-white hover:bg-navy-dark"
                      >
                        Apply
                      </button>
                    )}
                  </div>
                  {couponApplied && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-green-600">
                      <HiOutlineCheckCircle className="h-3.5 w-3.5" />
                      Coupon {couponApplied} applied successfully!
                    </p>
                  )}
                  {couponError && <p className="mt-1.5 text-xs text-red-500">{couponError}</p>}
                </div>

                {/* Section 3: Customer Information */}
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-navy">
                    <HiOutlineUserGroup className="h-4 w-4 text-gold" />
                    3. Contact Information
                  </h4>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Sample User"
                        className="form-input mt-1 w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="user@example.com"
                        className="form-input mt-1 w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Phone Number</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98000 00000"
                        className="form-input mt-1 w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Company Name</label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Sample Company Ltd"
                        className="form-input mt-1 w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Attendees / People</label>
                      <input
                        type="number"
                        min={1}
                        max={space.capacity || 20}
                        value={numPeople}
                        onChange={(e) => setNumPeople(Math.max(1, parseInt(e.target.value) || 1))}
                        className="form-input mt-1 w-full text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-gray-600">Special Notes / Requirements</label>
                      <textarea
                        rows={2}
                        value={customerNotes}
                        onChange={(e) => setCustomerNotes(e.target.value)}
                        placeholder="e.g. Need projector, whiteboard markers, extra chairs..."
                        className="form-input mt-1 w-full text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Pricing Summary */}
                {pricing && (
                  <div className="rounded-xl border border-gold/30 bg-gold-50/30 p-4">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Base Rate ({pricing.duration_hours} hrs @ ₹{pricing.rate}/{pricing.pricing_unit})</span>
                      <span className="font-medium text-navy">₹{pricing.base_price}</span>
                    </div>
                    {pricing.discount_amount > 0 && (
                      <div className="mt-1 flex items-center justify-between text-xs text-green-600">
                        <span>Discount ({pricing.coupon_code})</span>
                        <span>- ₹{pricing.discount_amount}</span>
                      </div>
                    )}
                    <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                      <span>{pricing.tax_name} ({pricing.tax_percentage}%)</span>
                      <span className="font-medium text-navy">₹{pricing.tax_amount}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-gold/20 pt-2">
                      <span className="text-sm font-bold text-navy">Final Total</span>
                      <span className="text-lg font-extrabold text-navy">₹{pricing.final_amount}</span>
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <HiOutlineShieldCheck className="h-4 w-4 text-green-600" />
                    <span>Instant confirmation & 100% money-back guarantee</span>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting || (timeSlots.length === 0 && !isLoadingSlots)}
                    className="btn-primary px-6 py-3 text-sm"
                  >
                    {isSubmitting ? 'Placing Booking...' : 'Confirm & Reserve'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
