# WedPlan Client — Wedding Planning Platform Frontend

WedPlan Client is the frontend web application for **WedPlan**, a role-based wedding planning and vendor marketplace platform built with Next.js App Router and TypeScript. It provides dedicated interfaces for customers to discover and book wedding services, vendors to manage services, bookings, and subscriptions, and admins to oversee users, listings, and platform transactions.

## Important Features

- **Home & Browse Services:** Wedding-themed hero banner, featured approved/active services, service category exploration, search and filtering, Framer Motion animations, and loading/empty states.
- **Service Details & Booking Requests:** Dynamic `/services/[id]` view with booking form, customer authentication flow, and guardrails against self-booking or duplicate active bookings on the same service and date.
- **Authentication & Role Dashboards:** Better Auth email/password and Google OAuth flows, ImgBB profile image uploads, role-aware navigation, and separate Customer, Vendor, and Admin dashboards with profile management.
- **Stripe Subscription & Payment Flows:** Vendor Premium upgrade checkout integration along with `/payment-success` and `/payment-cancel` views.

## Technology Stack

- **Framework & Language:** Next.js (App Router), TypeScript, React
- **Styling & UI:** Tailwind CSS, ShadCN UI / HeroUI, Framer Motion / Motion, Lucide React, Sonner
- **Authentication & APIs:** Better Auth client, JWT bearer token sync (`authFetch`), Stripe Checkout client/route integration, ImgBB API

## Installation Instructions

1. Clone the client repository:
   ```bash
   git clone https://github.com/Sadiya646/wedplan-client.git
2. Clone the server repository:
   ```bash
   git clone https://github.com/Sadiya646/wedplan-server.git
