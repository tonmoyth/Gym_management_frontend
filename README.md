# 🏋️ Gym Management SaaS --- Frontend

A modern, role-based Gym Management SaaS frontend built with **Next.js,
TypeScript, Tailwind CSS, and TanStack Query**.

The application provides dedicated experiences for:

-   👑 Super Admin
-   🏢 Business Owner
-   🏋️ Trainer
-   👤 Member

It connects to the Gym Management SaaS backend through a secure Next.js
API proxy and supports authentication, dashboards, gym/business
management, memberships, bookings, attendance, payments, trainer
management, notifications, chat, referrals, disputes, reports, and
administration.

------------------------------------------------------------------------

## 🚀 Tech Stack

-   **Framework:** Next.js (App Router)
-   **Language:** TypeScript
-   **UI:** React
-   **Styling:** Tailwind CSS
-   **Server State:** TanStack Query
-   **Forms:** React Hook Form
-   **Validation:** Zod
-   **API Communication:** Centralized API client
-   **Authentication:** HTTP-only cookies
-   **Maps:** Google Maps
-   **Payments UI:** Stripe
-   **Icons:** Lucide React

------------------------------------------------------------------------

# ✨ Features

## 🔐 Authentication

-   Registration
-   Login
-   Logout
-   Forgot password
-   Reset password
-   Session restoration
-   Role-based authentication
-   Protected routes
-   Unauthorized access handling
-   Token/session refresh

Authentication uses HTTP-only cookies. Access tokens are not stored in
localStorage.

------------------------------------------------------------------------

# 👥 User Roles

The frontend supports:

``` text
SUPER_ADMIN
BUSINESS_OWNER
TRAINER
MEMBER
```

Each role has its own protected dashboard and route group.

------------------------------------------------------------------------

# 👑 Super Admin

### Dashboard

-   Platform overview
-   Total businesses
-   Trainers
-   Members
-   Revenue/statistics
-   Growth information

### Business Management

-   View businesses
-   Search businesses
-   Review pending businesses
-   Approve businesses
-   Reject businesses
-   Suspend businesses
-   View business details

### User Management

-   View users
-   Search users
-   Monitor account status

### Trainer Certification

-   View certification submissions
-   Review certifications
-   Approve/reject certifications
-   Manage verified trainer status

### Subscription & Billing

-   View business subscriptions
-   Monitor subscription status
-   View billing/payment information

### Payment Oversight

-   Monitor payment transactions
-   Payment gateway status
-   Payment history

### Disputes

-   View disputes
-   Review complaints
-   Resolve/dismiss disputes

### Content Moderation

-   Moderate reviews
-   Moderate job posts
-   Review reported content

### Announcements

-   Create system announcements
-   Target announcements
-   Publish platform notices

### Admin Staff

-   Create admin/staff accounts
-   Manage staff
-   Manage permission scopes

### Audit Logs

-   View sensitive administrative actions
-   Search/filter audit logs

### Reports

-   Platform reports
-   Financial reports
-   Usage reports
-   Export support

------------------------------------------------------------------------

# 🏢 Business Owner

Business Owners manage their own gym/business.

### Business Setup & Profile

-   Create business profile
-   Update business information
-   Business description
-   Business location
-   Business profile information

### Membership Plans

-   Create membership plans
-   Update plans
-   Archive/manage plans
-   Set price
-   Set duration
-   Add benefits

### Members

-   View members
-   Search members
-   Manage member information
-   View membership information

### Trainers

-   Manage trainers
-   View trainer profiles
-   Manage trainer-related information

### Booking Approval

-   View booking requests
-   Approve bookings
-   Reject bookings
-   Track booking status

Booking statuses:

``` text
PENDING_APPROVAL
ACTIVE
REJECTED
CANCELLED
EXPIRED
```

### Classes & Schedule

-   Create classes
-   Update schedules
-   Assign trainers
-   Set capacity
-   Manage class schedules

### Attendance

-   View attendance
-   Display business QR
-   Regenerate QR
-   Attendance history

### Equipment

-   Add equipment
-   Update equipment
-   Track quantity
-   Track condition/status
-   Maintenance information

### Payments

-   View payment records
-   Monitor transactions
-   Payment history
-   Membership payment information

Supported payment gateways:

``` text
bKash
Rocket
Nagad
Stripe
```

### Trainer Payouts

-   View payouts
-   Track payout status
-   Payout history

### Announcements

-   Create announcements
-   Target members/trainers
-   Publish announcements

### Reports

-   Revenue
-   Memberships
-   Attendance
-   Bookings
-   Expenses
-   Trainer payouts

------------------------------------------------------------------------

# 🏋️ Trainer

### Trainer Profile

-   Profile information
-   Bio
-   Gender
-   Profile photo
-   Profile completion
-   Specializations

### Certifications

-   Upload certifications
-   Track verification status
-   View approved/rejected certifications
-   Verified badge after approval

Certification states:

``` text
PENDING
VERIFIED
REJECTED
```

### Job Posts

-   Browse available trainer jobs
-   Search/filter jobs
-   View job details
-   Apply for jobs
-   Track applications

### Member Management

-   View assigned members
-   View member information
-   Manage member-related fitness data

### Diet Plans

-   Create diet plans
-   Update diet plans
-   Assign diet plans to members
-   View latest plan updates

### Progress

-   View member progress
-   Add progress records
-   Track progress history

### Reviews

-   View ratings
-   View reviews
-   Monitor average rating

### Payout History

-   View payouts
-   View payout status
-   Track payment history

------------------------------------------------------------------------

# 👤 Member

### Business Discovery

-   Browse gyms/businesses
-   Search businesses
-   Filter businesses
-   View business profiles
-   Location-based discovery

### Membership

-   Browse membership plans
-   Select a plan
-   Checkout
-   View active membership
-   View membership history
-   Track membership status

### Booking

-   Book/join membership plans
-   View booking status
-   View active bookings
-   View booking history

### Payment

Supported payment gateways:

``` text
bKash
Rocket
Nagad
Stripe
```

### QR Attendance

-   Scan gym QR
-   Check in
-   Attendance history
-   Attendance/streak tracking

### Trainers

-   Discover trainers
-   View trainer profile
-   View specialization
-   View ratings
-   View verified badge
-   Chat with trainers

### Diet Plan

-   View assigned diet plan
-   View latest updates
-   View update timestamp

### Fitness Progress

-   View progress
-   View progress history
-   Track fitness records

### Reviews & Ratings

-   Review trainers
-   Rate trainers
-   View reviews

### Favorites

-   Save favorite businesses
-   Manage favorites

### Referrals

-   Invite friends
-   Track referrals
-   View rewards/discounts

### Disputes

-   Raise complaints
-   Select dispute category
-   Add description
-   Upload optional attachment
-   Track dispute status


------------------------------------------------------------------------

# 🔔 Notifications

Notification center is available to authenticated users.

Supported notification types:

``` text
BOOKING
CHAT
JOB_MATCH
ANNOUNCEMENT
PAYOUT
DISPUTE
SYSTEM
```

Users can:

-   View notifications
-   Mark notifications as read
-   Mark all notifications as read

------------------------------------------------------------------------

# 💳 SaaS Subscription

Business Owners can view their platform subscription.

The UI supports:

-   Subscription status
-   Billing information
-   Payment history
-   Renewal-related states

Subscription statuses:

``` text
ACTIVE
INACTIVE
OVERDUE
```


------------------------------------------------------------------------

# 🧱 Application Architecture

The project uses the Next.js App Router.

A typical structure:

``` text
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   │
│   ├── (owner)/
│   ├── (trainer)/
│   ├── (member)/
│   ├── (admin)/
│   │
│   ├── api/
│   │   ├── auth/
│   │   └── proxy/
│   │
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── owner/
│   ├── trainer/
│   ├── member/
│   └── admin/
│
├── lib/
│   ├── api/
│   ├── auth/
│   ├── utils/
│   └── queryClient.ts
│
├── hooks/
├── validators/
└── types/
```

------------------------------------------------------------------------

# 🔌 API Architecture

Frontend API calls go through the Next.js API proxy.

``` text
Browser
   │
   ▼
Next.js API Proxy
   │
   ▼
Backend API
   │
   ▼
PostgreSQL
```

The frontend should not directly expose the backend API URL to
browser-side JavaScript.

API calls are organized through a centralized API layer.

------------------------------------------------------------------------

# 🔐 Route Protection

Public routes include:

``` text
/
/login
/register
/forgot-password
/reset-password
```

Protected role routes include:

``` text
/admin/*
/owner/*
/trainer/*
/member/*
```

Users attempting to access another role's protected area are redirected
to:

``` text
/unauthorized
```

Backend authorization remains the final security boundary.

------------------------------------------------------------------------

# 📦 Installation

## 1. Clone the repository

``` bash
git clone <https://github.com/tonmoyth/Gym_management_frontend.git>
```

## 2. Enter the project

``` bash
cd gym_management_frontend
```

## 3. Install dependencies

``` bash
npm install
```

------------------------------------------------------------------------

# ⚙️ Environment Variables

Create a `.env.local` file in the project root.

``` env
BACKEND_API_URL="http://localhost:5000/api/v1"

NEXT_PUBLIC_APP_ENV="development"

NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Environment Variable Reference

  Variable                               Description
  -------------------------------------- --------------------------
  `BACKEND_API_URL`                      Backend API base URL
  `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`      Google Maps API key
  `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`   Stripe publishable key
  `NEXT_PUBLIC_APP_ENV`                  Application environment
  `NEXT_PUBLIC_APP_URL`                  Frontend application URL

### Important

`BACKEND_API_URL` must remain server-only and therefore must **not** use
the `NEXT_PUBLIC_` prefix.

Never commit `.env.local` or production secrets to Git.

------------------------------------------------------------------------

# ▶️ Development

Run the development server:

``` bash
npm run dev
```

Open:

``` text
http://localhost:3000
```

------------------------------------------------------------------------

# 🏗️ Production Build

Build:

``` bash
npm run build
```

Start:

``` bash
npm start
```

------------------------------------------------------------------------

# 🔑 Demo Login Credentials

> Replace the placeholders below with the actual test accounts used by
> your backend.

## Super Admin

``` text
Email: [tonmoyth143@gmail.com]
Password: [12345678]
```

## Business Owner

``` text
Email:[sihor21370@cwsgear.com]
Password:[12345678]
```

## Trainer

``` text
Email: [rajele2792@hideam.com]
Password:[12345678]
```

## Member

``` text
Email: [yasido2267@fidhost.com]
Password: [12345678]
```

> Use dedicated test accounts only. Never publish real production
> credentials.

------------------------------------------------------------------------

# 🔄 Booking & Payment Flow

The main membership booking flow is:

``` text
Select Membership
       ↓
Checkout
       ↓
Select Payment Gateway
       ↓
Payment
       ↓
Booking Created
       ↓
PENDING_APPROVAL
       ↓
Business Owner Reviews
       ↓
Approved
       ↓
ACTIVE Membership
```

A successful payment does not automatically make the booking active.
Owner approval is required.

------------------------------------------------------------------------

# 🧪 Recommended Testing Flow

## Super Admin

``` text
Login
  ↓
Dashboard
  ↓
Businesses
  ↓
Approve/Reject Business
  ↓
Certifications
  ↓
Subscriptions
  ↓
Users
  ↓
Disputes
  ↓
Reports
```

## Business Owner

``` text
Login
  ↓
Business Setup
  ↓
Membership Plans
  ↓
Members
  ↓
Trainers
  ↓
Classes
  ↓
Attendance
  ↓
Booking Approval
  ↓
Payments
  ↓
Reports
```

## Trainer

``` text
Login
  ↓
Complete Profile
  ↓
Specializations
  ↓
Certification
  ↓
Job Posts
  ↓
Applications
  ↓
Members
  ↓
Diet Plans
  ↓
Progress
  ↓
Chat
```

## Member

``` text
Register/Login
  ↓
Discover Business
  ↓
View Membership
  ↓
Checkout
  ↓
Payment
  ↓
Pending Approval
  ↓
Owner Approval
  ↓
Active Membership
  ↓
QR Attendance
  ↓
Trainer
  ↓
Diet Plan
  ↓
Progress
  ↓
Review
```

------------------------------------------------------------------------

# 🛡️ Security

The frontend follows these principles:

-   HTTP-only authentication cookies
-   Server-side session validation
-   Role-based route protection
-   Centralized API proxy
-   No access tokens in localStorage
-   Server-only backend API URL
-   Form validation
-   Protected dashboards
-   Backend authorization as final security boundary

Frontend role guards are not a replacement for backend authorization.

------------------------------------------------------------------------

# 📱 Responsive UI

The frontend is designed for:

-   Desktop
-   Laptop
-   Tablet
-   Mobile

All major dashboards and user-facing screens should remain usable across
responsive breakpoints.

------------------------------------------------------------------------

# 📊 Data Fetching

TanStack Query is used for server-state management.

It provides:

-   Query caching
-   Background refetching
-   Query invalidation
-   Mutation handling
-   Loading states
-   Error states

UI components should use the centralized API layer instead of directly
calling backend endpoints.

------------------------------------------------------------------------

# 🚀 Production Deployment

Recommended frontend deployment:

**Vercel**

Before deployment:

-   Configure production environment variables
-   Configure backend API URL
-   Configure Google Maps API key
-   Configure Stripe publishable key
-   Configure production app URL
-   Verify HTTPS
-   Verify HTTP-only cookies
-   Test every role
-   Test route protection
-   Test API proxy
-   Test payment flow
-   Test booking approval
-   Test QR attendance
-   Test responsive UI

Example:

``` env
BACKEND_API_URL="https://api.yourgymapp.com/api/v1"

NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="YOUR_PRODUCTION_KEY"

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_YOUR_STRIPE_KEY"

NEXT_PUBLIC_APP_ENV="production"

NEXT_PUBLIC_APP_URL="https://app.yourgymapp.com"
```

# 📄 Project Information

**Project:** Gym Management SaaS

**Frontend:** Next.js + TypeScript

**Backend:** Node.js + Express.js + PostgreSQL + Prisma

**State Management:** TanStack Query

**Authentication:** HTTP-only Cookies

**Deployment:** Vercel

**Status:** Active Development

------------------------------------------------------------------------

# 👨‍💻 Author

**Nurislam Hasan Tonmoy**

Full Stack / Backend Developer

GitHub: `tonmoyth`

------------------------------------------------------------------------

## ⭐ Gym Management SaaS

A complete platform connecting:

``` text
Super Admin
     │
     ├───────────────┐
     ▼               ▼
Business Owner    Platform Management
     │
 ┌───┼─────────────┐
 ▼   ▼             ▼
Members          Trainers
 │                 │
 └────────┬────────┘
          ▼
   Gym Management
```

The platform brings gym management, memberships, trainers, bookings,
attendance, payments, communication, fitness progress, referrals, and
administration into one unified system.
