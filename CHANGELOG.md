# Changelog

## [0.1.0] - 2025-04-24

### Added

-   Initial Next.js App Router project (TypeScript, Tailwind CSS)
-   MongoDB integration with Mongoose
-   User registration with email, password, and phone
-   OTP-based phone verification using Dialog eSMS API
-   Unified registration + OTP input form
-   Credential-based login using email or phone + password
-   NextAuth session management (JWT strategy)
-   Protected dashboard page using `useSession`
-   Proper file structure with `src/` directory

## [0.1.1] - 2025-04-24

### Fixed

-   Added missing SessionProvider wrapper for useSession
-   Corrected `use client` directive on dashboard page
-   Resolved NextAuth dynamic route registration issue
-   Fixed missing Schema import in Otp model

## [0.2.0] - 2025-04-25

### Added

-   Resend OTP functionality in registration
-   30-second cooldown between OTP resends
-   Maximum of 3 resend attempts per number per 24 hours
-   Resend cooldown timer on frontend

## [0.2.1] - 2025-04-25

### Fixed

-   Automatically resend OTP when an unverified user attempts to login
-   Starts 30-second resend timer immediately after auto-sending OTP

## [0.2.2] - 2025-04-25

### Fixed

-   Switched login to phone-only authentication
-   Enforced unique constraint on phone and email
-   Unified resend OTP behavior for login and registration
-   Started resend timer immediately after login attempts for unverified users

## [0.3.0] - 2025-04-28

### Major Features

-   Completed Full User Registration Flow:

    -   Step 1: Phone number entry with OTP verification.
    -   Step 2: Full form registration after phone verification.

-   Added Fields in Registration:
    -   First Name
    -   Last Name
    -   A/L Year (Dropdown)
    -   NIC Number
    -   Gender (Auto-calculated from NIC)
    -   Birthday (Auto-calculated from NIC)
    -   WhatsApp Number
    -   Manual Address (user typed `uAddress`)
    -   Map Address (Google Maps selected `mapAddress`)
    -   District (Dropdown of 25 Sri Lankan districts)
    -   Email
    -   Password

---

### Google Maps Integration

-   Integrated Google Maps JavaScript API.
-   Added live address selection via clicking on a map.
-   Auto-fetch formatted address using Google Geocoding API.

---

### Technical Improvements

-   Migrated to `AdvancedMarkerElement`:

    -   Future-proofed Google Maps marker rendering.
    -   Removed `google.maps.Marker` deprecation warning.

-   Optimized Google Maps LoadScript:

    -   Fixed performance warning by using static `libraries` array.

-   Improved MongoDB User Schema:

    -   Added `uAddress` (manual input) and `mapAddress` (Google Maps selection).

-   Stabilized API Routes:
    -   `/api/auth/send-otp`
    -   `/api/auth/verify-otp`
    -   `/api/auth/complete-registration`

---

### Backend Security

-   Secure password hashing with bcrypt.
-   Strong validation to prevent duplicate phone and email registrations.

---

### Summary

This release completes the secure user onboarding system,  
laying the foundation for future features like:

-   NIC photo uploads and Level 2 verification
-   Admin dashboards
-   Payment integrations
-   Attendance tracking
