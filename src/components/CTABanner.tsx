import { motion } from 'framer-motion';
import { HiOutlineArrowRight } from 'react-icons/hi2';

interface CTABannerProps {
  onBookConsultation: () => void;
}

export default function CTABanner({ onBookConsultation }: CTABannerProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-gold to-gold-dark py-6">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-between gap-4 sm:flex-row"
        >
          <p className="text-center text-base font-semibold text-white sm:text-left sm:text-lg">
            Ready to grow your business with the right support?
          </p>
          <button
            onClick={onBookConsultation}
            className="group inline-flex items-center gap-2 rounded-lg bg-navy px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
          >
            Book a Free Consultation
            <HiOutlineArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>
      </div>

      {/* Decorative shapes */}
      <div className="pointer-events-none absolute -top-8 -left-8 h-24 w-24 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -right-4 -bottom-4 h-16 w-16 rounded-full bg-white/10" />
    </section>
  );
}
