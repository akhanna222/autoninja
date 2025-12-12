# AutoNinja - Trusted Used Car Marketplace

## Overview

AutoNinja is a full-stack used car marketplace application focused on trust and verification. The platform enables buyers to search for verified vehicles and sellers to list cars with smart verification features. Key differentiators include AI-powered car search chat, WhatsApp notifications for car alerts, and document/photo verification systems.

The application uses a React frontend with Express backend, PostgreSQL database via Drizzle ORM, and integrates with OpenAI for conversational car search and Twilio for WhatsApp notifications.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Animations**: Framer Motion for UI animations
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful JSON API under `/api/*` routes
- **File Uploads**: Multer for handling car images and documents
- **Build**: esbuild for server bundling, Vite for client

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` (shared between client/server)
- **Session Storage**: PostgreSQL-backed sessions via connect-pg-simple
- **Migrations**: Drizzle Kit with `db:push` command

### Authentication
- **Method**: Custom email/password authentication with bcrypt
- **Sessions**: Express sessions stored in PostgreSQL
- **Password Hashing**: bcrypt with 12 salt rounds

### Key Data Models
- **Users**: Email-based accounts with optional phone for WhatsApp
- **Cars**: Listings with verification status, images, documents
- **CarAlerts**: Saved search preferences with notification settings
- **BuyerChatSessions/Messages**: AI-powered conversational search history

### API Structure
- `/api/auth/*` - Authentication (register, login, logout, user)
- `/api/cars` - Car listings CRUD with filter support
- `/api/alerts` - Car alert management
- `/api/chat/*` - AI-powered car search conversations
- `/api/user/phone` - Phone number updates for WhatsApp

## External Dependencies

### AI Services
- **OpenAI API**: Used via Replit AI Integrations for conversational car search
- **Configuration**: `AI_INTEGRATIONS_OPENAI_BASE_URL` and `AI_INTEGRATIONS_OPENAI_API_KEY` environment variables

### Messaging
- **Twilio**: WhatsApp notifications for car alerts
- **Integration**: Via Replit Connectors for credential management

### Database
- **PostgreSQL**: Primary database, requires `DATABASE_URL` environment variable
- **Session Secret**: Requires `SESSION_SECRET` environment variable

### File Storage
- **Local Storage**: Uploads stored in `./uploads/images` and `./uploads/documents`
- **Limit**: 10MB per file

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption secret
- `AI_INTEGRATIONS_OPENAI_BASE_URL` - OpenAI-compatible API endpoint
- `AI_INTEGRATIONS_OPENAI_API_KEY` - API key for AI service