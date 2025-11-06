# NCB Billing Backend API

A comprehensive Point of Sale (POS) and billing system backend for franchise management with role-based access control.

## Features

### Super Admin Panel
- ✅ Register and manage franchise accounts
- ✅ Create, update, suspend, block, or delete franchises
- ✅ Generate login credentials for franchise users
- ✅ Send OTP activation to franchise mobile numbers
- ✅ View analytics for all franchises with filtering
- ✅ Create universal food items accessible by all franchises
- ✅ Monitor franchise activities and generate reports
- ✅ Revenue reports and top-performing franchise analysis

### Franchise Admin Panel
- ✅ OTP-based account activation flow
- ✅ Profile and business details management
- ✅ Food catalog management (create, update, delete, availability)
- ✅ Complete POS system for order creation
- ✅ Order management (view, edit, delete, status updates)
- ✅ Bill generation with PDF and print support
- ✅ Comprehensive analytics (daily/monthly revenue, popular items)
- ✅ Expense tracking and management

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with role-based access control
- **Validation**: Joi schema validation
- **SMS**: Fast2SMS integration for OTP
- **Email**: Nodemailer support

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ncb-billing-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB configuration
   ```

4. **Database Setup**
   ```bash
   # Make sure MongoDB is running locally or use MongoDB Atlas
   # Run the setup script to create Super Admin
   npm run setup
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `JWT_REFRESH_SECRET` | Refresh token secret | Yes |
| `PORT` | Server port (default: 5000) | No |
| `NODE_ENV` | Environment (development/production) | No |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |
| `FAST2SMS_API_KEY` | Fast2SMS API key for OTP | Yes |
| `EMAIL_USER` | Gmail for email notifications | No |
| `EMAIL_PASS` | Gmail app password | No |

## Database Setup

### Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Update `MONGODB_URI` in `.env` to `mongodb://localhost:27017/ncb_billing`

### MongoDB Atlas (Cloud)
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get the connection string
4. Update `MONGODB_URI` in `.env` with your Atlas connection string

### Initial Setup
Run the setup script to create the Super Admin user:
```bash
npm run setup
```

This will create a Super Admin with:
- **Email**: admin@ncbbilling.com
- **Password**: admin123
- **Mobile**: 9999999999

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/generate-otp` - Generate OTP for mobile
- `POST /api/v1/auth/verify-otp` - Verify OTP and activate account
- `GET /api/v1/auth/profile` - Get user profile
- `POST /api/v1/auth/create-franchise-user` - Create franchise user (Super Admin)

### Franchise Management
- `POST /api/v1/franchises` - Create franchise (Super Admin)
- `GET /api/v1/franchises` - Get all franchises (Super Admin)
- `GET /api/v1/franchises/:id` - Get franchise by ID
- `PUT /api/v1/franchises/:id` - Update franchise (Super Admin)
- `DELETE /api/v1/franchises/:id` - Delete franchise (Super Admin)
- `PATCH /api/v1/franchises/:id/suspend` - Suspend franchise (Super Admin)
- `PATCH /api/v1/franchises/:id/reactivate` - Reactivate franchise (Super Admin)
- `POST /api/v1/franchises/:id/send-otp` - Send activation OTP (Super Admin)
- `GET /api/v1/franchises/my/profile` - Get my franchise profile
- `PUT /api/v1/franchises/my/profile` - Update my franchise profile

### Food Management
- `POST /api/v1/foods` - Create food item
- `GET /api/v1/foods` - Get all foods (with filters)
- `GET /api/v1/foods/categories` - Get food categories
- `PUT /api/v1/foods/:id` - Update food item
- `DELETE /api/v1/foods/:id` - Delete food item
- `PATCH /api/v1/foods/:id/global-availability` - Toggle global availability (Super Admin)

### Order Management
- `POST /api/v1/orders` - Create new order
- `GET /api/v1/orders` - Get all orders (with filters)
- `GET /api/v1/orders/stats` - Get order statistics
- `GET /api/v1/orders/:id` - Get order by ID
- `PUT /api/v1/orders/:id` - Update order
- `DELETE /api/v1/orders/:id` - Delete order
- `PATCH /api/v1/orders/:id/status` - Update order status

### Bill Management
- `POST /api/v1/bills` - Generate bill from order
- `GET /api/v1/bills` - Get all bills (with filters)
- `GET /api/v1/bills/stats` - Get bill statistics
- `GET /api/v1/bills/:id` - Get bill by ID
- `GET /api/v1/bills/:id/pdf` - Generate bill PDF
- `GET /api/v1/bills/:id/print` - Get print-formatted bill

### Analytics
- `GET /api/v1/analytics/all-franchises` - All franchises analytics (Super Admin)
- `GET /api/v1/analytics/revenue-report` - Revenue reports
- `GET /api/v1/analytics/:franchiseId` - Franchise-specific analytics

### Expense Management
- `POST /api/v1/expenses` - Create expense record
- `GET /api/v1/expenses` - Get all expenses (with filters)
- `GET /api/v1/expenses/stats` - Get expense statistics
- `GET /api/v1/expenses/:id` - Get expense by ID
- `PUT /api/v1/expenses/:id` - Update expense
- `DELETE /api/v1/expenses/:id` - Delete expense

## User Roles

### SUPER_ADMIN
- Full system access
- Franchise management
- Universal food management
- Cross-franchise analytics
- User management

### FRANCHISE_ADMIN
- Franchise-specific operations
- POS system access
- Order and bill management
- Franchise analytics
- Food catalog management

## Database Schema

The system uses MongoDB with the following main collections:
- **Users** - Authentication and user management
- **Franchises** - Franchise business details
- **Foods** - Food items (franchise-specific and universal)
- **Orders** - Customer orders with embedded items
- **Bills** - Generated bills from orders
- **Expenses** - Franchise expense tracking
- **Analytics** - Computed analytics data

## Security Features

- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Input validation with Joi schemas
- MongoDB injection prevention with Mongoose
- CORS configuration
- Environment-based configuration

## Development

### Database Operations
```bash
# Setup database with Super Admin
npm run setup

# Connect to MongoDB shell
mongosh

# View collections
show collections
```

### Code Structure
```
src/
├── config/          # Database configuration
├── controllers/     # Route controllers
├── middleware/      # Authentication & validation middleware
├── models/          # Mongoose models
├── routes/          # API routes
├── utils/           # Utility functions (JWT, OTP, validation)
├── validations/     # Joi validation schemas
└── server.js        # Main server file
scripts/
└── setup-db.js      # Database setup script
```

## Production Deployment

1. **Environment Setup**
   - Set strong JWT secrets
   - Configure production MongoDB (Atlas recommended)
   - Set up SMS provider (Fast2SMS)
   - Configure CORS for production frontend

2. **Database Setup**
   ```bash
   npm run setup
   ```

3. **Process Management**
   - Use PM2 or similar for process management
   - Set up proper logging
   - Configure reverse proxy (Nginx)

## API Testing

The API includes comprehensive error handling and validation. Test with tools like:
- Postman
- Thunder Client
- curl

Example Super Admin login:
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ncbbilling.com",
    "password": "admin123"
  }'
```

## Migration from PostgreSQL/Prisma

This application has been converted from PostgreSQL with Prisma to MongoDB with Mongoose. Key changes:
- Database queries updated to use Mongoose syntax
- Schema definitions converted to Mongoose models
- Relationships handled through ObjectId references and population
- Aggregation pipelines for complex analytics queries

## Support

For issues and feature requests, please check the documentation or contact the development team.

## License

This project is proprietary software for NCB Billing System.