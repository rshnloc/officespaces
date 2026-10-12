import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineMapPin,
  HiOutlineUserGroup,
  HiOutlineSparkles,
  HiOutlineArrowRight,
  HiOutlineCheck,
} from 'react-icons/hi2';
import { ApiService } from '../services/api';
import type { OfficeSpace } from '../services/api';
import BookingModal from './BookingModal';

const CATEGORIES = [
  { label: 'All Spaces', value: '' },
  { label: 'Private Offices', value: 'private_office' },
  { label: 'Conference Rooms', value: 'conference_room' },
  { label: 'Meeting Pods', value: 'meeting_room' },
  { label: 'Dedicated Desks', value: 'dedicated_desk' },
  { label: 'Coworking Flex', value: 'coworking_desk' },
  { label: 'Virtual Office', value: 'virtual_office' },
];

export default function OfficeSpaces() {
  const [spaces, setSpaces] = useState<OfficeSpace[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSpaceForBooking, setSelectedSpaceForBooking] = useState<OfficeSpace | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    const params: Record<string, any> = {};
    if (selectedCategory) {
      params.space_type = selectedCategory;
    }

    ApiService.getSpaces(params)
      .then((res) => {
        setSpaces(res.data || []);
      })
      .catch((err) => {
        console.error('Failed to load spaces:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [selectedCategory]);

  return (
    <section id="spaces" className="bg-gray-50/70 py-20 lg:py-28">
      <div className="container-custom">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-label mb-3 inline-block"
          >
            Available Workspaces
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold tracking-tight text-navy sm:text-4xl"
          >
            Explore & Book{' '}
            <span className="relative inline-block">
              <span className="text-gold">Ready-to-Use</span>
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
            </span>{' '}
            Spaces
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-base text-gray-500"
          >
            Reserve high-spec private cabins, meeting rooms, or flexible desks across prime Bangalore and Mumbai tech hubs with instant online confirmation.
          </motion.p>
        </div>

        {/* Category Pills Filter */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.value;
            return (
              <button
                key={cat.label}
                onClick={() => setSelectedCategory(cat.value)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-navy text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-navy'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Spaces Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            // Skeleton loaders
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <div className="h-48 rounded-xl bg-gray-200" />
                <div className="mt-4 h-5 w-3/4 rounded bg-gray-200" />
                <div className="mt-2 h-4 w-1/2 rounded bg-gray-200" />
                <div className="mt-6 h-10 rounded bg-gray-200" />
              </div>
            ))
          ) : spaces.length === 0 ? (
            <div className="col-span-full py-16 text-center">
              <p className="text-gray-400">No office spaces available matching this filter.</p>
            </div>
          ) : (
            spaces.map((space, idx) => (
              <motion.div
                key={space.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08, duration: 0.5 }}
                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Image & Badges */}
                <div className="relative h-52 w-full overflow-hidden bg-gray-100">
                  <img
                    src={
                      space.primary_image?.url ||
                      space.images?.[0]?.url ||
                      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'
                    }
                    alt={space.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="rounded-full bg-navy/90 px-3 py-1 text-[11px] font-bold text-white shadow-sm backdrop-blur-sm">
                      {space.space_type.replace('_', ' ').toUpperCase()}
                    </span>
                    {space.is_featured && (
                      <span className="flex items-center gap-1 rounded-full bg-gold/90 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm backdrop-blur-sm">
                        <HiOutlineSparkles className="h-3 w-3" />
                        Featured
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-6">
                  {/* Location & Capacity */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <HiOutlineMapPin className="h-3.5 w-3.5 text-gold" />
                      {space.location?.name || space.location?.city || 'Bangalore'}
                    </span>
                    <span className="flex items-center gap-1 font-medium text-navy">
                      <HiOutlineUserGroup className="h-3.5 w-3.5 text-gray-400" />
                      Up to {space.capacity} {space.capacity > 1 ? 'People' : 'Person'}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="mt-2 text-lg font-bold text-navy transition-colors group-hover:text-gold">
                    {space.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500">
                    {space.short_description || space.description}
                  </p>

                  {/* Amenities highlights */}
                  {space.amenities && space.amenities.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5 border-t border-gray-100 pt-3">
                      {space.amenities.slice(0, 3).map((amenity) => (
                        <span
                          key={amenity.id}
                          className="flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1 text-[10px] font-medium text-gray-600"
                        >
                          <HiOutlineCheck className="h-3 w-3 text-green-500" />
                          {amenity.name}
                        </span>
                      ))}
                      {space.amenities.length > 3 && (
                        <span className="rounded-md bg-gray-50 px-1.5 py-1 text-[10px] text-gray-400">
                          +{space.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Pricing & CTA */}
                  <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
                    <div>
                      <span className="text-[11px] text-gray-400">Starting from</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-extrabold text-navy">
                          ₹{Number(space.base_price).toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-gray-500">/{space.pricing_unit}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedSpaceForBooking(space)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-navy px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-gold hover:text-navy hover:shadow-md"
                    >
                      Book Now
                      <HiOutlineArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        space={selectedSpaceForBooking}
        isOpen={!!selectedSpaceForBooking}
        onClose={() => setSelectedSpaceForBooking(null)}
      />
    </section>
  );
}
