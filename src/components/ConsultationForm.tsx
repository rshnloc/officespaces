import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import emailjs from '@emailjs/browser';
import {
  HiOutlineCheckCircle,
  HiOutlineArrowPath,
  HiOutlineArrowRight,
  HiOutlineHome,
} from 'react-icons/hi2';
import { SERVICE_OPTIONS, CONSULTATION_TYPES } from '../data/constants';
import { ApiService } from '../services/api';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  service: string;
  consultationType: string;
  preferredDate: string;
  message: string;
}

interface ConsultationFormProps {
  onClose?: () => void;
  variant?: 'inline' | 'modal';
}

export default function ConsultationForm({
  onClose,
  variant = 'inline',
}: ConsultationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  // Get tomorrow's date for min date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      // 1. Submit directly to Laravel Backend REST API
      try {
        await ApiService.submitConsultation({
          full_name: data.fullName,
          email: data.email,
          phone: data.phone,
          company_name: data.companyName,
          service: data.service,
          consultation_type: data.consultationType,
          preferred_date: data.preferredDate,
          message: data.message,
        });
      } catch (apiErr) {
        console.warn('Backend API submission warning:', apiErr);
      }

      // 2. EmailJS Notification (optional fallback)
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      const templateParams = {
        from_name: data.fullName,
        from_email: data.email,
        phone: data.phone,
        company: data.companyName,
        service: data.service,
        consultation_type: data.consultationType,
        preferred_date: data.preferredDate,
        message: data.message,
        to_email: 'inquiries@example.com',
      };

      if (serviceId && templateId && publicKey && serviceId !== 'your_service_id') {
        await emailjs.send(serviceId, templateId, templateParams, publicKey);
      }

      setIsSuccess(true);
    } catch (error) {
      console.error('Submission failed:', error);
      setIsSuccess(true); // Don't block user if external service has issue
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    reset();
    setIsSuccess(false);
  };

  const handleBackToHome = () => {
    setIsSuccess(false);
    reset();
    if (onClose) {
      onClose();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Success Screen
  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50"
        >
          <HiOutlineCheckCircle className="h-12 w-12 text-green-500" />
        </motion.div>
        <h3 className="mb-3 text-2xl font-bold text-navy">Thank You!</h3>
        <p className="mb-8 max-w-sm text-base text-gray-500">
          Our team will contact you shortly. We look forward to helping your
          business grow.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={handleBackToHome}
            className="btn-secondary"
          >
            <HiOutlineHome className="h-4 w-4" />
            Back to Home
          </button>
          <button
            onClick={handleReset}
            className="btn-primary"
          >
            <HiOutlineArrowPath className="h-4 w-4" />
            Book Another Consultation
          </button>
        </div>
      </motion.div>
    );
  }

  const inputClass = (hasError: boolean) =>
    `form-input ${hasError ? 'error' : ''}`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* Row 1: Name + Email */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="fullName" className="form-label">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            id="fullName"
            type="text"
            placeholder="Enter your full name"
            className={inputClass(!!errors.fullName)}
            {...register('fullName', {
              required: 'Name is required',
              minLength: {
                value: 3,
                message: 'Name must be at least 3 characters',
              },
            })}
          />
          <AnimatePresence>
            {errors.fullName && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="form-error"
              >
                {errors.fullName.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div>
          <label htmlFor="email" className="form-label">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@company.com"
            className={inputClass(!!errors.email)}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Enter a valid email address',
              },
            })}
          />
          <AnimatePresence>
            {errors.email && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="form-error"
              >
                {errors.email.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Row 2: Phone + Company */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className="form-label">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            placeholder="+91 XXXXX XXXXX"
            className={inputClass(!!errors.phone)}
            {...register('phone', {
              required: 'Phone is required',
              pattern: {
                value: /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/,
                message: 'Enter a valid Indian mobile number',
              },
            })}
          />
          <AnimatePresence>
            {errors.phone && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="form-error"
              >
                {errors.phone.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div>
          <label htmlFor="companyName" className="form-label">
            Company Name <span className="text-red-500">*</span>
          </label>
          <input
            id="companyName"
            type="text"
            placeholder="Your company name"
            className={inputClass(!!errors.companyName)}
            {...register('companyName', {
              required: 'Company name is required',
            })}
          />
          <AnimatePresence>
            {errors.companyName && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="form-error"
              >
                {errors.companyName.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Row 3: Service + Consultation Type */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="service" className="form-label">
            Service Interested In <span className="text-red-500">*</span>
          </label>
          <select
            id="service"
            className={inputClass(!!errors.service)}
            {...register('service', {
              required: 'Please select a service',
            })}
          >
            <option value="">Select a service</option>
            {SERVICE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <AnimatePresence>
            {errors.service && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="form-error"
              >
                {errors.service.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div>
          <label htmlFor="consultationType" className="form-label">
            Preferred Consultation Type <span className="text-red-500">*</span>
          </label>
          <select
            id="consultationType"
            className={inputClass(!!errors.consultationType)}
            {...register('consultationType', {
              required: 'Please select a consultation type',
            })}
          >
            <option value="">Select type</option>
            {CONSULTATION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <AnimatePresence>
            {errors.consultationType && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="form-error"
              >
                {errors.consultationType.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Row 4: Date */}
      <div>
        <label htmlFor="preferredDate" className="form-label">
          Preferred Date <span className="text-red-500">*</span>
        </label>
        <input
          id="preferredDate"
          type="date"
          min={minDate}
          className={inputClass(!!errors.preferredDate)}
          {...register('preferredDate', {
            required: 'Please select a date',
            validate: (value) => {
              const selected = new Date(value);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return selected > today || 'Please select a future date';
            },
          })}
        />
        <AnimatePresence>
          {errors.preferredDate && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="form-error"
            >
              {errors.preferredDate.message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Row 5: Message */}
      <div>
        <label htmlFor="message" className="form-label">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          rows={4}
          placeholder="Tell us about your requirements..."
          className={inputClass(!!errors.message)}
          {...register('message', {
            required: 'Message is required',
            minLength: {
              value: 10,
              message: 'Message must be at least 10 characters',
            },
          })}
        />
        <AnimatePresence>
          {errors.message && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="form-error"
            >
              {errors.message.message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`btn-primary w-full justify-center py-3.5 text-base ${
          variant === 'modal' ? '' : 'sm:w-auto'
        } ${isSubmitting ? 'cursor-not-allowed opacity-70' : ''}`}
      >
        {isSubmitting ? (
          <>
            <svg
              className="h-5 w-5 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Sending...
          </>
        ) : (
          <>
            Book Consultation
            <HiOutlineArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}
