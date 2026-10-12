import { motion } from 'framer-motion';
import { HiOutlineArrowRight } from 'react-icons/hi2';
import {
  HiOutlineDocumentText,
  HiOutlineBuildingOffice2,
  HiOutlineGlobeAlt,
} from 'react-icons/hi2';

interface HeroProps {
  onBookConsultation: () => void;
}

export default function Hero({ onBookConsultation }: HeroProps) {
  const handleExploreServices = () => {
    const el = document.querySelector('#services');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-white pt-20 lg:pt-24"
    >
      <div className="container-custom">
        <div className="grid items-center gap-8 pb-12 lg:min-h-[85vh] lg:grid-cols-2 lg:gap-12">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="pt-8 lg:py-0"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold-50 px-4 py-2 text-sm font-semibold text-gold-dark">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                WORK SMART. GROW TOGETHER.
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6 text-4xl leading-tight font-extrabold text-navy sm:text-5xl lg:text-[3.5rem]"
            >
              One Workspace.
              <br />
              Every{' '}
              <span className="relative inline-block">
                <span className="text-gold">Business</span>
                <svg
                  className="absolute -bottom-1 left-0 w-full"
                  viewBox="0 0 200 8"
                  fill="none"
                >
                  <path
                    d="M1 5.5C47 2 153 2 199 5.5"
                    stroke="#C8962E"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{' '}
              Need.
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8 max-w-lg text-base leading-relaxed text-gray-500"
            >
              GramWork Spaces provides Business Registration, IT Services, GST Registration,
              Virtual Office, Co-working Spaces and CA Services — everything your business needs
              to grow, all under one roof.
            </motion.p>

            {/* Service Tags */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8 flex flex-wrap items-center gap-4"
            >
              {[
                { icon: HiOutlineDocumentText, label: 'Business & GST Registration' },
                { icon: HiOutlineBuildingOffice2, label: 'Virtual Office' },
                { icon: HiOutlineGlobeAlt, label: 'Co-working & IT Solutions' },
              ].map((tag) => (
                <span
                  key={tag.label}
                  className="inline-flex items-center gap-2 text-sm font-medium text-gray-600"
                >
                  <tag.icon className="h-4 w-4 text-gold" />
                  {tag.label}
                </span>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <button
                onClick={handleExploreServices}
                className="btn-secondary group"
              >
                Explore Services
                <HiOutlineArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button onClick={onBookConsultation} className="btn-primary group">
                Book a Free Consultation
                <HiOutlineArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
            className="relative"
          >
            <div className="relative">
              {/* Main Image */}
              <div className="overflow-hidden rounded-2xl shadow-2xl">
                <img
                  src="/images/hero-banner.png"
                  alt="Modern co-working office space"
                  className="h-[280px] w-full object-cover md:h-[400px] lg:h-[500px]"
                />
              </div>

              {/* Logo Overlay Card - hidden on mobile */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute -right-2 -bottom-2 hidden rounded-2xl border border-gray-100 bg-white/95 p-4 shadow-2xl backdrop-blur-md sm:block sm:-right-4 sm:-bottom-4 sm:p-5"
              >
                <div className="flex flex-col items-center">
                  <img
                    src="/images/logo.png"
                    alt="GramWork Spaces"
                    className="h-14 w-auto object-contain"
                  />
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold tracking-wider text-navy uppercase">
                      One Workspace. Every Need.
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Decorative dots - hidden on mobile */}
              <div className="absolute -top-6 -right-6 -z-10 hidden grid-cols-4 gap-2 lg:grid">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-2 w-2 rounded-full bg-gold/20"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="pointer-events-none absolute top-0 right-0 -z-10 h-full w-1/2 bg-gradient-to-l from-gold-50/50 to-transparent" />
    </section>
  );
}
