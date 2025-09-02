# Leaflet — Share the Books You Love

Leaflet is a simple, thoughtful way to share books with your community. Add your books, discover what others are willing to lend, and manage requests and returns — all in a clean, friendly interface.

This repository contains the React (Vite) frontend and a thin services layer for Supabase (Auth, DB, Realtime, Storage).

---

## Highlights

- Clean separation: UI uses services only; Supabase usage is isolated to `src/services/`.
- Performant and reactive: Contexts orchestrate UI state; network work is centralized in services.
- Modular and scalable: Hooks/utilities isolate concerns; code organized by domain and reusability.
- Polished UX: Debounced lookups, realtime updates, thoughtful microcopy, and smooth visuals.

---

## Features

- Authentication: Signup, Login, Forgot Password with domain allowlist
- Profile setup with avatar upload (Supabase Storage)
- Browse and save books; filter archived vs. active
- Add book with catalog assist and cover image upload
- Request/accept/reject/cancel borrowing
- Realtime updates for book list via Supabase Realtime

---

## Tech Stack

- React + Vite, Material UI, Framer Motion
- React Router
- React Context API
- Supabase (Auth, Postgres, Realtime, Storage)
- ESLint + Prettier

---

## Project Structure

This layout mirrors the current repository to make navigation predictable.

```
src/
  App.jsx
  main.jsx
  assets/
    images/
  commonComponents/
    Layout.jsx
    PageLoader.jsx
    PrivateRoute.jsx
  constants/
    constants.jsx
  contexts/
    AuthContext.jsx
    BookContext.jsx
    UserContext.jsx
  hooks/
    index.js
    useAvatarDrop.js
    useBookCoverUpload.js
    useDebounce.js
    useImageDrop.js
    useProfileSave.js
    useSession.js
    useSessionTracker.js
  pages/
    auth/
      Login.jsx
      Signup.jsx
      ForgotPassword.jsx
    browseBooks/
      BrowseBooks.jsx
      components/
        BookCard.jsx
        BookModal.jsx
    dashboard/
      Dashboard.jsx
      components/
        AddBookModal.jsx
        BookCarouselSection.jsx
        FeedbackSection.jsx
        MyBooksSection.jsx
    feedback/
      Feedback.jsx
    pageNotFound/
      NotFound.jsx
    profile/
      ProfileSetup.jsx
  services/
    authService.js
    bookCatalogService.js
    bookRequestService.js
    bookService.js
    feedbackService.js
    index.js
    profileService.js
    realtimeService.js
    returnRequestService.js
    savedBookService.js
    supabaseClient.js
    transferService.js
    userReviewService.js
  theme/
    theme.js
  utilities/
    addBookToCatalogAndStock.js
    getActiveBooksForBrowse.js
    getRequestsForBooksOfOwners.js
    getRequestsForUser.js
    index.js
    processLogin.js
    processResetPassword.js
    processSignup.js
    validateAndSubmitBookForm.js
```

Design principles we follow:

- Supabase client usage is limited to `src/services/**` modules.
- UI components never import `supabase`; they call functions from `src/services/index.js`.
- Contexts orchestrate UI state and call services; they do not contain DB logic.
- Hooks are reusable and side-effect-aware; utilities are pure, stateless helpers.

---

## Environment

Create `.env` at the repo root:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Tip: Never commit secrets. The anon key can be public for client apps; protect data with RLS.

---

## Scripts

- `npm run dev` — Start Vite dev server
- `npm run build` — Build for production
- `npm run preview` — Preview production build
- `npm run lint` — Lint code with ESLint

---

## Architecture

1) Services
- All Supabase operations live here. Example modules: `bookService`, `bookRequestService`, `savedBookService`.
- Services are thin and focused; they return plain data or typed objects.
- `services/index.js` is the single import surface for UI/contexts.

2) Contexts
- `AuthContext` wraps auth flows and guards.
- `BookContext` coordinates book lists, saved state, archive/delete actions, and realtime refresh.
- `UserContext` fetches lightweight profile and aggregates user-centric lists.

3) Hooks
- Encapsulate reusable UI patterns, e.g., `useImageDrop`, `useBookCoverUpload`, `useProfileSave`, `useDebounce`.

4) Utilities
- Pure helpers composing services into higher-level flows, e.g., `validateAndSubmitBookForm` and `addBookToCatalogAndStock`.

---

## Performance Notes

- Debounced catalog search reduces request churn during typing.
- Realtime subscription to books table triggers a single `refreshBooks()` instead of ad-hoc fetches.
- Derived lists are memoized in `BookContext` to avoid unnecessary re-renders.
- Service calls accept the current `user` so queries are scoped and cacheable.

---

## Consistency & Conventions

- Naming: Use `user` (not `userData`) throughout. Prefer verbs for actions: `requestBookReturn`, `toggleSaveBook`.
- Comments: Exported utilities, services, and hooks include concise JSDoc-style comments about their use cases.
- Imports: UI imports from `src/services/index.js`, not individual client modules, to keep boundaries clean.
- Errors: Services log errors with context; UI surfaces friendly messages.

---

## UI/UX Guidelines

- Use Material UI components with consistent spacing, sizing, and colors from `theme.js`.
- Use microcopy that is warm and instructive (e.g., “Add a Book”, “Drag & drop…”).
- Keep actions contextual; modals provide focused actions with clear success/failure states.
- Prefer progressive disclosure over crowded UIs; show destructive actions on hover in cards.

---

## Adding a New Feature (Example)

1) Add service function(s) in `src/services/{feature}Service.js` and export via `src/services/index.js`.
2) If stateful, orchestrate in a Context or local component state.
3) If UI logic is reusable, create a custom hook under `src/hooks/`.
4) Use utilities to compose multi-step flows (validation → service calls → UI reset).
5) Keep Supabase usage inside services only.

---

## Development

1) Install dependencies
```
npm install
```

2) Run locally
```
npm run dev
```

3) Lint
```
npm run lint
```

---

## Roadmap

- Messaging between lender and borrower
- Notifications for requests and returns
- Richer discovery and search
- Mobile-first enhancements

---

## License

This project is provided as-is for internal and educational purposes.

---

Built with care for communities that read. 📚🌿

