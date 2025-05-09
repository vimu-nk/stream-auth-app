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

## [0.3.3] 2025-04-29

### Features

-   Assigned a **unique 7-digit ID** to each user at registration (`uniqueId`)
-   Saved the ID in MongoDB and session object
-   Personalized dashboard greeting using the user's `firstName`
-   Displayed the user's unique ID on the dashboard

### Technical Improvements

-   Extended `next-auth` session and user types using `next-auth.d.ts`
-   Injected `firstName` and `uniqueId` into JWT and session callbacks
-   Resolved runtime bug: `Unexpected token '<'` caused by failed fetch to non-existent API
-   Fixed TypeScript errors with strict type definitions for session

### Result

-   Each user now has a distinct system identity (`uniqueId`)
-   Sessions are type-safe and include user-specific metadata
-   Improved stability and developer confidence with cleaner typing

## [0.4.0] 2025-05-01

### Added

-   NIC verification using Google Vision API (PDF417 scanning removed)
-   Upload both front and back of NIC
-   Extract 12-digit NIC number and compare with user-provided NIC
-   Autofill gender and birthday based on NIC structure
-   Full mismatch flow with manual NIC correction
-   Separate endpoint `/api/user/update-nic` for manual override
-   Auto-upgrade verification level to 2 on match
-   Hide verification panel if verified
-   Display user’s verification level next to unique ID on dashboard

### Fixed

-   Session payload now correctly includes `verificationLevel`, `uniqueId`, `firstName`
-   TypeScript declaration for extended session via `next-auth.d.ts`
-   Session refresh issue fixed with `window.location.reload()` workaround after verification

### Removed

-   All references to `orgNIC`, `orgBday`, `orgGender`, and `orgAddress`
-   Removed `fullName` from schema and session

### Notes

-   Google Vision API is used to OCR English-only data
-   System expects front image to contain NIC number, back image to contain address

## [v0.4.1] 2025-05-02

### Added

-   Introduced `AuthCredentialProvider` using React Context to securely store user login credentials after successful authentication
-   Wrapped app layout with `AuthCredentialProvider` to support global access
-   Automatically re-signs user via `signIn("credentials")` after successful NIC verification using stored credentials
-   Auto re-login after successful NIC verification using saved credentials.
-   Updated NIC verification API to return a flag (`autoReLogin`) for triggering re-login.
-   Enhanced `NICVerificationPanel` to handle re-login automatically.

### Fixed

-   Avoided React error from calling `setState()` during render in `LoginPage`
-   Wrapped `ClientProviders` inside `AuthCredentialProvider` in layout to ensure context availability across app

### Improved

-   Eliminated need to re-enter password manually after NIC mismatch and correction
-   Ensured session is updated and user sees correct verification level immediately after NIC verification

## [v0.4.2] 2025-05-02

### Added

-   Logout button in dashboard using `signOut()` from `next-auth/react`
-   Session expiration set to 24 hours (absolute, no sliding refresh)
-   Middleware to protect `/dashboard` and other private routes

### Changed

-   Updated `middleware.ts` to only run on protected paths (`/dashboard/*`, etc.)
-   Root route `/`, static files, and public assets now load without issues

### Fixed

-   Styling and assets not loading due to over-aggressive middleware matcher
-   Public folder now fully accessible by excluding public URLs from protection

## [0.5.0] - 2025-05-04

### Added

-   Updated UI with animations.
-   Placeholder text above the map in the address picker to guide users.
-   Display of the selected address below the map in the registration form.

### Changed

-   Improved the user experience for the address picker in the registration form.
-   Validated email before proceeding to the complete registration step.

### Fixed

-   Ensured dropdown placeholders are not selectable in the registration form.
