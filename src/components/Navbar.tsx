import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineBars3, HiOutlineXMark } from 'react-icons/hi2';
import { NAV_LINKS } from '../data/constants';

import type { User } from '../services/api';

interface NavbarProps {
  onBookConsultation: () => void;
  user?: User | null;
  onOpenAuth?: () => void;
  onOpenPortal?: () => void;
}

export default function Navbar({ onBookConsultation, user, onOpenAuth, onOpenPortal }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'glass shadow-[var(--shadow-navbar)]'
            : 'bg-white'
        }`}
      >
        <div className="container-custom">
          <div className="flex h-18 items-center justify-between lg:h-20">
            {/* Logo */}
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('#home');
              }}
              className="group flex items-center py-1 transition-opacity hover:opacity-95"
            >
              <img
                src="/images/logo.png"
                alt="GramWork Spaces"
                className="h-11 w-auto object-contain transition-transform duration-200 group-hover:scale-105 sm:h-12"
              />
            </a>

            {/* Desktop Navigation */}
            <div className="hidden items-center gap-1 lg:flex">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.href);
                  }}
                  className="relative rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors duration-200 hover:text-navy"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#spaces"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('#spaces');
                }}
                className="relative rounded-lg px-3 py-2 text-sm font-semibold text-gold transition-colors duration-200 hover:text-navy"
              >
                Workspaces
              </a>
            </div>

            {/* CTA Buttons + Mobile Menu Toggle */}
            <div className="flex items-center gap-2 sm:gap-3">
              {user ? (
                <button
                  onClick={onOpenPortal}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-navy/20 bg-navy/5 px-3 py-2 text-xs font-bold text-navy transition-all hover:bg-navy hover:text-white"
                >
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  {user.role === 'super_admin' || user.role === 'admin' ? 'Admin Portal' : 'My Bookings'}
                </button>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-navy transition-all hover:border-gold hover:text-gold"
                >
                  Sign In
                </button>
              )}

              <button
                onClick={onBookConsultation}
                className="btn-primary hidden text-sm lg:inline-flex"
              >
                Book a Free Consultation
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-navy transition-colors hover:bg-gray-100 lg:hidden"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <HiOutlineXMark className="h-6 w-6" />
                ) : (
                  <HiOutlineBars3 className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 z-50 h-full w-[300px] bg-white shadow-2xl lg:hidden"
            >
              <div className="flex h-18 items-center justify-between border-b border-gray-100 px-4">
                <img
                  src="/images/logo.png"
                  alt="GramWork Spaces"
                  className="h-9 w-auto object-contain"
                />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-navy hover:bg-gray-100"
                  aria-label="Close menu"
                >
                  <HiOutlineXMark className="h-6 w-6" />
                </button>
              </div>
              <div className="flex flex-col gap-1 px-4 py-4">
                {NAV_LINKS.map((link, i) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(link.href);
                    }}
                    className="rounded-lg px-4 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-gold-50 hover:text-navy"
                  >
                    {link.label}
                  </motion.a>
                ))}
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onBookConsultation();
                    }}
                    className="btn-primary w-full justify-center"
                  >
                    Book a Free Consultation
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
