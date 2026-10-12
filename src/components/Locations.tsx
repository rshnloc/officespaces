import { motion } from 'framer-motion';
import { HiOutlineMapPin, HiOutlineArrowRight } from 'react-icons/hi2';
import { LOCATIONS } from '../data/constants';

export default function Locations() {
  return (
    <section id="locations" className="bg-white py-20 lg:py-28">
      <div className="container-custom">
        <div className="grid items-start gap-12 lg:grid-cols-2">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
          >
            <span className="section-label mb-4">Our Locations</span>
            <h2 className="mt-4 text-3xl font-bold text-navy sm:text-4xl">
              Premium{' '}
              <span className="relative inline-block">
                <span className="text-gold">Locations</span>
                <svg
                  className="absolute -bottom-1 left-0 w-full"
                  viewBox="0 0 160 8"
                  fill="none"
                >
                  <path
                    d="M1 5.5C38 2 122 2 159 5.5"
                    stroke="#C8962E"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              .
              <br />
              Professional Presence.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-gray-500">
              Establish your business at prime locations with our virtual office
              solutions and access co-working spaces near you.
            </p>

            {/* City Grid */}
            <div className="mt-8 grid grid-cols-2 gap-3">
              {LOCATIONS.map((loc, i) => (
                <motion.div
                  key={loc.city}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  className="flex items-center gap-2.5 rounded-lg border border-gray-100 bg-white px-4 py-3 transition-all duration-200 hover:border-gold/30 hover:shadow-sm"
                >
                  <HiOutlineMapPin className="h-4 w-4 flex-shrink-0 text-gold" />
                  <span className="text-sm font-medium text-navy">
                    {loc.city}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mt-8"
            >
              <a
                href="#contact"
                className="group inline-flex items-center gap-2 rounded-lg border-2 border-gold px-5 py-2.5 text-sm font-semibold text-gold transition-all duration-300 hover:bg-gold hover:text-white"
              >
                Explore All Locations
                <HiOutlineArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </motion.div>
          </motion.div>

          {/* Right - Why Choose Us (combined as in design) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <WhyChooseUs />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function WhyChooseUs() {
  const features = [
    {
      title: 'All-in-One Solutions',
      description:
        'GST, Virtual Office, Co-working and CA services — everything under one roof.',
    },
    {
      title: 'Cost Effective',
      description:
        'Premium services at affordable pricing with transparent packages.',
    },
    {
      title: 'Expert Support',
      description:
        'Experienced professionals and CA experts to support your business.',
    },
    {
      title: 'Flexible Plans',
      description:
        'Choose from a variety of plans that suit your business needs.',
    },
  ];

  return (
    <div className="rounded-2xl bg-gray-50 p-8 lg:p-10">
      <span className="section-label mb-4">Why Choose Us</span>
      <h3 className="mt-4 text-2xl font-bold text-navy sm:text-3xl">
        Everything You Need.
        <br />
        <span className="text-gold">One Place.</span>
      </h3>

      <div className="mt-8 space-y-5">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className="rounded-xl bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md"
          >
            <h4 className="mb-1.5 text-base font-bold text-navy">
              {feature.title}
            </h4>
            <p className="text-sm leading-relaxed text-gray-500">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Image accent */}
      <div className="mt-8 overflow-hidden rounded-xl">
        <img
          src="/images/focus-success.png"
          alt="Focus Plan Execute Success"
          className="h-[200px] w-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>
    </div>
  );
}
