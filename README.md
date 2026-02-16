# 🛡️ ElderGuard — Guardian MFA for Senior Citizens

A guardian-based multi-factor authentication MVP that prevents financial scams on senior citizens. When a senior initiates a high-value transaction, it requires explicit approval from their trusted guardian before completion.

> ⚠️ **Educational / Research Project** — This is a simulation. No real financial data or payment gateways are used.

## 🌐 Live Demo

| Service | URL |
|---|---|
| **Frontend** | [elderguard-alpha.vercel.app](https://elderguard-alpha.vercel.app) |
| **Backend API** | [elderguard.onrender.com](https://elderguard.onrender.com) |
| **GitHub** | [github.com/Z35Tyyyy/ElderGuard](https://github.com/Z35Tyyyy/ElderGuard) |

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (React, App Router) |
| Backend | Node.js + Express |
| Database | MongoDB Atlas (via Mongoose ODM) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Email | Nodemailer (Gmail SMTP) |
| Styling | Vanilla CSS (dark theme, accessible) |
| Hosting | Vercel (Frontend) + Render (Backend) |

---

## 📁 Project Structure

```
ElderGuard/
├── backend/
│   ├── config/db.js          # MongoDB Atlas connection
│   ├── middleware/            # Auth, rate limiting, validation
│   ├── models/                # User, Transaction, Invite
│   ├── routes/                # Auth, Invite, Transaction APIs
│   ├── utils/                 # Mailer, Logger
│   ├── server.js              # Entry point
│   └── .env                   # Environment variables
├── frontend/
│   ├── src/app/               # Next.js pages (App Router)
│   ├── src/components/        # Navbar, StatusBadge, TransactionCard
│   ├── src/lib/               # API client, auth helpers
│   └── .env.local             # Frontend env
└── README.md
```

---

## 🚀 Setup Instructions (Local Development)

### Prerequisites

- **Node.js** 18+ installed
- **MongoDB Atlas** account (free tier works)

### 1. Clone the Repository

```bash
git clone https://github.com/Z35Tyyyy/ElderGuard.git
cd ElderGuard
```

### 2. Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free cluster
3. Create a database user (username + password)
4. Whitelist your IP (or allow all: `0.0.0.0/0`)
5. Get the connection string

### 3. Configure Backend Environment

Create `backend/.env` (see `backend/.env.example` for reference):

```env
MONGO_URI=mongodb+srv://YOUR_USER:YOUR_PASS@YOUR_CLUSTER.mongodb.net/elderguard?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key
PORT=5000
FRONTEND_URL=http://localhost:3000
TXN_THRESHOLD=5000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 4. Start Backend

```bash
cd backend
npm install
npm start
```

### 5. Start Frontend

Open a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

Visit **http://localhost:3000**

---

## 🎮 Demo Flow

### Step 1: Register Users

1. Open the app at [elderguard-alpha.vercel.app/register](https://elderguard-alpha.vercel.app/register)
2. Register a **Senior** account (e.g., `senior@test.com`)
3. Register a **Guardian** account (e.g., `guardian@gmail.com`)

### Step 2: Link Guardian

1. Login as the **Senior**
2. On the dashboard, enter the guardian's email and click **Send Invite**
3. The guardian receives an email with an **Accept Invitation** link
4. Guardian clicks the link → accepts invitation → users are linked

### Step 3: Create a High-Value Transaction

1. Login as the **Senior**
2. Click **+ New Transaction**
3. Enter amount: **₹25,000**, recipient, reason
4. Submit — it will show **"Awaiting guardian approval"**

### Step 4: Guardian Approves

1. Login as the **Guardian**
2. See the pending transaction on the dashboard
3. Click **✓ Approve** (or **✕ Reject**)
4. Transaction status changes to **COMPLETED** (or **BLOCKED**)

### Step 5: Verify

1. Login as the **Senior** again
2. See the transaction with updated status ✅

---

## 📡 API Endpoints

Base URL: `https://elderguard.onrender.com/api`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login, get JWT |
| GET | `/api/auth/me` | Get profile |
| POST | `/api/invite` | Senior invites guardian |
| POST | `/api/invite/accept` | Guardian accepts invite |
| GET | `/api/invite/pending` | Get pending invites |
| POST | `/api/transactions/create` | Create transaction |
| GET | `/api/transactions/my` | Get user's transactions |
| POST | `/api/transactions/:id/approve` | Approve transaction |
| POST | `/api/transactions/:id/reject` | Reject transaction |

---

## 🔒 Security Features

- **Password hashing** — bcrypt with 12 salt rounds
- **JWT authentication** — 7-day expiry, verified on every protected route
- **Role-based access** — Seniors can't approve, guardians can't create transactions
- **Rate limiting** — 100 req/15min general, 20 req/15min for auth
- **Input validation** — express-validator on all routes
- **CORS** — restricted to frontend origin
- **Request size limit** — 10kb JSON body limit

---

## 📧 Email Notifications

The app uses **Gmail SMTP** to send real email notifications:
- **Guardian Alert** — sent when a high-value transaction is created
- **Invite Email** — sent when a senior invites someone as their guardian

---

## 🎨 Design Principles

- **Dark theme** with high contrast for readability
- **Large touch targets** (min 48px) for senior accessibility
- **Clear status indicators** with color-coded badges
- **Responsive** — works on mobile and desktop
- **Minimal clutter** — focused, intentional UI

---

## 🚀 Deployment

| Service | Platform | Config |
|---|---|---|
| Backend | Render | Root: `backend`, Build: `npm install`, Start: `node server.js` |
| Frontend | Vercel | Root: `frontend`, Framework: Next.js |

### Environment Variables

**Render (Backend):**
`MONGO_URI`, `JWT_SECRET`, `PORT`, `FRONTEND_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `TXN_THRESHOLD`

**Vercel (Frontend):**
`NEXT_PUBLIC_API_URL`

---

## 📄 License

Educational and research purposes only. Not for production use with real financial data.
