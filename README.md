# WedPlan — Wedding Planning Platform

WedPlan is a full-stack, role-based wedding planning and vendor marketplace web application built with Next.js, TypeScript, Express.js, MongoDB, Better Auth, and Stripe. Customers can explore wedding services, filter and search listings, view package details, and submit or manage booking requests. Vendors can manage their profiles and wedding services (including Free plan limits and Premium Stripe subscriptions) and respond to customer booking requests. Admins manage users, review and moderate services, and monitor platform transactions.

## Important Features

- **Customer Experience:** Browse approved and active wedding services, search and filter by category/location/price, inspect service details (`/services/[id]`), submit booking requests (with guardrails against booking own services or duplicate active bookings on the same service and event date), track booking statuses, cancel pending bookings, and update profile details.
- **Vendor Experience:** Create and update vendor profile information (including business name and ImgBB profile image), add/edit/delete/toggle wedding services (defaulting to `Pending` status until admin approval), publish up to 3 active services on the Free plan or upgrade to Premium via Stripe Checkout for unlimited active services, and accept or reject customer booking requests.
- **Admin Experience:** View platform statistics, search/filter/manage users (role updates and account blocking/unblocking), review and approve/reject/delete services, and monitor platform transactions recorded after verified Stripe webhook events.
- **Authentication & Security:** Better Auth credential and Google OAuth sign-in/sign-up, JWT bearer token verification (`verifyJWT`), server-side role checks (`verifyRole`), resource ownership checks, and verified Stripe webhook handling.

## Technology Stack

- **Frontend:** Next.js (App Router), TypeScript, React, Tailwind CSS, ShadCN UI / HeroUI, Framer Motion / Motion, Lucide React, Sonner
- **Authentication & Authorization:** Better Auth, JWT verification middleware, Role-based access control middleware, Server-to-server signed webhook tokens
- **Backend & Database:** Node.js, Express.js, MongoDB Atlas
- **Payments & Media:** Stripe Checkout & Webhooks, ImgBB


## Installation Instructions

1. Clone the client repository:
   ```bash
   git clone https://github.com/Sadiya646/wedplan-client.git
2. Clone the server repository:
   ```bash
   git clone https://github.com/Sadiya646/wedplan-server.git
## Live Link
```bash
wedplan-client-coral.vercel.app
wedplan-server-sooty.vercel.app
