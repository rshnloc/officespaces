# Modern Office Spaces — Upgrade Roadmap & Verification Guide

## 1. Executive Goal & Vision

### Overarching Objective
Transform the **Modern Office Spaces** web platform from a presentation & booking prototype into a **commercial-grade, high-converting Coworking & Managed Office SaaS Platform** rivaling industry leaders (such as WeWork, Awfis, and Industrious).

### Key Goals
1. **Self-Serve Booking & Payment Automation**: Live availability, 10-minute temporary seat locking, Razorpay/Stripe checkout, instant GST tax invoices, and `.ics` calendar invites.
2. **Customer Self-Service Portal**: Account area to manage multi-location reservations, cancel/reschedule with automatic refund calculations, download invoices, and manage team members.
3. **Advanced Admin ERP & Resource Scheduler**: Drag-and-drop Day/Week/Month resource scheduler (FullCalendar), real-time occupancy heatmaps, CRM lead pipelines, and revenue analytics.
4. **Rich Visual Exploration**: Interactive floor plans, photo carousels, 360° virtual tours, neighborhood transit scores, and a step-by-step Virtual Office & MCA Compliance Package configurator.
5. **Production Hardening & Reliability**: Schema validation (Zod), token refresh rotation, rate limiting, automated email/SMS webhooks, and full test suites (Vitest + Playwright).

---

## 2. Architecture Overview

```
Frontend (React 19 + TypeScript + Vite)
 ├── Public Discovery & Listings
 ├── Virtual Office Package Configurator
 ├── Interactive Calendar & Slot Picker
 ├── Customer Dashboard (/dashboard)
 └── Admin ERP (/admin)
          │ (HTTPS REST API /api/v1)
          ▼
Backend (Node.js + Express + TypeScript)
 ├── Zod Validation & Rate Limiting
 ├── JWT Auth & Role Access Control
 ├── Concurrency Slot Locking Service (10m TTL)
 ├── Razorpay / Stripe Payment & Webhook Engine
 ├── PDF Tax Invoice Generator (GST Compliant)
 ├── Nodemailer Email & ICS Calendar Service
 └── Atomic Persistent JSON Store
```

---

## 3. Prioritized Multi-Task Implementation Roadmap

```
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 1: Commercial Booking Engine & Payment Webhooks                  │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 2: Customer Self-Service Portal & GST Tax Invoicing              │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 3: Interactive Floor Plans & Visual Space Exploration            │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 4: Operational Admin ERP, Resource Calendar & Analytics          │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 5: Automated Communications, Email/SMS & Calendar Invites        │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 6: Enterprise Security, Rate Limiting & Automated Test Suite     │
└────────────────────────────────────────────────────────────────────────┘
```

---

### Phase 1: Commercial Booking Engine & Payment Webhooks

| Task ID | Component | Feature | Details |
| :--- | :--- | :--- | :--- |
| **T1.1** | **Backend** | Temporary Slot Locking (Pessimistic Concurrency) | Lock space slot for 10 minutes upon entering checkout to prevent simultaneous double-booking. Auto-release expired locks. |
| **T1.2** | **Backend** | Payment Gateway Webhook Integration | Implement Razorpay / Stripe checkout order creation (`/api/v1/payments/create-order`) and cryptographic webhook verification (`/api/v1/payments/webhook`). |
| **T1.3** | **Frontend** | Multi-Step Checkout Modal | Dynamic checkout: (1) Date/Time & Addons → (2) Customer/GST Details → (3) Coupon Code → (4) Gateway Payment popup → (5) Success screen. |
| **T1.4** | **Backend** | Automated Cancellation & Refund Engine | Compute prorated refund based on active `CancellationRule` (e.g., 100% refund >24h, 50% >12h, 0% <12h), record payment refund record. |

---

### Phase 2: Customer Self-Service Portal & GST Tax Invoicing

| Task ID | Component | Feature | Details |
| :--- | :--- | :--- | :--- |
| **T2.1** | **Backend** | PDF Tax Invoice Engine | Generate dynamic GST-compliant PDF invoices with company letterhead, tax breakdown (CGST/SGST/IGST), QR verification, and download route (`/api/v1/bookings/:id/invoice`). |
| **T2.2** | **Frontend** | Customer Dashboard (`/dashboard`) | Tabbed customer portal: **Upcoming Bookings**, **Booking History**, **Billing & Invoices**, and **Company KYC / GST Details**. |
| **T2.3** | **Frontend** | 1-Click Reschedule / Cancel Flow | Allow customers to reschedule to open slots or cancel booking with real-time refund estimation display before confirmation. |
| **T2.4** | **Frontend** | Virtual Office Custom Quote Builder | Interactive multi-step calculator for Virtual Office tiers (Mailing address, GST registration, MCA registration, Courier handling) with instant price calculation. |

---

### Phase 3: Interactive Floor Plans & Visual Space Exploration

| Task ID | Component | Feature | Details |
| :--- | :--- | :--- | :--- |
| **T3.1** | **Frontend** | Dedicated Space Details View (`/spaces/:slug`) | Standalone page with multi-angle photo gallery (lightbox zoom), virtual 360° tour viewer, full amenity breakdown, and dynamic hourly/daily pricing toggle. |
| **T3.2** | **Frontend** | Interactive Floor Plan / Desk Map | SVG-based clickable floor plan showing booked vs. available desks/cabins in real-time. Clicking an available seat populates the booking slot. |
| **T3.3** | **Frontend** | Location Hub & Transit Neighborhood Guide | Location pages (`/locations/:city`) featuring transit connectivity (nearest metro, airport distance), parking availability, and neighborhood amenities. |
| **T3.4** | **Frontend** | Space Comparison Drawer | Allow users to select up to 3 spaces and compare capacity, hourly rate, included amenities, and cancellation terms side-by-side. |

---

### Phase 4: Operational Admin ERP, Resource Calendar & Analytics

| Task ID | Component | Feature | Details |
| :--- | :--- | :--- | :--- |
| **T4.1** | **Frontend** | Drag-and-Drop Resource Timeline (FullCalendar) | Interactive visual calendar showing all rooms/desks on the Y-axis and hours/days on the X-axis. Click to create, drag to reschedule, color-coded by status. |
| **T4.2** | **Backend** | Advanced Analytics & Utilization Metrics | Endpoint `/api/v1/admin/analytics` returning room utilization rates, revenue per available square foot, peak booking hours, and coupon ROI. |
| **T4.3** | **Frontend** | Analytics Charts Dashboard | Visual charts (Recharts) displaying Monthly Revenue, Booking Volumes by Space Type, and Occupancy Heatmaps. |
| **T4.4** | **Backend & UI** | CRM Inquiry & Lead Pipeline | Kanban board or pipeline view for consultation leads (`New` → `Contacted` → `Tour Scheduled` → `Converted` → `Closed`). |

---

### Phase 5: Automated Communications & Calendar Integrations

| Task ID | Component | Feature | Details |
| :--- | :--- | :--- | :--- |
| **T5.1** | **Backend** | Transactional Email Service (Nodemailer) | Send HTML emails for: (1) Booking Confirmation with PDF invoice attachment, (2) Booking Cancellation/Refund, (3) Welcome Email. |
| **T5.2** | **Backend** | Calendar Invite Generator (`.ics`) | Attach an RFC-compliant `.ics` calendar invitation file to confirmation emails so bookings automatically sync to Google Calendar / Outlook / Apple Calendar. |
| **T5.3** | **Backend** | Automated Cron Reminders | Background cron task running daily to email reminder notifications 24 hours prior to booking start time. |
| **T5.4** | **Frontend** | "Add to Calendar" UI Buttons | In the booking confirmation modal and dashboard, provide 1-click links for Google Calendar, Outlook, and Apple Calendar. |

---

### Phase 6: Enterprise Security, Hardening & Automated Testing

| Task ID | Component | Feature | Details |
| :--- | :--- | :--- | :--- |
| **T6.1** | **Backend** | Zod Request Validation Middleware | Strict runtime input validation for all POST/PUT bodies, query params, and route parameters with formatted error responses. |
| **T6.2** | **Backend** | Rate Limiting & Helmet Security Headers | Add `helmet` security headers, CORS origin enforcement, and `express-rate-limit` on auth endpoints (max 10 login attempts per 15 min). |
| **T6.3** | **Backend** | Token Refresh Rotation | Implement short-lived Access Tokens (15m) and secure Refresh Tokens (7d) stored with rotation to prevent session hijacking. |
| **T6.4** | **Testing** | Automated Unit & Integration Suite | Backend tests (Supertest + Vitest) covering all auth, booking, slot check, and coupon validation endpoints. |
| **T6.5** | **Testing** | End-to-End (E2E) Browser Tests | Playwright E2E tests validating the complete user journey: Discover space → Calculate price → Book → Login → Admin verifies booking. |

---

## 4. Verification & Testing Strategy

Each completed task should be verified using this three-tiered testing methodology:

```
┌────────────────────────────────────────────────────────┐
│  Tier 1: Automated Test Suites (Unit & Integration)    │
│  npm test (Backend API & Services)                     │
├────────────────────────────────────────────────────────┤
│  Tier 2: Direct API Verification (cURL / HTTP Suite)   │
│  Validating status codes, schemas, and error states    │
├────────────────────────────────────────────────────────┤
│  Tier 3: End-to-End User Verification (UI Scenarios)   │
│  Testing real browser journeys for Customer & Admin    │
└────────────────────────────────────────────────────────┘
```

### Verification Checklist by Task Category

#### 1. Verifying Payment & Concurrency (Phase 1)
- [ ] **Slot Hold Test**: Request a hold on a slot via `POST /api/v1/spaces/:id/hold-slot`. Verify a second request for the same slot returns `409 Conflict` until 10 minutes expire.
- [ ] **Webhook Idempotency**: Send the same gateway webhook payload twice. Verify the second request returns `200 OK` without duplicating payments or altering state.
- [ ] **Refund Calculation**: Book a slot >24 hours away and call cancel. Verify `refund_amount == base_price + tax_amount - discount`.

#### 2. Verifying Customer Portal & Invoices (Phase 2)
- [ ] **PDF Download**: Run `curl -H "Authorization: Bearer <token>" http://localhost:8000/api/v1/bookings/1/invoice --output invoice.pdf`. Open file and verify company headers, GST numbers, and accurate currency totals.
- [ ] **Customer Dashboard Access**: Log in as `customer@example.com` / `user123`. Verify only bookings matching user ID 3 are displayed in `/dashboard`.

#### 3. Verifying Floor Plans & Interactive Views (Phase 3)
- [ ] **Floor Plan Click-to-Book**: On `/spaces/:slug`, click Seat D-04 on the SVG map. Verify the booking modal opens pre-filled with Seat D-04 and the correct seat pricing.
- [ ] **Comparison Drawer**: Add 2 spaces to comparison. Verify the comparison drawer renders accurate specs (capacity, sq ft, amenities, hourly rates).

#### 4. Verifying Admin ERP & Calendar (Phase 4)
- [ ] **Resource Scheduler Drag**: In Admin Portal, drag a booking block from 10:00 AM to 02:00 PM. Verify `PUT /api/v1/admin/bookings/:id/reschedule` is dispatched and updates `db.json`.
- [ ] **Analytics Verification**: Call `GET /api/v1/admin/analytics`. Verify `total_revenue`, `utilization_rate_pct`, and `occupancy_trend` match existing booking totals.

#### 5. Verifying Email & Calendar Invites (Phase 5)
- [ ] **Nodemailer Sandbox Verification**: Create a test booking. Check Mailtrap / Ethereal inbox to verify email arrives with formatted HTML and `.ics` attachment.
- [ ] **ICS File Parse**: Download the generated `.ics` attachment and import into Apple Calendar or Google Calendar. Verify exact start and end timestamps.

#### 6. Verifying Security & Production Hardening (Phase 6)
- [ ] **Rate Limiting Check**: Send 12 consecutive invalid login requests within 1 minute. Verify request #11 returns `429 Too Many Requests`.
- [ ] **Zod Input Guard**: Send malformed JSON to `POST /api/v1/bookings` (e.g., negative duration, invalid date format). Verify the server returns `422 Unprocessable Entity` with clean error messages.

---

## 5. Ready-to-Run Verification Commands

### Core API Verification Commands
```bash
# 1. Verify Backend Health
curl -s http://localhost:8000/api/v1/settings | grep "company_name"

# 2. Verify Sample Admin Authentication
curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# 3. Verify Sample Customer Authentication
curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@example.com","password":"user123"}'

# 4. Verify Coupon Validation
curl -s -X POST http://localhost:8000/api/v1/coupons/validate \
  -H "Content-Type: application/json" \
  -d '{"code":"WELCOME10","booking_amount":3000}'

# 5. Verify Server-Side Price Calculation
curl -s -X POST http://localhost:8000/api/v1/spaces/1/calculate-price \
  -H "Content-Type: application/json" \
  -d '{"start_time":"10:00","end_time":"14:00","pricing_unit":"hourly","num_people":4,"booking_date":"2026-10-15","coupon_code":"WELCOME10"}'
```

### Build & Compilation Commands
```bash
# Frontend Compilation & Bundling
npm run build

# Backend Type-Checking & Compilation
cd backend && npm run build && cd ..
```
