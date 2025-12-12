# AutoNinja 🚗

> Modern, AI-powered car marketplace platform with intelligent verification and OCR capabilities

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development](#development)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🎯 Overview

AutoNinja is a full-stack marketplace platform that revolutionizes used car buying and selling through:

- **AI-Powered OCR**: Automatic logbook verification using OpenAI Vision API
- **Smart Search**: Natural language search with voice support
- **Trust Verification**: Digital health passport system for vehicles
- **Real-time Alerts**: WhatsApp notifications for matching listings
- **Stripe Integration**: Secure payment processing for seller memberships

## ✨ Key Features

### For Buyers
- 🔍 **Advanced Search**: Multi-filter search with debounced updates
- 💬 **Voice Chat**: AI-powered natural language car search
- 🔔 **Smart Alerts**: Custom alerts with WhatsApp notifications
- ✅ **Trust Badges**: Verification system (logbook, mileage, photos, price)
- 📊 **Sorting Options**: Price, date, verification score

### For Sellers
- 📝 **5-Step Listing**: Intuitive multi-step form with validation
- 📸 **Image Upload**: Up to 20 images with drag-and-drop
- 📄 **Document Upload**: Logbook and service records
- 🤖 **Auto-Verification**: OCR extracts and verifies logbook data
- 💳 **Stripe Payments**: Secure subscription management
- 🎯 **Auto-Fill**: Missing data auto-populated from verified logbook

### Platform Features
- 🔐 **Authentication**: Secure session-based auth with bcrypt
- 🗄️ **Database**: PostgreSQL with Drizzle ORM
- 📱 **Responsive**: Mobile-first design with TailwindCSS
- ⚡ **Performance**: Debouncing, caching, memoization
- 🛡️ **Validation**: Comprehensive form and data validation

## 🛠️ Tech Stack

### Frontend
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **TailwindCSS 4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **TanStack Query** - Server state management
- **Wouter** - Lightweight routing
- **Framer Motion** - Animation library

### Backend
- **Node.js 20+** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type-safe server code
- **Drizzle ORM** - Type-safe database toolkit
- **PostgreSQL** - Relational database
- **Multer** - File upload handling
- **OpenAI API** - Vision model for OCR
- **Stripe** - Payment processing
- **Twilio** - WhatsApp notifications

### DevOps & Tools
- **ESBuild** - Ultra-fast bundler
- **tsx** - TypeScript execution
- **Drizzle Kit** - Database migrations
- **Replit** - Development platform

## 🚀 Getting Started

### Prerequisites

```bash
- Node.js 20 or higher
- PostgreSQL 14 or higher
- npm or yarn package manager
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/akhanna222/autoninja.git
cd autoninja
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
# Create .env file
cp .env.example .env

# Required environment variables:
DATABASE_URL=postgresql://user:password@localhost:5432/autoninja
SESSION_SECRET=your-secret-key-min-32-chars
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1
AI_INTEGRATIONS_OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_test_...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

4. **Run database migrations**
```bash
npm run db:push
```

5. **Seed Stripe products (optional)**
```bash
npm run seed:stripe
```

6. **Start development server**
```bash
npm run dev
```

The application will be available at:
- Frontend: `http://localhost:5000`
- Backend API: `http://localhost:5001`

## 📁 Project Structure

```
autoninja/
├── client/                 # React frontend application
│   ├── public/            # Static assets
│   └── src/
│       ├── components/    # Reusable UI components
│       │   ├── ui/       # Radix UI-based components
│       │   ├── layout/   # Layout components
│       │   └── *.tsx     # Feature components
│       ├── hooks/        # Custom React hooks
│       ├── lib/          # Utilities and configurations
│       ├── pages/        # Route page components
│       └── main.tsx      # Application entry point
│
├── server/                # Express backend application
│   ├── auth.ts           # Authentication logic
│   ├── routes.ts         # API route definitions
│   ├── storage.ts        # Database abstraction layer
│   ├── openai.ts         # OCR and AI chat integration
│   ├── stripeService.ts  # Stripe payment logic
│   ├── alertMatcher.ts   # Alert matching algorithm
│   ├── twilio.ts         # WhatsApp notifications
│   └── index.ts          # Server entry point
│
├── shared/                # Shared code between client/server
│   └── schema.ts         # Drizzle ORM database schema
│
├── scripts/              # Build and utility scripts
│   ├── build.ts         # Production build script
│   └── seed-stripe-products.ts  # Stripe data seeder
│
├── docs/                 # Documentation (to be created)
│   ├── ARCHITECTURE.md  # System architecture
│   ├── API.md           # API documentation
│   └── DEPLOYMENT.md    # Deployment guide
│
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite build configuration
├── drizzle.config.ts    # Database migration config
└── README.md            # This file
```

## 💻 Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server (client + server)
npm run dev:client       # Start client only (Vite dev server)

# Building
npm run build            # Build for production
npm run check            # TypeScript type checking

# Database
npm run db:push          # Push schema changes to database
npm run seed:stripe      # Seed Stripe products

# Production
npm start                # Start production server
```

### Code Quality

This project follows Meta-level engineering standards:

✅ **Type Safety**: Full TypeScript coverage
✅ **Performance**: Optimized with debouncing, memoization, caching
✅ **Validation**: Comprehensive input validation
✅ **Error Handling**: Graceful error handling throughout
✅ **Documentation**: JSDoc comments and README
✅ **Security**: Input sanitization, session management, HTTPS

### Development Workflow

1. **Create a feature branch**
```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes**
   - Write type-safe code
   - Add comprehensive validation
   - Include error handling
   - Update documentation

3. **Test your changes**
```bash
npm run check          # Type check
npm run build          # Test build
```

4. **Commit and push**
```bash
git add .
git commit -m "feat: your feature description"
git push origin feature/your-feature-name
```

## 🏗️ Architecture

### System Overview

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Browser   │─────▶│   Vite Dev  │─────▶│   React     │
│   Client    │      │   Server    │      │   App       │
└─────────────┘      └─────────────┘      └─────────────┘
       │                                          │
       │                                          │
       ▼                                          ▼
┌─────────────┐                          ┌─────────────┐
│   Express   │◀─────────────────────────│  TanStack   │
│   Server    │                          │   Query     │
└─────────────┘                          └─────────────┘
       │
       ├──────▶ PostgreSQL (Database)
       ├──────▶ OpenAI Vision API (OCR)
       ├──────▶ Stripe API (Payments)
       └──────▶ Twilio API (WhatsApp)
```

### Key Design Patterns

- **Repository Pattern**: Database abstraction via `storage.ts`
- **Service Layer**: Business logic in dedicated services
- **React Query**: Server state management and caching
- **Custom Hooks**: Reusable logic encapsulation
- **Validation Layer**: Zod schemas for runtime validation

## 📚 API Documentation

### Core Endpoints

#### Authentication
```typescript
POST   /api/auth/register     // Register new user
POST   /api/auth/login        // Login user
POST   /api/auth/logout       // Logout user
GET    /api/auth/user         // Get current user
```

#### Car Listings
```typescript
GET    /api/cars              // List cars with filters
GET    /api/cars/:id          // Get single car
POST   /api/cars              // Create listing (auth required)
PUT    /api/cars/:id          // Update listing (auth required)
DELETE /api/cars/:id          // Delete listing (auth required)
```

#### Image/Document Upload
```typescript
POST   /api/cars/:id/images   // Upload images (multipart/form-data)
POST   /api/cars/:id/documents // Upload docs + OCR (multipart/form-data)
DELETE /api/cars/:carId/images/:imageId
DELETE /api/documents/:id
```

#### Alerts
```typescript
GET    /api/alerts            // Get user alerts (auth required)
POST   /api/alerts            // Create alert (auth required)
DELETE /api/alerts/:id        // Delete alert (auth required)
PATCH  /api/alerts/:id/toggle // Toggle alert (auth required)
```

For complete API documentation, see [docs/API.md](docs/API.md)

## 🚢 Deployment

### Production Build

```bash
# 1. Install dependencies
npm install --production

# 2. Build application
npm run build

# 3. Set environment variables (production values)
export NODE_ENV=production
export DATABASE_URL=postgresql://...
export SESSION_SECRET=...

# 4. Run database migrations
npm run db:push

# 5. Start server
npm start
```

### Environment Checklist

- [ ] DATABASE_URL configured
- [ ] SESSION_SECRET set (min 32 chars)
- [ ] OpenAI API key configured
- [ ] Stripe keys set (live mode)
- [ ] Twilio credentials configured
- [ ] HTTPS enabled
- [ ] Database backups configured
- [ ] Monitoring setup

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Ensure `npm run check` passes
6. Submit a pull request

### Code Standards

- **TypeScript**: Use strict typing
- **Comments**: JSDoc for public APIs
- **Naming**: camelCase for variables, PascalCase for components
- **Formatting**: Consistent with existing code
- **Validation**: Always validate user input
- **Error Handling**: Comprehensive try-catch blocks

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Ankit Khanna** - [@akhanna222](https://github.com/akhanna222)

## 🙏 Acknowledgments

- OpenAI for Vision API
- Stripe for payment infrastructure
- Twilio for WhatsApp integration
- Radix UI for accessible components
- The open-source community

## 📞 Support

For support, email support@autoninja.com or open an issue on GitHub.

---

**Built with ❤️ by the AutoNinja team**
