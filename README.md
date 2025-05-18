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

## 📁 Project Structure

```
.
├── public/                  # Static assets
├── src/                    # Source code
│   ├── api/                # Server APIs (optional)
│   ├── assets/             # Images, logos, etc.
│   ├── components/         # Reusable UI components
│   ├── constants/          # App-wide constants
│   ├── contexts/           # Auth, User, Book contexts
│   ├── features/           # Domain-specific modules (auth, books, feedback)
│   ├── hooks/              # Custom React hooks
│   ├── layouts/            # App-wide layouts (Header, Footer)
│   ├── pages/              # Top-level route pages
│   ├── services/           # Supabase clients, external services
│   ├── theme/              # Global theme and styling
│   ├── App.jsx             # Main App component
│   ├── main.jsx            # App bootstrap entry point
│   └── index.css           # Global CSS
├── .env                    # Environment variables
├── eslint.config.js        # Linting rules
├── vite.config.js          # Vite config
└── README.md               # Project guide
```

✅ Well-modularized and scalable for team collaboration.

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

We're currently in our MVP development phase. Contributions are welcome post-beta launch.
If you’re passionate about books, design systems, or thoughtful community tools — we'd love to hear from you.

---

## 📄 License

© 2025 Leaflet Books. Built with love for communities that read. 🌿

---
