# Eat & Park Management - Backend

A Node.js/Express backend server for the Eat & Park restaurant management system. This application provides APIs for user authentication, menu management, table reservations, billing, transactions, and reporting.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary
- **Task Scheduling**: Node-cron
- **Environment**: dotenv

## Project Structure

```
├── config/              # Configuration files
│   ├── cloudinary.js    # Cloudinary setup for image uploads
│   └── db.js            # MongoDB connection
├── controllers/         # Request handlers
│   ├── authController.js
│   ├── menuController.js
│   ├── reportController.js
│   ├── seedController.js
│   ├── tableController.js
│   └── transactionController.js
├── middleware/          # Express middleware
│   └── authMiddleware.js
├── models/              # MongoDB schemas
│   ├── Bill.js
│   ├── MenuItem.js
│   ├── Table.js
│   ├── Transactions.js
│   └── User.js
├── routes/              # API routes
│   ├── authRoutes.js
│   ├── menuRoutes.js
│   ├── reportRoutes.js
│   ├── seedRoutes.js
│   ├── tableRoutes.js
│   └── transactionRoutes.js
├── jobs/                # Scheduled jobs
│   └── retentionCron.js
├── utils/               # Utility functions
│   └── dateRange.js
├── uploads/             # File uploads directory
├── server.js            # Main server entry point
├── package.json         # Dependencies
└── .env                 # Environment variables
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB
- Cloudinary account (for image uploads)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd "Ep backend"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create .env file**
   ```bash
   cp .env.example .env  # or create manually
   ```

4. **Configure environment variables** (see [Environment Variables](#environment-variables) section)

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/eatandpark
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eatandpark

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Retention Cron Job
RETENTION_DAYS=90
```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start at `http://localhost:5000` (or configured PORT)

## API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Menu
- `GET /api/menu` - Get all menu items
- `POST /api/menu` - Create menu item (Admin)
- `PUT /api/menu/:id` - Update menu item (Admin)
- `DELETE /api/menu/:id` - Delete menu item (Admin)

### Tables
- `GET /api/tables` - Get all tables
- `POST /api/tables` - Create table (Admin)
- `PUT /api/tables/:id` - Update table (Admin)
- `DELETE /api/tables/:id` - Delete table (Admin)

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/:id` - Get transaction details

### Bills
- `GET /api/bills` - Get all bills
- `POST /api/bills` - Create bill
- `PUT /api/bills/:id` - Update bill

### Reports
- `GET /api/reports/sales` - Get sales report
- `GET /api/reports/revenue` - Get revenue report
- `GET /api/reports/inventory` - Get inventory report

### Seeds
- `POST /api/seed/initialize` - Initialize database with sample data

## Features

- ✅ User Authentication (JWT-based)
- ✅ Role-based Access Control (Admin, Staff, User)
- ✅ Menu Management
- ✅ Table Reservation System
- ✅ Billing & Transaction Management
- ✅ Sales & Revenue Reports
- ✅ Image Upload to Cloudinary
- ✅ Automated Data Retention (Cron Job)
- ✅ MongoDB Database Integration

## Database Setup

### Local MongoDB
```bash
# Start MongoDB service
mongod

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Initialize Database
```bash
curl -X POST http://localhost:5000/api/seed/initialize
```

## Common Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start

# Run tests (if available)
npm test

# Lint code
npm run lint
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Verify database user credentials

### Cloudinary Upload Fails
- Verify Cloudinary API credentials
- Check internet connection
- Ensure image file size is within limits

### JWT Authentication Errors
- Verify `JWT_SECRET` is set
- Check token expiration time
- Ensure token is sent in Authorization header

## Contributing

1. Create a feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
3. Push to the branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email: support@eatandpark.com or create an issue on GitHub.

---

**Last Updated**: 2026-06-24
