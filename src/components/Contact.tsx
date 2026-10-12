import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineMapPin,
  HiOutlinePhone,
  HiOutlineEnvelope,
  HiOutlineClock,
  HiOutlineClipboardDocument,
  HiOutlineCheck,
  HiOutlineMagnifyingGlass,
  HiOutlinePaperAirplane,
  HiOutlineSparkles,
} from 'react-icons/hi2';
import { CONTACT_INFO, DEPARTMENT_EMAILS } from '../data/constants';
import ConsultationForm from './ConsultationForm';

const CATEGORIES = [
  'All',
  'Sales',
  'Operations',
  'Finance',
  'Technical',
  'Professional',
  'Executive',
  'General',
] as const;

export default function Contact() {
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleCopy = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => {
      setCopiedEmail(null);
    }, 2500);
  };

  const filteredEmails = useMemo(() => {
    return DEPARTMENT_EMAILS.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch =
        item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.department.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <section id="contact" className="bg-white py-20 lg:py-28">
      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="mb-14 text-center"
        >
          <span className="section-label mb-4">Contact Us</span>
          <h2 className="mt-4 text-3xl font-bold text-navy sm:text-4xl">
            Get in{' '}
            <span className="relative inline-block">
              <span className="text-gold">Touch</span>
              <svg
                className="absolute -bottom-1 left-0 w-full"
                viewBox="0 0 100 8"
                fill="none"
              >
                <path
                  d="M1 5.5C24 2 76 2 99 5.5"
                  stroke="#C8962E"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-500">
            Have questions about business registration, IT services, virtual offices,
            or compliance? Send us a message or reach our specialized departments directly.
          </p>
        </motion.div>

        {/* Top Grid: Info & Inline Consultation Form */}
        <div className="grid gap-10 lg:grid-cols-5">
          {/* Left - Contact Info + Map */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            {/* Contact Cards */}
            <div className="space-y-4">
              <div className="flex items-start gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-gold/30 hover:shadow-md">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gold/10">
                  <HiOutlineMapPin className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-bold text-navy">
                    Headquarters & Registered Address
                  </h4>
                  <p className="text-xs leading-relaxed text-gray-600 sm:text-sm">
                    {CONTACT_INFO.address}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-gold/30 hover:shadow-md">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gold/10">
                  <HiOutlinePhone className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-bold text-navy">
                    Direct Phone / WhatsApp
                  </h4>
                  <a
                    href={`tel:${CONTACT_INFO.phone.replace(/\s/g, '')}`}
                    className="text-sm font-semibold text-navy transition-colors hover:text-gold"
                  >
                    {CONTACT_INFO.phone}
                  </a>
                  <p className="mt-0.5 text-xs text-gray-400">
                    Quick response for bookings & consultations
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-gold/30 hover:shadow-md">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gold/10">
                  <HiOutlineEnvelope className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-bold text-navy">
                    Primary Official Email
                  </h4>
                  <a
                    href={`mailto:${CONTACT_INFO.email}`}
                    className="text-sm font-semibold text-navy transition-colors hover:text-gold"
                  >
                    {CONTACT_INFO.email}
                  </a>
                  <p className="mt-0.5 text-xs text-gray-400">
                    General inquiries, website support & partnerships
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-gold/30 hover:shadow-md">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gold/10">
                  <HiOutlineClock className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-bold text-navy">
                    Operating Hours
                  </h4>
                  <p className="text-sm text-gray-600">
                    Monday - Saturday: 9:00 AM - 6:00 PM IST
                  </p>
                  <p className="mt-0.5 text-xs text-emerald-600 font-medium">
                    Support tickets actively monitored 24/7
                  </p>
                </div>
              </div>
            </div>

            {/* Google Map Embed */}
            <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 shadow-sm">
              <iframe
                title="Workspace Headquarters Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d124443.34444390623!2d77.53407338576402!3d12.971598739999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8dfc3e8517e4fe0!2sBengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1710000000000"
                width="100%"
                height="220"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </motion.div>

          {/* Right - Consultation Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6">
                <span className="inline-flex items-center gap-1 rounded-full bg-gold/10 px-3 py-1 text-xs font-bold text-gold">
                  <HiOutlineSparkles className="h-3.5 w-3.5" />
                  Free 30-Min Consultation
                </span>
                <h3 className="mt-2 text-xl font-bold text-navy">
                  Speak With Our Specialists
                </h3>
                <p className="text-sm text-gray-500">
                  Fill out the form below and our team will get in touch with personalized options.
                </p>
              </div>
              <ConsultationForm variant="inline" />
            </div>
          </motion.div>
        </div>

        {/* ========================================================= */}
        {/* Departmental Email Directory Section */}
        {/* ========================================================= */}
        <div id="emails" className="mt-20 scroll-mt-24 border-t border-gray-100 pt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            className="mb-10 text-center"
          >
            <span className="section-label mb-3">Email Directory</span>
            <h3 className="mt-2 text-2xl font-bold text-navy sm:text-3xl">
              Connect Directly with Our{' '}
              <span className="text-gold">Departments</span>
            </h3>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-500">
              For targeted, expedited resolution, reach out to the dedicated department
              handling your specific business, banking, or technical requirements.
            </p>
          </motion.div>

          {/* Search and Filters */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by department, purpose, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-xs font-medium text-navy placeholder-gray-400 outline-none transition-all focus:border-gold focus:bg-white focus:ring-2 focus:ring-gold/20 sm:text-sm"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    selectedCategory === cat
                      ? 'bg-navy text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Directory Cards Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEmails.map((item) => {
              const isCopied = copiedEmail === item.email;
              return (
                <motion.div
                  key={item.email}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35 }}
                  className="group relative flex flex-col justify-between rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-md"
                >
                  <div>
                    {/* Top Row: Department badge + index */}
                    <div className="mb-3 flex items-center justify-between">
                      <span className="rounded-full bg-navy/5 px-2.5 py-0.5 text-[11px] font-bold text-navy">
                        {item.category}
                      </span>
                      <span className="text-[11px] font-semibold text-gray-400">
                        #{item.no.toString().padStart(2, '0')}
                      </span>
                    </div>

                    {/* Department Title */}
                    <h4 className="text-base font-bold text-navy group-hover:text-gold transition-colors">
                      {item.department}
                    </h4>

                    {/* Purpose Description */}
                    <p className="mt-1 text-xs leading-relaxed text-gray-500">
                      {item.purpose}
                    </p>

                    {/* Email Display */}
                    <div className="mt-4 rounded-lg bg-gray-50 p-2.5 border border-gray-100">
                      <span className="block truncate font-mono text-xs font-semibold text-navy">
                        {item.email}
                      </span>
                    </div>
                  </div>

                  {/* Actions: Copy & Direct Send */}
                  <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-3">
                    <button
                      onClick={() => handleCopy(item.email)}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                        isCopied
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : 'bg-white text-navy border border-gray-200 hover:border-gold hover:text-gold'
                      }`}
                      title="Copy email to clipboard"
                    >
                      {isCopied ? (
                        <>
                          <HiOutlineCheck className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <HiOutlineClipboardDocument className="h-3.5 w-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <a
                      href={`mailto:${item.email}?subject=Inquiry%20regarding%20${encodeURIComponent(item.purpose)}`}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-navy px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-gold"
                    >
                      <HiOutlinePaperAirplane className="h-3 w-3" />
                      <span>Send Mail</span>
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {filteredEmails.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center">
              <p className="text-sm text-gray-500">
                No departmental email matched your search query "{searchQuery}".
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="mt-3 text-xs font-bold text-gold hover:underline"
              >
                Clear filter
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
