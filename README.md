
# 📚 Leaflet — Share the Books You Love 🌿

Welcome to **Leaflet** —
A cozy new way to share, discover, and celebrate the books that move you.

---

## 🌐 Live Websites

- **Production**: [leafletbooks.vercel.app](https://leafletbooks.vercel.app/)
- **Development (UAT)**: [uatleafletbooks.vercel.app](https://uatleafletbooks.vercel.app/)

---

## 🪴 About Leaflet

**Leaflet** is a friendly community platform where users can:

- Share the books they own
- Request books anonymously
- Set mutual days and times for pickup
- Engage through cozy private chats (coming soon!)

We believe in **slowing down**, **discovering stories**, and **building real communities through books**. 🌿✨

---

## 🚀 Features

### ✅ Implemented:

- Early access landing page with email capture
- Authentication system (Signup, Login, Forgot Password)
- Domain restriction for work and Gmail accounts
- Protected Dashboard with lazy-loaded routes
- SPA routing enabled on Vercel with RLS-secured Supabase backend

---

### 📋 Upcoming:

- Book sharing system (Add/Request Books)
- Mutual Day & Time coordination for book transfers
- Anonymous private chat after book request acceptance
- Notifications system (Email & In-app)
- Profile management
- Book discovery with filters and search
- Mobile app (React Native)

---

## 🛠 Tech Stack

| Layer | Technologies |
|:------|:-------------|
| Frontend | React.js (Vite, Material-UI, Framer Motion) |
| Routing | React Router v7 |
| State Management | React Context API |
| Backend as a Service | Supabase |
| Hosting | Vercel |
| Code Formatting | Prettier, ESLint |
| Version Control | Git + GitHub |
| Auth Security | Supabase Email Auth + RLS |
| Build Optimization | Lazy loading, modular design |

---

## 🧩 Project Structure

```
src/
  ├── assets/          # Images, logos
  ├── components/      # Common reusable components
  ├── contexts/        # AuthContext for global user auth
  ├── hooks/           # (Reserved for custom hooks)
  ├── layouts/         # (Reserved for future layouts)
  ├── pages/           # Page components (Login, Signup, Dashboard)
  ├── routes/          # (Reserved for route configs)
  ├── services/        # Supabase client setup
  ├── theme/           # (Reserved for MUI theme customization)
  └── utils/           # (Reserved for helpers)
public/
  ├── vercel.json      # SPA routing config for Vercel
.env                   # Environment variables
vite.config.js         # Vite project config
```

✅ Modular, scalable, startup-grade structure.

---

## ⚙️ Environment Variables

Create a `.env` file at the project root with:

```plaintext
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

✅ Never hardcode sensitive keys inside code.

---

## 🏃‍♂️ Local Setup Instructions

1. **Clone the repo**:

```bash
git clone https://github.com/divyamojas/project-nexus.git
cd project-nexus
```

2. **Install dependencies**:

```bash
npm install
# or
yarn install
```

3. **Setup environment**:

Create `.env` file as shown above.

4. **Start development server**:

```bash
npm run dev
# or
yarn dev
```

✅ Project will run at [localhost:5173](http://localhost:5173).

---

## 📈 Roadmap (Next Phases)

- [ ] Book Sharing: Add / Request Books
- [ ] Mutual Day & Time Setting
- [ ] Anonymous Private Chat after Request
- [ ] Book Discovery (search and filters)
- [ ] Profile pages
- [ ] Notifications (email & in-app)
- [ ] Mobile app (React Native)

---

## 🤝 Contributions

Currently internal for MVP.  
Open-source contributions will be considered post public beta launch! 🌿

---

## 📜 License

© 2025 Leaflet Books  
Made with ❤️ for book lovers.

---
