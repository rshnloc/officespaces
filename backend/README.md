# Modern Office Spaces — Node.js & TypeScript API Backend

High-performance, type-safe REST API backend built in **Node.js**, **TypeScript**, and **Express.js**.

Replaces the legacy PHP/Laravel backend while preserving 100% of the API schema, endpoints, data contracts, and calculations expected by the frontend.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Run in Development Mode
```bash
npm run dev
```
Starts development server with auto-reload (`tsx watch`) on **`http://localhost:8000`**.

### 3. Build for Production
```bash
npm run build
npm start
```
Compiles TypeScript into `dist/` and runs the production server.

---

## 🔑 Pre-Seeded Default Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Super Admin** | `admin@example.com` | `admin123` |
| **Operations Manager** | `manager@example.com` | `admin123` |
| **Demo Customer** | `customer@example.com` | `user123` |

---

## 🗄️ Database & Storage

- **Zero setup required**: No local MySQL daemon or C++ native compile steps needed.
- Uses an atomic persistent JSON database engine located at `backend/data/db.json`.
- Automatically initializes with complete seed data on first run:
  - 4 Prime Locations (Indiranagar, Koramangala, HSR Layout, BKC Mumbai)
  - 6 Diverse Spaces (Private Suites, 4K Boardrooms, Dedicated Desks, Flex Desks, Virtual Offices)
  - 12 Curated Amenities
  - Real coupons (`WELCOME10` - 10% off, `STARTUP500` - ₹500 off)
  - Tax (GST 18%) & Cancellation policies
  - Reviews, CMS sections, System Settings

---

## 📡 API Endpoints Overview (Base URL: `/api/v1`)

### 🌐 Public Endpoints
- `POST /api/v1/auth/register` — Customer registration
- `POST /api/v1/auth/login` — Login (returns Bearer JWT)
- `GET /api/v1/locations` — Active locations with space counts
- `GET /api/v1/locations/:identifier` — Location details
- `GET /api/v1/spaces` — Filtered space listings (capacity, price, type, location, amenities, search)
- `GET /api/v1/spaces/:identifier` — Office space details with images & amenities
- `GET /api/v1/amenities` — Available amenities
- `GET /api/v1/spaces/:officeSpace/availability` — Time slots for a date
- `GET /api/v1/spaces/:officeSpace/check-slot` — Conflict check
- `GET /api/v1/spaces/:officeSpace/calendar` — Monthly bookings & blocked calendar
- `POST /api/v1/spaces/:officeSpace/calculate-price` — Server-side verified price calculation (GST 18%, weekend/holiday, coupons)
- `POST /api/v1/bookings` — Create a workspace booking
- `GET /api/v1/bookings/:identifier` — View booking details
- `POST /api/v1/coupons/validate` — Validate coupon code
- `GET /api/v1/reviews` — Approved testimonials
- `POST /api/v1/reviews` — Submit a review
- `GET /api/v1/cms/sections/:pageSlug` — CMS sections
- `GET /api/v1/settings` — Public company settings
- `POST /api/v1/consultations` — Submit inquiry / lead form

### 👤 Authenticated Endpoints (`Authorization: Bearer <token>`)
- `GET /api/v1/auth/me` — Current user profile
- `PUT /api/v1/auth/profile` — Update profile
- `POST /api/v1/auth/change-password` — Change password
- `POST /api/v1/auth/logout` — Logout
- `GET /api/v1/customer/my-bookings` — Customer booking history
- `POST /api/v1/bookings/:booking/cancel` — Cancel booking

### 🛡️ Admin Endpoints (`role: super_admin | admin | manager`)
- `GET /api/v1/admin/dashboard/summary` — KPI summary cards (spaces, bookings, occupancy, revenue)
- `GET /api/v1/admin/dashboard/charts` — Booking & revenue trends
- `GET /api/v1/admin/bookings` — Manage all bookings
- `PUT /api/v1/admin/bookings/:booking/status` — Update booking status
- `POST /api/v1/admin/bookings/:booking/reschedule` — Reschedule booking
- `GET /api/v1/admin/bookings-export` — Export bookings as CSV
- `GET /api/v1/admin/customers` — Customer directory
- `POST /api/v1/admin/spaces` — Create new office space
- `PUT /api/v1/admin/spaces/:id` — Edit office space
- `DELETE /api/v1/admin/spaces/:id` — Delete office space
- `GET /api/v1/admin/coupons` — Coupon management
- `POST /api/v1/admin/coupons` — Create coupon
- `DELETE /api/v1/admin/coupons/:id` — Delete coupon
- `GET /api/v1/admin/consultations` — Inquiries & leads
- `PUT /api/v1/admin/consultations/:id` — Update inquiry status
- `GET /api/v1/admin/payments` — Payment records
- `POST /api/v1/admin/bookings/:id/payments` — Record manual payment
- `GET /api/v1/admin/audit-logs` — Activity audit logs
