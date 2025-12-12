# AutoNinja API Documentation

## Base URL

```
Development: http://localhost:5001/api
Production:  https://your-domain.com/api
```

## Authentication

AutoNinja uses session-based authentication with HTTP-only cookies.

### Register

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+353871234567"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid-string",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Login

Authenticate and create a session.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid-string",
  "email": "user@example.com",
  "firstName": "John"
}
```

**Errors:**
- `401 Unauthorized` - Invalid credentials
- `400 Bad Request` - Missing fields

### Logout

End the current session.

**Endpoint:** `POST /api/auth/logout`

**Authentication:** Required

**Response:** `200 OK`

### Get Current User

Retrieve the authenticated user's information.

**Endpoint:** `GET /api/auth/user`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "id": "uuid-string",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+353871234567",
  "county": "Dublin"
}
```

## Car Listings

### List Cars

Retrieve car listings with optional filters.

**Endpoint:** `GET /api/cars`

**Query Parameters:**
- `make` (string) - Filter by car make
- `model` (string) - Filter by model
- `minPrice` (number) - Minimum price in euros
- `maxPrice` (number) - Maximum price in euros
- `minYear` (number) - Minimum year
- `maxYear` (number) - Maximum year
- `fuelType` (string) - Petrol, Diesel, Hybrid, Electric
- `transmission` (string) - Manual, Automatic
- `maxMileage` (number) - Maximum mileage in km
- `location` (string) - Location/county
- `bodyType` (string) - Saloon, SUV, Hatchback, etc.
- `color` (string) - Car color

**Example:**
```
GET /api/cars?make=BMW&maxPrice=25000&fuelType=Diesel
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "make": "BMW",
    "model": "3 Series",
    "year": 2020,
    "price": 24000,
    "mileage": 45000,
    "fuelType": "Diesel",
    "transmission": "Automatic",
    "location": "Dublin",
    "imageUrl": "/uploads/images/car-123.jpg",
    "verificationScore": 85,
    "logbookVerified": true,
    "mileageVerified": true,
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

### Get Single Car

Retrieve detailed information about a specific car.

**Endpoint:** `GET /api/cars/:id`

**Parameters:**
- `id` (number) - Car listing ID

**Response:** `200 OK`
```json
{
  "id": 1,
  "sellerId": "uuid-string",
  "vehicleType": "Car",
  "registration": "191D12345",
  "make": "BMW",
  "model": "3 Series",
  "derivative": "520d SE 4DR AUTO",
  "year": 2020,
  "price": 24000,
  "mileage": 45000,
  "mileageUnit": "km",
  "location": "Dublin",
  "county": "Dublin",
  "fuelType": "Diesel",
  "transmission": "Automatic",
  "engineSize": "2.0",
  "description": "Excellent condition, full service history...",
  "bodyType": "Saloon",
  "color": "Black",
  "numberOfDoors": 4,
  "numberOfSeats": 5,
  "nctExpiry": "2025-12",
  "nctExpired": false,
  "taxBand": "€200 (Band A4)",
  "features": ["Leather Seats", "Bluetooth", "Parking Sensors"],
  "imageUrl": "/uploads/images/car-123.jpg",
  "verificationScore": 85,
  "logbookVerified": true,
  "mileageVerified": true,
  "photosVerified": true,
  "priceGood": true,
  "owners": 2,
  "accidents": false,
  "finance": false,
  "serviceHistory": "Full",
  "status": "active",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Errors:**
- `404 Not Found` - Car not found

### Create Car Listing

Create a new car listing.

**Endpoint:** `POST /api/cars`

**Authentication:** Required

**Request Body:**
```json
{
  "vehicleType": "Car",
  "registration": "191D12345",
  "make": "BMW",
  "model": "3 Series",
  "year": 2020,
  "price": 24000,
  "mileage": 45000,
  "mileageUnit": "km",
  "location": "Dublin",
  "county": "Dublin",
  "fuelType": "Diesel",
  "transmission": "Automatic",
  "engineSize": "2.0",
  "bodyType": "Saloon",
  "color": "Black",
  "numberOfDoors": 4,
  "numberOfSeats": 5,
  "description": "Excellent condition...",
  "features": ["Leather Seats", "Bluetooth"]
}
```

**Response:** `201 Created`
```json
{
  "id": 123,
  "make": "BMW",
  "model": "3 Series",
  "status": "draft",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**Errors:**
- `400 Bad Request` - Validation failed
- `401 Unauthorized` - Not authenticated

### Update Car Listing

Update an existing car listing.

**Endpoint:** `PUT /api/cars/:id`

**Authentication:** Required (must be the owner)

**Request Body:** (Partial update supported)
```json
{
  "price": 23000,
  "description": "Updated description..."
}
```

**Response:** `200 OK`
```json
{
  "id": 123,
  "price": 23000,
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Errors:**
- `403 Forbidden` - Not the owner
- `404 Not Found` - Car not found

### Delete Car Listing

Delete a car listing.

**Endpoint:** `DELETE /api/cars/:id`

**Authentication:** Required (must be the owner)

**Response:** `204 No Content`

**Errors:**
- `403 Forbidden` - Not the owner
- `404 Not Found` - Car not found

## Images & Documents

### Upload Car Images

Upload one or more images for a car listing.

**Endpoint:** `POST /api/cars/:id/images`

**Authentication:** Required (must be the owner)

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `images` (file[]) - Array of image files (max 10 at once, 20 total)

**File Requirements:**
- **Format:** JPEG, PNG, WebP
- **Max Size:** 10MB per file
- **Max Total:** 20 images per car

**Response:** `201 Created`
```json
[
  {
    "id": 1,
    "carId": 123,
    "imageUrl": "/uploads/images/abc123.jpg",
    "isPrimary": true,
    "uploadedAt": "2024-01-01T00:00:00Z"
  },
  {
    "id": 2,
    "carId": 123,
    "imageUrl": "/uploads/images/def456.jpg",
    "isPrimary": false,
    "uploadedAt": "2024-01-01T00:00:00Z"
  }
]
```

### Get Car Images

Retrieve all images for a car.

**Endpoint:** `GET /api/cars/:id/images`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "carId": 123,
    "imageUrl": "/uploads/images/abc123.jpg",
    "isPrimary": true
  }
]
```

### Delete Car Image

Delete a specific image.

**Endpoint:** `DELETE /api/cars/:carId/images/:imageId`

**Authentication:** Required (must be the owner)

**Response:** `204 No Content`

### Upload Document (with OCR)

Upload a logbook or other document with optional OCR processing.

**Endpoint:** `POST /api/cars/:id/documents`

**Authentication:** Required (must be the owner)

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `document` (file) - Document file
- `docType` (string) - `logbook`, `service_record`, or `inspection_report`
- `processOCR` (string) - `"true"` to enable OCR processing

**File Requirements:**
- **Format:** PDF, JPEG, PNG
- **Max Size:** 10MB

**Response with OCR:** `201 Created`
```json
{
  "document": {
    "id": 1,
    "carId": 123,
    "docType": "logbook",
    "fileName": "logbook.pdf",
    "fileUrl": "/uploads/documents/xyz789.pdf",
    "uploadedAt": "2024-01-01T00:00:00Z"
  },
  "ocrData": {
    "vin": "WBADT43452G123456",
    "registrationNumber": "191D12345",
    "make": "BMW",
    "model": "3 Series",
    "yearOfManufacture": 2020,
    "owners": 2,
    "color": "Black",
    "engineSize": "2.0",
    "fuelType": "Diesel",
    "transmission": "Automatic",
    "confidence": 95
  },
  "verificationResult": {
    "isVerified": true,
    "matchPercentage": 100,
    "mismatches": []
  }
}
```

## Car Alerts

### Get User Alerts

Retrieve all alerts for the authenticated user.

**Endpoint:** `GET /api/alerts`

**Authentication:** Required

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "userId": "uuid-string",
    "make": "BMW",
    "model": "3 Series",
    "minPrice": 20000,
    "maxPrice": 30000,
    "minYear": 2018,
    "maxYear": 2022,
    "fuelType": "Diesel",
    "isActive": true,
    "notifyViaWhatsApp": true,
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

### Create Alert

Create a new car alert.

**Endpoint:** `POST /api/alerts`

**Authentication:** Required

**Request Body:**
```json
{
  "make": "BMW",
  "model": "3 Series",
  "minPrice": 20000,
  "maxPrice": 30000,
  "minYear": 2018,
  "maxYear": 2022,
  "fuelType": "Diesel",
  "transmission": "Automatic",
  "maxMileage": 100000,
  "location": "Dublin",
  "notifyViaWhatsApp": true
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "userId": "uuid-string",
  "make": "BMW",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Delete Alert

Delete an alert.

**Endpoint:** `DELETE /api/alerts/:id`

**Authentication:** Required (must be the owner)

**Response:** `204 No Content`

### Toggle Alert Status

Enable or disable an alert.

**Endpoint:** `PATCH /api/alerts/:id/toggle`

**Authentication:** Required (must be the owner)

**Request Body:**
```json
{
  "isActive": false
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "isActive": false,
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

## AI Chat

### Create Chat Session

Start a new AI chat session for car search.

**Endpoint:** `POST /api/chat/session`

**Response:** `201 Created`
```json
{
  "id": 1,
  "userId": null,
  "activeFilters": {},
  "status": "active",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Get Chat Session

Retrieve a chat session with message history.

**Endpoint:** `GET /api/chat/session/:id`

**Response:** `200 OK`
```json
{
  "session": {
    "id": 1,
    "status": "active"
  },
  "messages": [
    {
      "id": 1,
      "role": "assistant",
      "content": "Hi! I'm here to help you find your perfect car...",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Send Chat Message

Send a message in a chat session.

**Endpoint:** `POST /api/chat/session/:id/message`

**Request Body:**
```json
{
  "content": "I want a BMW under 25k",
  "isVoice": false
}
```

**Response:** `200 OK`
```json
{
  "message": {
    "id": 2,
    "role": "assistant",
    "content": "Great choice! I found 12 BMW cars under €25,000...",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "filters": {
    "make": "BMW",
    "maxPrice": 25000
  },
  "shouldSearch": true,
  "cars": [
    {
      "id": 1,
      "make": "BMW",
      "model": "3 Series",
      "price": 24000
    }
  ]
}
```

## Stripe Integration

### Get Stripe Config

Get the Stripe publishable key for client-side integration.

**Endpoint:** `GET /api/stripe/config`

**Response:** `200 OK`
```json
{
  "publishableKey": "pk_test_..."
}
```

### List Products

Get available Stripe products with prices.

**Endpoint:** `GET /api/stripe/products`

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "prod_...",
      "name": "Annual Seller Membership",
      "description": "Unlimited listings for 1 year",
      "active": true,
      "prices": [
        {
          "id": "price_...",
          "unit_amount": 999,
          "currency": "eur",
          "recurring": {
            "interval": "year"
          }
        }
      ]
    }
  ]
}
```

### Create Checkout Session

Create a Stripe checkout session for payment.

**Endpoint:** `POST /api/stripe/checkout`

**Authentication:** Required

**Request Body:**
```json
{
  "priceId": "price_...",
  "carId": 123
}
```

**Response:** `200 OK`
```json
{
  "url": "https://checkout.stripe.com/c/pay/..."
}
```

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "message": "Validation failed",
  "errors": [...]
}
```

### 401 Unauthorized
```json
{
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "message": "Not authorized"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

## Rate Limiting

Currently no rate limiting is implemented. Future implementation will include:
- 100 requests per minute per IP
- 1000 requests per hour per authenticated user

## Webhooks

### Stripe Webhook

**Endpoint:** `POST /api/stripe/webhook/:uuid`

**Note:** This endpoint is managed by `stripe-replit-sync` and handles Stripe events automatically.

## Development & Testing

### Test Environment

Use Stripe test keys for development:
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Test Cards

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

## Need Help?

- GitHub Issues: https://github.com/akhanna222/autoninja/issues
- Email: support@autoninja.com
