# AutoNinja Architecture Documentation

## System Architecture

### High-Level Overview

AutoNinja is built as a monolithic full-stack application with clear separation between frontend, backend, and shared code.

```
┌──────────────────────────────────────────────────────────────┐
│                         Browser                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │          React 19 Application (SPA)                    │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐ │  │
│  │  │  Pages   │  │ Components│  │   TanStack Query     │ │  │
│  │  │  (Views) │  │   (UI)    │  │  (State Management)  │ │  │
│  │  └──────────┘  └──────────┘  └──────────────────────┘ │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/WebSocket
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                    Express.js Server                          │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                  API Routes Layer                      │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │  │
│  │  │   Auth   │  │   Cars   │  │  Alerts  │   ...      │  │
│  │  └──────────┘  └──────────┘  └──────────┘            │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │               Business Logic Layer                     │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │  │
│  │  │  OpenAI  │  │  Stripe  │  │  Twilio  │   ...      │  │
│  │  │  Service │  │  Service │  │  Service │            │  │
│  │  └──────────┘  └──────────┘  └──────────┘            │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │               Data Access Layer                        │  │
│  │  ┌────────────────────────────────────────────┐        │  │
│  │  │     DatabaseStorage (Repository Pattern)   │        │  │
│  │  │         Drizzle ORM + PostgreSQL            │        │  │
│  │  └────────────────────────────────────────────┘        │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                   External Services                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │PostgreSQL│  │  OpenAI  │  │  Stripe  │  │  Twilio  │    │
│  │ Database │  │ Vision   │  │ Payments │  │ WhatsApp │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└──────────────────────────────────────────────────────────────┘
```

## Core Components

### Frontend Architecture

#### 1. Component Hierarchy

```
App
├── Layout
│   ├── Navbar
│   └── Footer
├── Pages (Routes)
│   ├── Home
│   ├── Search
│   │   ├── SearchFilters
│   │   ├── CarCard[]
│   │   └── VoiceChatDrawer
│   ├── Listing (Detail)
│   │   ├── CarImages
│   │   ├── TrustBadges
│   │   └── ContactSeller
│   ├── Sell
│   │   ├── VehicleDetailsStep
│   │   ├── PriceContactStep
│   │   ├── PhotoUploadStep
│   │   ├── PackageStep
│   │   └── PaymentStep
│   └── MyAlerts
│       ├── AlertForm
│       └── AlertList[]
└── Shared Components (ui/)
    ├── Button, Input, Select...
    └── Custom Components
```

#### 2. State Management Strategy

**Server State** (TanStack Query):
- Car listings
- User data
- Alerts
- Chat sessions

**Local State** (React useState):
- Form inputs
- UI toggles
- Temporary filters

**Optimizations**:
- Debouncing (500ms) for search inputs
- Memoization for expensive calculations
- Query caching (60s staleTime)

#### 3. Data Flow

```
User Action
    ↓
Component Event Handler
    ↓
TanStack Query Mutation/Query
    ↓
API Request
    ↓
Server Processing
    ↓
Database Operation
    ↓
Response
    ↓
Query Cache Update
    ↓
Component Re-render
```

### Backend Architecture

#### 1. Layer Structure

**Routes Layer** (`server/routes.ts`):
- HTTP endpoint definitions
- Request validation
- Response formatting
- Error handling

**Service Layer**:
- `openai.ts` - OCR and chat logic
- `stripeService.ts` - Payment operations
- `alertMatcher.ts` - Alert matching algorithm
- `twilio.ts` - WhatsApp notifications

**Data Layer** (`server/storage.ts`):
- Database abstraction
- Query builders
- Transaction management
- Type-safe operations

#### 2. Authentication Flow

```
1. User submits login
   ↓
2. Validate credentials
   ↓
3. Hash comparison (bcrypt)
   ↓
4. Create session (express-session)
   ↓
5. Store session in PostgreSQL
   ↓
6. Return session cookie
   ↓
7. Client includes cookie in requests
   ↓
8. Middleware validates session
```

#### 3. File Upload Flow

```
Client selects file
    ↓
Validate (size, type)
    ↓
Upload via multipart/form-data
    ↓
Multer middleware processes
    ↓
Save to ./uploads/{images|documents}/
    ↓
For logbooks: trigger OCR
    ↓
OpenAI Vision API call
    ↓
Extract data (JSON)
    ↓
Verify against listing
    ↓
Auto-fill if verified
    ↓
Save document record to DB
    ↓
Return success + OCR results
```

### Database Schema

#### Entity Relationship Diagram

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│    Users    │         │    Cars     │         │ CarImages   │
├─────────────┤         ├─────────────┤         ├─────────────┤
│ id (PK)     │◄───────┤│ id (PK)     │◄───────┤│ id (PK)     │
│ email       │         │ sellerId(FK)│         │ carId (FK)  │
│ passwordHash│         │ make        │         │ imageUrl    │
│ firstName   │         │ model       │         │ isPrimary   │
│ phoneNumber │         │ year        │         └─────────────┘
│ stripe...   │         │ price       │
└─────────────┘         │ mileage     │         ┌─────────────┐
       │                │ features[]  │         │CarDocuments │
       │                │ verified... │         ├─────────────┤
       │                └─────────────┘         │ id (PK)     │
       │                       │                │ carId (FK)  │
       │                       └───────────────►│ userId (FK) │
       │                                        │ docType     │
       │                                        │ fileUrl     │
       │                                        └─────────────┘
       │
       │                ┌─────────────┐
       └───────────────►│  CarAlerts  │
                        ├─────────────┤
                        │ id (PK)     │
                        │ userId (FK) │
                        │ make        │
                        │ minPrice    │
                        │ maxPrice    │
                        │ isActive    │
                        └─────────────┘
```

#### Key Tables

**users**
- Authentication data
- Profile information
- Stripe customer info

**cars**
- Vehicle listings
- Verification status
- Features array
- Seller reference

**carImages**
- Multiple images per car
- Primary image flag
- Upload timestamps

**carDocuments**
- Logbooks, service records
- Document type enum
- User and car references

**carAlerts**
- User search criteria
- Active/inactive flag
- WhatsApp notification settings

### API Architecture

#### RESTful Endpoints

**Convention**: `/api/{resource}/{id?}/{action?}`

**Examples**:
```
GET    /api/cars              - List all cars
GET    /api/cars/123          - Get specific car
POST   /api/cars              - Create car
PUT    /api/cars/123          - Update car
DELETE /api/cars/123          - Delete car
POST   /api/cars/123/images   - Upload images to car
```

#### Request/Response Format

**Request**:
```json
{
  "make": "BMW",
  "model": "3 Series",
  "year": 2020,
  "price": 25000
}
```

**Success Response**:
```json
{
  "id": 123,
  "make": "BMW",
  "model": "3 Series",
  "year": 2020,
  "price": 25000,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**Error Response**:
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "price",
      "message": "Price must be greater than 0"
    }
  ]
}
```

### OCR Processing Architecture

#### OpenAI Vision Integration

```
Document Upload
    ↓
Read file as base64
    ↓
Construct Vision API request
    ↓
System Prompt:
  "Extract logbook data from image..."
    ↓
OpenAI GPT-5 with Vision
    ↓
Parse JSON response
    ↓
Extract fields:
  - VIN
  - Registration
  - Make/Model
  - Year
  - Owners
  - Color
  - Engine Size
  - Confidence Score (0-100)
    ↓
Verify against listing data
    ↓
Calculate match percentage
    ↓
Auto-fill if >75% match
    ↓
Set verification flags
```

## Performance Optimizations

### Frontend

1. **Debouncing**: 500ms delay on search inputs
2. **Memoization**: `useMemo` for expensive calculations
3. **Callbacks**: `useCallback` to prevent re-renders
4. **Code Splitting**: Dynamic imports for large components
5. **Image Optimization**: Lazy loading, srcset

### Backend

1. **Query Optimization**: Indexed database columns
2. **Caching**: React Query with 60s staleTime
3. **Connection Pooling**: PostgreSQL pool
4. **Compression**: Gzip for responses
5. **CDN**: Static assets served from CDN

### Database

1. **Indexes**: Created on frequently queried columns
2. **Foreign Keys**: Proper relationships for joins
3. **Query Planning**: EXPLAIN ANALYZE for optimization
4. **Connection Limits**: Pool size tuning

## Security

### Authentication
- bcrypt password hashing (10 rounds)
- Session-based auth with secure cookies
- HTTPS-only in production
- CSRF protection

### Data Validation
- Input sanitization
- Zod schema validation
- File type/size validation
- SQL injection prevention (Drizzle ORM)

### API Security
- Rate limiting (future)
- CORS configuration
- Authentication middleware
- Authorization checks

## Scalability Considerations

### Current Architecture
- Monolithic design
- Single server instance
- Shared database

### Future Scaling Options

1. **Horizontal Scaling**:
   - Load balancer
   - Multiple app instances
   - Session store (Redis)

2. **Database Scaling**:
   - Read replicas
   - Partitioning by date
   - Caching layer (Redis)

3. **Microservices** (if needed):
   - Auth service
   - Upload service
   - OCR service
   - Notification service

## Monitoring & Logging

### Current Logging
- Console logs for development
- Error logging to console

### Recommended Production
- Structured logging (Winston/Pino)
- Application Performance Monitoring (APM)
- Error tracking (Sentry)
- Database query monitoring
- Uptime monitoring

## Deployment Architecture

### Development
```
Local Machine
  ├── PostgreSQL (Docker)
  ├── Node.js (tsx watch)
  └── Vite Dev Server
```

### Production
```
Cloud Platform (Replit/AWS/etc)
  ├── Application Server
  │   ├── Express API
  │   └── Static Assets
  ├── PostgreSQL Database
  └── File Storage (S3/equivalent)
```

## Technology Decisions

### Why React 19?
- Latest features (concurrent rendering)
- Server components ready
- Better performance

### Why Drizzle ORM?
- Type-safe queries
- Lightweight
- SQL-like syntax
- Better than Prisma for this use case

### Why TanStack Query?
- Automatic caching
- Background refetching
- Optimistic updates
- Better than Redux for server state

### Why Vite?
- Fastest build tool
- HMR (Hot Module Replacement)
- Modern ESM support

## Future Enhancements

1. **Real-time Features**:
   - WebSocket for live updates
   - Real-time chat between buyers/sellers

2. **Mobile App**:
   - React Native
   - Shared API

3. **Analytics**:
   - User behavior tracking
   - Business metrics dashboard

4. **AI Enhancements**:
   - Price prediction model
   - Image quality verification
   - Fraud detection

5. **Internationalization**:
   - Multi-language support
   - Multi-currency
   - Regional variations
