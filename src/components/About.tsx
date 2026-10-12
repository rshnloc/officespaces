import { motion } from 'framer-motion';
import { HiOutlineCheckCircle } from 'react-icons/hi2';
import { ABOUT_FEATURES } from '../data/constants';

export default function About() {
  return (
    <section id="about" className="bg-gray-50 py-20 lg:py-28">
      <div className="container-custom">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
          >
            <span className="section-label mb-4">About Us</span>
            <h2 className="mt-4 text-3xl font-bold text-navy sm:text-4xl">
              Empowering Businesses
              <br />
              with{' '}
              <span className="relative inline-block">
                <span className="text-gold">Smart Solutions</span>
                <svg
                  className="absolute -bottom-1 left-0 w-full"
                  viewBox="0 0 220 8"
                  fill="none"
                >
                  <path
                    d="M1 5.5C53 2 167 2 219 5.5"
                    stroke="#C8962E"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h2>
            <p className="mt-6 text-base leading-relaxed text-gray-500">
              GramWork Spaces is built to support startups, freelancers, SMEs
              and growing businesses with end-to-end business registration, IT solutions,
              virtual office, and compliance services.
            </p>

            {/* Features */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {ABOUT_FEATURES.map((feature, i) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gold/10">
                    <HiOutlineCheckCircle className="h-5 w-5 text-gold" />
                  </div>
                  <span className="text-sm font-medium text-navy">
                    {feature}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right - Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="overflow-hidden rounded-2xl shadow-xl">
              <img
                src="/images/about-office.png"
                alt="Team meeting in modern office"
                className="h-[400px] w-full object-cover lg:h-[450px]"
              />
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-4 -left-4 -z-10 h-full w-full rounded-2xl border-2 border-gold/20" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
