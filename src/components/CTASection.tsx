import { motion } from 'framer-motion';
import { HiOutlineCheckCircle, HiOutlineArrowRight } from 'react-icons/hi2';
import { CTA_FEATURES } from '../data/constants';

interface CTASectionProps {
  onBookConsultation: () => void;
}

export default function CTASection({ onBookConsultation }: CTASectionProps) {
  return (
    <section className="bg-gray-50 pb-20 lg:pb-28">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="overflow-hidden rounded-2xl bg-navy"
        >
          <div className="grid items-center lg:grid-cols-2">
            {/* Left - Image */}
            <div className="relative h-[300px] lg:h-full lg:min-h-[380px]">
              <img
                src="/images/cta-background.png"
                alt="Business professionals collaborating"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-navy/40 to-transparent" />
            </div>

            {/* Right - Content */}
            <div className="p-8 lg:p-12">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Let's Build Your
                <br />
                Business{' '}
                <span className="text-gold">Together</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-gray-300">
                Book a free consultation with our experts and take the first
                step today.
              </p>

              {/* Feature List */}
              <div className="mt-6 space-y-3">
                {CTA_FEATURES.map((feature, i) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <HiOutlineCheckCircle className="h-5 w-5 flex-shrink-0 text-gold" />
                    <span className="text-sm font-medium text-white">
                      {feature}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="mt-8"
              >
                <button
                  onClick={onBookConsultation}
                  className="group inline-flex items-center gap-2 rounded-lg bg-gold px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-dark hover:shadow-lg"
                >
                  Book a Free Consultation
                  <HiOutlineArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
