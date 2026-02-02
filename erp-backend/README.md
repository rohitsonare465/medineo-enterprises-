# Medineo ERP - Backend

Production-grade ERP backend for Medineo Enterprises - a medical vendor/distributor.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT with refresh tokens
- **Security:** Helmet, CORS, Rate Limiting

## Features

- 🔐 Role-based access control (Owner, Staff, Accountant)
- 💊 Medicine master with batch-wise stock management
- 📦 FIFO-based stock deduction
- 🧾 GST-compliant invoicing (CGST/SGST/IGST)
- 💰 Customer/Vendor ledger with party-wise statements
- 📊 Comprehensive reports (Sales, Purchase, GST, Profit)
- ⚠️ Stock & expiry alerts

## Project Structure

```
erp-backend/
├── src/
│   ├── config/
│   │   ├── database.js      # MongoDB connection
│   │   └── constants.js     # GST rates, permissions
│   ├── controllers/         # Route handlers
│   ├── middleware/          # Auth, validation, error handling
│   ├── models/              # Mongoose schemas
│   └── routes/              # Express routes
├── server.js                # Entry point
├── seed.js                  # Database seeder
└── render.yaml              # Render deployment config
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Installation

```bash
cd erp-backend
npm install
```

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/medineo_erp
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
CORS_ORIGIN=http://localhost:3000
```

### Database Setup

```bash
# Seed initial data (creates admin user and settings)
npm run seed
```

### Running

```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Current user
- `POST /api/auth/logout` - Logout

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/sales-chart` - Sales chart data

### Sales
- `GET /api/sales` - List sales with filters
- `POST /api/sales` - Create sale invoice
- `GET /api/sales/:id` - Get sale by ID
- `PUT /api/sales/:id` - Update sale

### Purchases
- `GET /api/purchases` - List purchases
- `POST /api/purchases` - Create purchase
- `GET /api/purchases/:id` - Get purchase by ID

### Stock
- `GET /api/stock/overview` - Stock overview
- `GET /api/stock/low` - Low stock items
- `GET /api/stock/expiry-alerts` - Expiring batches

### Reports
- `GET /api/reports/sales` - Sales report
- `GET /api/reports/purchases` - Purchase report
- `GET /api/reports/gst` - GST report
- `GET /api/reports/profit` - Profit analysis

## Default Credentials

After running seed:

| Role | Email | Password |
|------|-------|----------|
| Owner | admin@medineo.com | Admin@123 |
| Staff | staff@medineo.com | Admin@123 |
| Accountant | accountant@medineo.com | Admin@123 |

## Deployment on Render

1. Push code to GitHub
2. Create new Web Service on Render
3. Connect repository
4. Configure environment variables
5. Deploy

The `render.yaml` file contains the deployment configuration.

## License

Private - Medineo Enterprises
