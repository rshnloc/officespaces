import { motion } from 'framer-motion';
import {
  HiOutlinePhone,
  HiOutlineEnvelope,
  HiOutlineMapPin,
} from 'react-icons/hi2';
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from 'react-icons/fa';
import {
  FOOTER_QUICK_LINKS,
  FOOTER_SERVICES,
  FOOTER_SUPPORT,
  CONTACT_INFO,
} from '../data/constants';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy pt-16 pb-0">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid gap-10 pb-12 sm:grid-cols-2 lg:grid-cols-5"
        >
          {/* Column 1: Brand */}
          <div className="lg:col-span-1">
            <div className="mb-4 flex items-center">
              <img
                src="/images/logo-light.png"
                alt="GramWork Spaces"
                className="h-12 w-auto object-contain"
              />
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              End-to-end Business Registration, IT Solutions, GST, Virtual Office,
              Co-working Spaces, and CA Services under one roof.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="mb-4 text-sm font-bold text-white">Quick Links</h4>
            <ul className="space-y-2.5">
              {FOOTER_QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors duration-200 hover:text-gold"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Our Services */}
          <div>
            <h4 className="mb-4 text-sm font-bold text-white">
              Our Services
            </h4>
            <ul className="space-y-2.5">
              {FOOTER_SERVICES.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors duration-200 hover:text-gold"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Support */}
          <div>
            <h4 className="mb-4 text-sm font-bold text-white">Support</h4>
            <ul className="space-y-2.5">
              {FOOTER_SUPPORT.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors duration-200 hover:text-gold"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Connect */}
          <div>
            <h4 className="mb-4 text-sm font-bold text-white">
              Connect With Us
            </h4>

            {/* Social Icons */}
            <div className="mb-6 flex gap-3">
              {[
                { icon: FaFacebookF, href: '#', label: 'Facebook' },
                { icon: FaInstagram, href: '#', label: 'Instagram' },
                { icon: FaLinkedinIn, href: '#', label: 'LinkedIn' },
                { icon: FaYoutube, href: '#', label: 'YouTube' },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-gray-400 transition-all duration-200 hover:bg-gold hover:text-white"
                >
                  <social.icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <a
                href={`tel:${CONTACT_INFO.phone.replace(/\s/g, '')}`}
                className="flex items-center gap-2.5 text-sm text-gray-400 transition-colors hover:text-gold"
              >
                <HiOutlinePhone className="h-4 w-4 flex-shrink-0" />
                {CONTACT_INFO.phone}
              </a>
              <a
                href={`mailto:${CONTACT_INFO.email}`}
                className="flex items-center gap-2.5 text-sm text-gray-400 transition-colors hover:text-gold"
              >
                <HiOutlineEnvelope className="h-4 w-4 flex-shrink-0" />
                {CONTACT_INFO.email}
              </a>
              <div className="flex items-start gap-2.5 text-sm text-gray-400">
                <HiOutlineMapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{CONTACT_INFO.address}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-white/10">
        <div className="container-custom py-5 text-center">
          <p className="text-xs text-gray-500">
            © {currentYear} GramWork Spaces. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
