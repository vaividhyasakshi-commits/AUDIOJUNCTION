# Audio Junction

Customer enquiry form and protected admin dashboard, built with React, Vite, Firebase Authentication, and Cloud Firestore.

## Live links

- Website: https://bhaveshchopra.web.app/
- Enquiry form: https://bhaveshchopra.web.app/#/enquiry
- Admin login: https://bhaveshchopra.web.app/#/admin/login
- Admin dashboard: https://bhaveshchopra.web.app/#/admin/dashboard
- Alternate hosting domain: https://bhaveshchopra.firebaseapp.com/

The dashboard requires the existing authorized Firebase administrator account. Passwords and local environment files are not stored in this repository.

## Local development

1. Install dependencies with `npm ci`.
2. Copy `.env.example` to `.env.local` and fill in the Firebase web app configuration and administrator UID. The UID must match the administrator in `firestore.rules`.
3. Run `npm run dev`.

## Deploy

Use the Firebase CLI signed in to an account with access to the `bhaveshchopra` project:

```sh
npm run build
firebase deploy --only hosting,firestore:rules --project bhaveshchopra
```

Firebase Hosting serves `dist/`. Routes use hash URLs, so the `/#/` portion is required for direct form and admin links. Firestore rules allow public enquiry creation and restrict enquiry reads and updates to the configured administrator.
