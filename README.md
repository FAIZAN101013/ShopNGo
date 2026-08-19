# 🛍️ ShopNGo

**ShopNGo** is a modern, fully responsive eCommerce storefront built with **React 19**, **Vite** and **Tailwind CSS v4**. It covers the complete shopping journey — browsing and filtering a catalog, viewing product details, managing a cart, checking out, and reviewing past orders — in a fast, single-page experience.

> **Note:** ShopNGo currently ships as a **frontend-only application**. The product catalog is bundled as static data and user/session/order state is persisted in the browser's `localStorage`. A real backend (Node/Express + MongoDB) is on the roadmap.

---

## 📽️ Demo

[![Watch the demo](https://img.youtube.com/vi/3Jr7WZKXEds/0.jpg)](https://youtu.be/3Jr7WZKXEds)

---

## 🚀 Features

- 🛒 **Product catalog** — grid listing with latest collection and best-seller sections
- 🔎 **Live search** — instant, in-page search from the navbar search bar
- 🎚️ **Filtering & sorting** — filter by category, sub-category and price range; sort by relevance or price
- 👕 **Product detail pages** — image gallery, size selection, description/review tabs, and related products
- 🧺 **Cart** — add by size, update quantities, remove items, running item count in the navbar
- 💳 **Checkout** — shipping form with validation, order summary, Cash-on-Delivery flow plus an optional Stripe Payment Link
- 📦 **Orders** — order history and confirmation view backed by `localStorage`
- 👤 **Accounts** — register, login, logout and an editable profile page (mock auth, no server)
- 🔔 **Toast notifications** — feedback on every cart and checkout action via `react-toastify`
- 📱 **Responsive design** — mobile, tablet and desktop layouts throughout

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **UI** | React 19 |
| **Build tool** | Vite 6 |
| **Styling** | Tailwind CSS v4 (`@tailwindcss/vite`) |
| **Routing** | React Router v7 |
| **State** | React Context (`ShopContext`) + hooks |
| **Icons** | `lucide-react` |
| **Notifications** | `react-toastify` |
| **Linting** | ESLint 9 |
| **Payments** | Stripe Payment Link (optional, via env var) |

---

## 🧑‍💻 Getting Started

### Prerequisites

- **Node.js 18+** and npm

### Installation

```bash
git clone https://github.com/FAIZAN101013/ShopNGo.git
cd ShopNGo/frontend
npm install
```

### Run the dev server

```bash
npm run dev
```

Vite prints a local URL (default `http://localhost:5173`) — open it in your browser.

### Available scripts

Run these from the `frontend/` directory:

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run build` | Produce a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Lint the project with ESLint |

---

## ⚙️ Configuration

Create a `frontend/.env` file to enable the optional Stripe checkout:

```env
VITE_STRIPE_PAYMENT_LINK=https://buy.stripe.com/your-payment-link
```

If this variable is unset, the Stripe button falls back to the Cash-on-Delivery flow.

---

## 📁 Project Structure

```
ShopNGo/
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── eslint.config.js
    └── src/
        ├── main.jsx              # App entry, router + ShopContext providers
        ├── App.jsx               # Route definitions and shared layout
        ├── index.css             # Tailwind entry + global styles
        ├── assets/               # Product data (assets.js), images, icons
        ├── context/
        │   └── ShopContext.jsx   # Cart, search and pricing state
        ├── components/           # Navbar, Footer, Hero, SearchBar, ProductItem, …
        └── pages/                # Home, Collection, Product, Cart, PlaceOrder,
                                  # Orders, Login, Register, Profile, About, Contact
```

---

## 🗺️ Routes

| Path | Page |
|---|---|
| `/` | Home |
| `/collection` | Product listing with filters and sorting |
| `/product/:productId` | Product detail |
| `/cart` | Shopping cart |
| `/placeorder` | Checkout |
| `/orders` | Order history |
| `/login` · `/register` · `/profile` | Account pages |
| `/about` · `/contact` | Informational pages |

---

## 🛣️ Roadmap

- [ ] Express + MongoDB backend with real product and order APIs
- [ ] JWT-based authentication replacing the current mock auth
- [ ] Server-side Stripe / Razorpay checkout sessions
- [ ] Admin dashboard for product and order management
- [ ] Persistent cart tied to the user account

---

## 🤝 Contributing

Contributions are welcome. Fork the repo, create a feature branch, and open a pull request describing your change.

---

## 👤 Author

**Faizan** — [@FAIZAN101013](https://github.com/FAIZAN101013)
