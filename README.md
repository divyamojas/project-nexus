# 📚 Leaflet — Share the Books You Love 🌿

Welcome to **Leaflet**, a thoughtfully crafted platform for sharing and discovering books with your local and digital communities.

Whether it's lending a treasured novel or browsing what others are reading nearby, Leaflet makes the experience personal, meaningful, and beautifully simple.

---

## 🌐 Live Instances

- **Production**: [leafletbooks.vercel.app](https://leafletbooks.vercel.app/)
- **Development (UAT)**: [uatleafletbooks.vercel.app](https://uatleafletbooks.vercel.app/)

---

## 🌱 What is Leaflet?

Leaflet is a secure and thoughtfully designed book-sharing platform designed to:

- Let users share books they own
- Receive anonymous requests from nearby readers
- Coordinate mutual day and time for book exchange
- (Soon) Chat privately after mutual agreement

At its heart, Leaflet celebrates slower living and story-driven connection.

---

## 🚀 Core Features

### ✅ Already Live:

- Email-based authentication (Signup, Login, Forgot Password)
- Access control using domain restrictions (Gmail & work accounts)
- Secure routing with protected dashboard & layouts
- Pre-built lazy-loaded routing system
- Supabase backend with RLS policies

### 🛠 Coming Soon:

- Fully working book lending system
- Real-time request and lending flow
- Private anonymous messaging
- Notification system
- Searchable catalog and discovery filters
- Responsive mobile experience

---

## 🧰 Tech Stack Overview

| Area      | Stack                                  |
| --------- | -------------------------------------- |
| Frontend  | React + Vite + MUI + Framer Motion     |
| Routing   | React Router v7                        |
| State     | React Context API                      |
| Backend   | Supabase (PostgreSQL + Auth + Storage) |
| Hosting   | Vercel                                 |
| Dev Tools | ESLint + Prettier                      |

---

## 📁 Folder Structure

Here’s a quick breakdown of how this spaceship is organized (cause let’s be real — clean code = clean vibes ✨):

```txt
.
├── eslint.config.js           # Linter rules to keep the code ✨
├── index.html                 # Root HTML file
├── package.json               # Dependencies & scripts
├── package-lock.json          # Lockfile
├── vite.config.js             # Vite power-up config
├── vercel.json                # Vercel deployment settings
├── structure.txt              # Raw file tree (if needed)
├── public/                    # Static assets like favicons and preview
│   ├── favicon.png
│   └── leaflet-preview.png
├── src/                       # Our app lives here 💻
│   ├── api/                   # Optional server-facing API helpers
│   ├── assets/                # Images, logos, static media
│   │   └── images/
│   │       └── leaflet-logo-full.png
│   ├── components/            # Reusable components
│   │   └── Common/
│   │       ├── Layout.jsx
│   │       ├── PageLoader.jsx
│   │       └── PrivateRoute.jsx
│   ├── constants/             # Global constants and enums
│   │   └── constants.jsx
│   ├── contexts/              # Global state using React Context API
│   │   ├── AuthContext.jsx
│   │   ├── BookContext.jsx
│   │   └── UserContext.jsx
│   ├── features/              # Feature-based modules (modular FTW)
│   │   ├── auth/              # Login, signup, forgot password
│   │   ├── books/             # Browse, add, view book modals
│   │   │   └── components/
│   │   │       ├── AddBookModal.jsx
│   │   │       ├── BookCard.jsx
│   │   │       └── BookModal.jsx
│   │   ├── dashboard/         # Dashboard views and widgets
│   │   │   ├── components/
│   │   │   │   ├── BookCarouselSection.jsx
│   │   │   │   ├── FeedbackSection.jsx
│   │   │   │   └── MyBooksSection.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── feedback/          # Feedback page
│   │   │   └── Feedback.jsx
│   │   └── pageNotFound/      # 404 Not Found route
│   │       └── NotFound.jsx
│   ├── hooks/                 # Custom React hooks
│   │   ├── useDebounce.js
│   │   ├── useSession.js
│   │   └── useSessionTracker.jsx
│   ├── services/              # Supabase + external services logic
│   │   ├── authService.js
│   │   ├── bookService.js
│   │   ├── feedbackService.js
│   │   ├── supabaseClient.js
│   │   └── userService.js
│   ├── theme/                 # Theming & palette
│   │   └── theme.js
│   ├── App.jsx                # Main component
│   └── main.jsx               # App entry point
```

Pretty neat, right? All laid out for scale and fun to code on.

---

## 🔐 Environment Setup

Create a `.env` file at the root:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

🚫 Do not expose secrets in the codebase.

---

## 🧪 Getting Started Locally

1. **Clone the repo**

```bash
git clone https://github.com/divyamojas/project-nexus.git
cd project-nexus
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Run the app**

```bash
npm run dev
# or
yarn dev
```

📍 Open [http://localhost:5173](http://localhost:5173) to get started.

---

## 🛣️ Roadmap

- [ ] Book Sharing: Add, Save, Request
- [ ] Request Fulfillment UI
- [ ] Messaging Interface (Anonymous)
- [ ] Book Discovery + Recommendations
- [ ] Push Notifications
- [ ] Profile & Social Features
- [ ] React Native App

---

## 🤝 Contributions

We’re currently in our MVP development phase. Contributions are welcome post-beta launch.
If you’re passionate about books, design systems, or thoughtful community tools — we’d love to hear from you.

---

## 📄 License

© 2025 Leaflet Books. Built with love for communities that read. 🌿

---
