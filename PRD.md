# GroomGroove PRD
## Tasmania's Dog Grooming Salon Software

**Version:** 2.0  
**Date:** 12 January 2025  
**Status:** Ready for Development

---

## Overview

### Vision
The go-to booking and management platform for dog groomers in Tasmania — simpler, cheaper, and more personal than global alternatives like TapGroom.

### Target Market
- Solo dog groomers in Tasmania
- Small grooming salons (1-5 staff)
- Mobile groomers

### Competitive Position
| Competitor | Price | Weakness |
|------------|-------|----------|
| TapGroom | $22 AUD/mo | Global/generic, native app only, dated UI |
| Gingr | $99+ USD/mo | Enterprise pricing, overkill for small salons |
| Pen & paper | Free | No reminders, no client portal, messy |

**GroomGroove:** Free for solo, $15 AUD/mo for full — web-first, local support, modern UX.

---

## Current State

### Existing Features ✅
- Authentication (login/signup)
- Customer management
- Dog profiles (breed, grooming notes, clipper sizes)
- Appointment calendar
- Basic checkout/payments
- SMS reminders (cron job)
- Appointment history
- Basic reports

### Tech Stack
- **Frontend:** Next.js 16, React 19, Tailwind CSS 4
- **Backend:** Supabase (Postgres, Auth, Real-time)
- **Deployment:** Vercel
- **SMS:** Twilio (via API routes)

---

## Phase 1: Core Improvements (Week 1-2)

### 1.1 Client Self-Booking Portal
**Priority:** 🔴 Critical  
**Why:** #1 differentiator vs TapGroom

**Requirements:**
- Public booking page: `groomgroove.com.au/book/[salon-slug]`
- No login required for clients
- Show available time slots (pulled from calendar)
- Select dog (existing) or add new dog
- Select services from salon's menu
- Confirm booking → SMS/email confirmation
- Salon receives notification of new booking

**Acceptance Criteria:**
- [ ] Client can book in under 2 minutes
- [ ] Works perfectly on mobile
- [ ] Salon can share link on Facebook/Instagram
- [ ] Booking syncs to calendar in real-time

### 1.2 Photo Management
**Priority:** 🟠 High  
**Why:** Groomers love before/after photos, clients share them

**Requirements:**
- Upload photos to dog profile
- Before/after photo pairs on appointments
- Gallery view on dog detail page
- Optional: Share photo to client via SMS/email

**Technical:**
- Use Supabase Storage
- Compress images client-side before upload
- Generate thumbnails

### 1.3 Quick Repeat Booking
**Priority:** 🟠 High  
**Why:** 80% of appointments are repeats

**Requirements:**
- "Book again" button on completed appointments
- Pre-fills: same dog, same services, same time slot
- Suggests date 4/6/8 weeks out (configurable)
- One-click confirm

---

## Phase 2: Business Features (Week 3-4)

### 2.1 Service Menu Management
**Priority:** 🟠 High

**Requirements:**
- CRUD for services (name, duration, price)
- Service categories (wash, cut, full groom, add-ons)
- Per-service duration for calendar blocking
- Display on client booking portal

**Schema:**
```sql
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id UUID REFERENCES salons(id),
  name TEXT NOT NULL,
  category TEXT,
  duration_minutes INTEGER DEFAULT 60,
  price_cents INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.2 Invoices & Receipts
**Priority:** 🟠 High  
**Why:** Aussie groomers need GST-compliant receipts

**Requirements:**
- Generate PDF receipt after checkout
- Include: ABN, GST breakdown, receipt number
- Send via email or SMS link
- Receipt history per customer

### 2.3 Automated Reminders
**Priority:** 🟠 High

**Requirements:**
- Appointment reminder: 24hrs before (SMS)
- Booking confirmation: immediate (SMS/email)
- "Time for a groom" reminder: X weeks after last appointment
- Configurable timing per salon

**Technical:**
- Vercel Cron or Supabase Edge Functions
- Queue system for reliability
- Australian SMS provider (MessageMedia or Twilio AU)

---

## Phase 3: Growth Features (Week 5-6)

### 3.1 Multi-Staff Support
**Priority:** 🟡 Medium

**Requirements:**
- Add staff members to salon
- Staff have their own calendar column
- Assign appointments to specific staff
- Staff-level permissions (view only, edit, admin)

### 3.2 Basic Reporting Dashboard
**Priority:** 🟡 Medium

**Requirements:**
- Revenue this week/month/year
- Appointments count
- Top services by revenue
- Client retention (repeat bookings)
- Export to CSV

### 3.3 Xero Integration
**Priority:** 🟡 Medium  
**Why:** Most Aussie small businesses use Xero

**Requirements:**
- Connect Xero account (OAuth)
- Auto-create invoice in Xero on checkout
- Sync customers to Xero contacts

---

## Phase 4: Differentiation (Week 7-8)

### 4.1 Vaccination Tracking
**Priority:** 🟡 Medium

**Requirements:**
- Record vaccination dates on dog profile
- Alert when vaccination expiring
- Block booking if vaccination expired (optional)

### 4.2 Client Portal
**Priority:** 🟡 Medium

**Requirements:**
- Client login (magic link, no password)
- View upcoming appointments
- View past appointments + photos
- Book new appointment
- Update contact details

### 4.3 Waitlist
**Priority:** 🟢 Low

**Requirements:**
- "Join waitlist" if no slots available
- Auto-notify when slot opens
- First-come-first-served or manual selection

---

## Technical Requirements

### Performance
- Page load < 2 seconds
- Mobile-first responsive design
- Works offline (show cached data, queue actions)

### Security
- Row Level Security on all tables
- Salon data isolation (multi-tenant)
- HTTPS only
- Australian data residency (Supabase Sydney region)

### Reliability
- 99.9% uptime target
- SMS delivery confirmation
- Failed job retry with backoff

---

## Pricing Model

| Tier | Price | Limits |
|------|-------|--------|
| Free | $0 | 1 user, 50 appointments/month, no client portal |
| Pro | $15 AUD/mo | Unlimited appointments, client portal, 3 staff |
| Business | $29 AUD/mo | Unlimited everything, Xero integration, priority support |

---

## Success Metrics

| Metric | Target (3 months) |
|--------|-------------------|
| Active salons in Tasmania | 20 |
| Monthly appointments booked | 500 |
| Client portal adoption | 50% of salons |
| Churn rate | < 5%/month |

---

## Timeline

| Week | Focus | Deliverables |
|------|-------|--------------|
| 1 | Client booking portal | Public booking page live |
| 2 | Photos + repeat booking | Upload flow, "book again" button |
| 3 | Services + invoices | Service menu, PDF receipts |
| 4 | Reminders polish | Reliable SMS, configurable timing |
| 5 | Multi-staff | Staff management, calendar columns |
| 6 | Reporting | Dashboard with key metrics |
| 7 | Xero integration | OAuth flow, invoice sync |
| 8 | Polish + launch | Bug fixes, Tassie launch campaign |

---

## Out of Scope (v2.0)

- Native mobile app (web PWA is sufficient)
- POS hardware integration
- Inventory management
- Multi-location support
- White-labeling

---

## Appendix: Competitor Feature Matrix

| Feature | GroomGroove | TapGroom | Gingr |
|---------|-------------|----------|-------|
| Web app | ✅ | ❌ | ✅ |
| Mobile app | PWA | ✅ | ✅ |
| Client self-booking | ✅ | ✅ | ✅ |
| Photo management | ✅ | ✅ | ✅ |
| SMS reminders | ✅ | ✅ | ✅ |
| Offline mode | Partial | ✅ | ❌ |
| Xero integration | ✅ | ❌ | ❌ |
| Australian support | ✅ Local | Email only | US hours |
| Price (AUD/mo) | $0-29 | $22 | $150+ |
