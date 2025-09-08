# 🛍️ ShopNGo

**ShopNGo** is a full-stack eCommerce store. The storefront is **React 19 + Vite + Tailwind CSS v4**; behind it sits an **Express 5 + MongoDB** API that owns the catalog, the accounts and the orders.

It covers the complete journey — browsing and filtering a catalog, viewing product details, managing a cart, creating an account confirmed by an emailed code, checking out, and reviewing past orders.

---

## 📽️ Demo

[![Watch the demo](https://img.youtube.com/vi/3Jr7WZKXEds/0.jpg)](https://youtu.be/3Jr7WZKXEds)

---

## 🚀 Features

### Storefront
- 🛒 **Product catalog** — served from MongoDB, with latest-collection and best-seller sections
- 🔎 **Live search** — instant, in-page search from the navbar search bar
- 🎚️ **Filtering & sorting** — filter by category, sub-category and price range; sort by relevance or price
- 👕 **Product detail pages** — image gallery, size selection, description/review tabs, and related products
- 🧺 **Cart** — add by size, update quantities, remove items, running item count in the navbar
- 💳 **Checkout** — shipping form with validation, order summary, Cash-on-Delivery flow plus an optional Stripe Payment Link
- 📱 **Responsive design** — mobile, tablet and desktop layouts throughout

### Accounts & orders
- 🔐 **Real authentication** — passwords hashed with **bcrypt**, sessions carried by a signed **JWT**
- 📧 **Email verification** — a 6-digit code, hashed in the database, expiring after 10 minutes
- 🔑 **Password reset by email** — and changing it invalidates every token issued before
- 📦 **Orders** — stored per account, **priced by the server**, with a confirmation email
- 🛡️ **Protected routes** — checkout, orders and profile need a valid token, enforced by middleware

### Emails
| When | What arrives |
|---|---|
| Sign up | 6-digit verification code |
| Email confirmed | Welcome message |
| Forgot password | 6-digit reset code |
| Order placed | Itemised confirmation, plus a copy to the shop owner |

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **UI** | React 19 |
| **Build tool** | Vite 6 |
| **Styling** | Tailwind CSS v4 (`@tailwindcss/vite`) |
| **Routing** | React Router v7 |
| **State** | React Context (`ShopContext`, `AuthContext`) + hooks |
| **API** | Express 5 (ESM) |
| **Database** | MongoDB Atlas via Mongoose 9 |
| **Auth** | bcryptjs + jsonwebtoken |
| **Email** | Nodemailer over SMTP |
| **Notifications** | `react-toastify` |
| **Linting** | ESLint 9 |
| **Payments** | Stripe Payment Link (optional, via env var) |

---

## 🧑‍💻 Getting Started

### Prerequisites

- **Node.js 18+** and npm
- A **MongoDB** connection string (Atlas free tier is fine)
- An **SMTP** account for email — optional; without one, emails print to the terminal

### Installation

```bash
git clone https://github.com/FAIZAN101013/ShopNGo.git
cd ShopNGo

cd backend  && npm install
cd ../frontend && npm install
```

### Configure

```bash
cp backend/.env.example backend/.env      # fill in Mongo, JWT secret and SMTP
cp frontend/.env.example frontend/.env    # points at http://localhost:4000
```

Generate a JWT secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### Load the catalog

```bash
cd backend
npm run seed        # inserts the 73 products, replacing whatever is there
```

### Run it

Two terminals:

```bash
cd backend  && npm run server   # API on http://localhost:4000
cd frontend && npm run dev      # storefront on http://localhost:5173
```

If the API is not running, the storefront says so rather than showing an empty shop.

### Available scripts

**`frontend/`**

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run build` | Produce a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Lint the project with ESLint |

**`backend/`**

| Command | What it does |
|---|---|
| `npm run server` | Start the API with nodemon (restarts on save) |
| `npm start` | Start the API once |
| `npm run seed` | Wipe and reload the product catalog |

---

## ⚙️ Configuration

Both `.env` files are gitignored. `.env.example` in each folder is the template.

**`backend/.env`**

| Variable | Purpose |
|---|---|
| `PORT` | API port (default 4000) |
| `MONGODB_URI` | Connection string — **include the database name** after the host |
| `JWT_SECRET` | Signs login tokens; changing it signs everybody out |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `OTP_TTL_MINUTES` | How long an emailed code stays usable |
| `FRONTEND_URL` | Used for the links inside emails |
| `ADMIN_EMAIL` | Gets a copy of every order |
| `SMTP_HOST` · `SMTP_PORT` · `SMTP_USER` · `SMTP_PASS` | Mail server. For Gmail, `SMTP_PASS` must be an **App Password** |
| `MAIL_FROM` | The From line, e.g. `ShopNGo <you@example.com>` |
| `MAIL_DRY_RUN` | `1` prints emails to the terminal instead of sending them |

**`frontend/.env`**

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Where the API lives (default `http://localhost:4000`) |
| `VITE_STRIPE_PAYMENT_LINK` | Optional; without it the Stripe button falls back to COD |

---

## 🔌 API

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/products` | — | List the catalog |
| `POST` | `/api/products` | — | Add a product |
| `POST` | `/api/user/register` | — | Create an account, email a code |
| `POST` | `/api/user/verify` | — | Confirm the code, return a token |
| `POST` | `/api/user/resend-code` | — | Send another code |
| `POST` | `/api/user/login` | — | Sign in |
| `POST` | `/api/user/forgot-password` | — | Email a reset code |
| `POST` | `/api/user/reset-password` | — | Set a new password |
| `GET` · `PUT` | `/api/user/profile` | ✅ | Read / update the signed-in account |
| `POST` | `/api/orders` | ✅ | Place an order |
| `GET` | `/api/orders` | ✅ | Your order history |
| `GET` | `/api/orders/:reference` | ✅ | One of your orders |

Every response has the shape `{ success, ... }`. Protected routes expect `Authorization: Bearer <token>`.

---

## 📁 Project Structure

```
ShopNGo/
├── backend/
│   ├── server.js              # Front door: middleware, routes, error handling
│   ├── config/                # db.js (Mongo), mailer.js (SMTP)
│   ├── models/                # product, user, otp, order
│   ├── controllers/           # The work: product, user, order
│   ├── middleware/auth.js     # Verifies the JWT, fills in req.user
│   ├── routes/                # URL -> controller
│   ├── emails/templates.js    # The four emails
│   ├── utils/                 # token.js (JWT), otp.js (codes)
│   ├── scripts/seed.js        # Loads the catalog into MongoDB
│   ├── public/images/         # Product photos, served at /images
│   └── NOTES.md               # Learning notes: bcrypt, JWT, OTP, orders
└── frontend/
    └── src/
        ├── main.jsx           # App entry, router + context providers
        ├── App.jsx            # Routes and shared layout
        ├── services/api.js    # The only file that calls fetch
        ├── context/           # ShopContext (cart), AuthContext (session)
        ├── components/        # Navbar, RequireAuth, OtpInput, ProductItem, …
        └── pages/             # Home, Collection, Product, Cart, PlaceOrder,
                               # Orders, Login, Register, VerifyEmail,
                               # ForgotPassword, Profile, About, Contact
```

---

## 🗺️ Routes

| Path | Page | Needs sign-in |
|---|---|---|
| `/` | Home | |
| `/collection` | Product listing with filters and sorting | |
| `/product/:productId` | Product detail | |
| `/cart` | Shopping cart | |
| `/login` · `/register` | Sign in and sign up | |
| `/verify-email` | Enter the emailed code | |
| `/forgot-password` | Reset by email | |
| `/placeorder` | Checkout | ✅ |
| `/orders` | Order history | ✅ |
| `/profile` | Account details | ✅ |
| `/about` · `/contact` | Informational pages | |

---

## 🛣️ Roadmap

- [x] Express + MongoDB backend with real product and order APIs
- [x] JWT-based authentication replacing the mock auth
- [x] Transactional email: verification, welcome, password reset, receipts
- [ ] Admin dashboard for product and order management
- [ ] Server-side Stripe / Razorpay checkout sessions
- [ ] Cart tied to the account rather than the browser
- [ ] Deployment

---

## 🤝 Contributing

Contributions are welcome. Fork the repo, create a feature branch, and open a pull request describing your change.

---

## 👤 Author

**Faizan** — [@FAIZAN101013](https://github.com/FAIZAN101013)
