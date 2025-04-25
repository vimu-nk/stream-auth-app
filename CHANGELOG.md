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
