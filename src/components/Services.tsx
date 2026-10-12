import { motion } from 'framer-motion';
import { HiOutlineArrowRight } from 'react-icons/hi2';
import { SERVICES } from '../data/constants';

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

export default function Services() {
  return (
    <section id="services" className="bg-white py-20 lg:py-28">
      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <span className="section-label mb-4">Our Services</span>
          <h2 className="mt-4 text-3xl font-bold text-navy sm:text-4xl lg:text-[2.75rem]">
            All Essential Services.
            <br />
            One{' '}
            <span className="relative inline-block">
              <span className="text-gold">Trusted Partner</span>
              <svg
                className="absolute -bottom-1 left-0 w-full"
                viewBox="0 0 240 8"
                fill="none"
              >
                <path
                  d="M1 5.5C57 2 183 2 239 5.5"
                  stroke="#C8962E"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            .
          </h2>
        </motion.div>

        {/* Service Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {SERVICES.map((service) => (
            <motion.div
              key={service.title}
              variants={cardVariants}
              className="card group cursor-pointer border border-gray-100"
            >
              {/* Icon */}
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-navy/5 text-navy transition-all duration-300 group-hover:bg-gold group-hover:text-white">
                <service.icon className="h-7 w-7" />
              </div>

              {/* Title */}
              <h3 className="mb-3 text-lg font-bold text-navy">
                {service.title}
              </h3>

              {/* Description */}
              <p className="mb-5 text-sm leading-relaxed text-gray-500">
                {service.description}
              </p>

              {/* Learn More Link */}
              <a
                href="#contact"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold transition-all duration-200 hover:gap-2.5"
              >
                Learn More
                <HiOutlineArrowRight className="h-4 w-4" />
              </a>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
