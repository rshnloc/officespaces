import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiStar } from 'react-icons/hi2';
import { TESTIMONIALS } from '../data/constants';
import { ApiService } from '../services/api';
import type { Review } from '../services/api';

export default function Testimonials() {
  const [reviews, setReviews] = useState<any[]>(TESTIMONIALS);

  useEffect(() => {
    ApiService.getReviews({ featured: true })
      .then((res) => {
        if (res.data && res.data.length > 0) {
          const mapped = res.data.map((r: Review) => ({
            name: r.author_name,
            title: r.author_title || 'Client',
            company: r.author_company || 'Enterprise',
            avatar:
              r.author_avatar ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
            rating: r.rating || 5,
            quote: r.comment,
          }));
          setReviews(mapped);
        }
      })
      .catch((err) => {
        console.warn('Using default testimonials:', err);
      });
  }, []);

  return (
    <section id="testimonials" className="bg-gray-50 py-20 lg:py-28">
      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="mb-14 text-center"
        >
          <span className="section-label mb-4">What Our Clients Say</span>
          <h2 className="mt-4 text-3xl font-bold text-navy sm:text-4xl">
            Trusted by{' '}
            <span className="relative inline-block">
              <span className="text-gold">500+ Businesses</span>
              <svg
                className="absolute -bottom-1 left-0 w-full"
                viewBox="0 0 260 8"
                fill="none"
              >
                <path
                  d="M1 5.5C62 2 198 2 259 5.5"
                  stroke="#C8962E"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h2>
        </motion.div>

        {/* Testimonial Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {reviews.map((testimonial, i) => (
            <motion.div
              key={testimonial.name + i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="card border border-gray-100 bg-white"
            >
              {/* Header - Avatar + Info */}
              <div className="mb-5 flex items-center gap-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-sm font-bold text-navy">
                    {testimonial.name}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {testimonial.title}, {testimonial.company}
                  </p>
                </div>
              </div>

              {/* Rating */}
              <div className="mb-4 flex gap-0.5">
                {Array.from({ length: testimonial.rating || 5 }).map((_, j) => (
                  <HiStar key={j} className="h-4 w-4 text-gold" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm leading-relaxed text-gray-600 italic">
                "{testimonial.quote}"
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
