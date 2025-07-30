# Polling App with QR Code Sharing

A modern, full-stack polling application built with Next.js, TypeScript, and Supabase. Users can create polls, share them via QR codes, and vote on them.

## 🚀 Features

- **User Authentication**: Secure registration and login with Supabase Auth
- **Poll Creation**: Create polls with multiple options and customizable settings
- **QR Code Sharing**: Generate QR codes for easy poll sharing
- **Voting System**: Vote on polls with support for multiple voting options
- **Real-time Updates**: Server-side rendering with automatic cache invalidation
- **Responsive Design**: Modern UI built with Tailwind CSS and shadcn/ui
- **API Endpoints**: RESTful API for external client integration

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database & Auth**: Supabase
- **Styling**: Tailwind CSS + shadcn/ui
- **Validation**: Zod
- **QR Codes**: qrcode
- **State Management**: Server Components + Server Actions

## 📁 Project Structure

```
alx-polly/
├── app/
│   ├── api/                    # API endpoints
│   │   ├── auth/              # Authentication endpoints
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── polls/             # Poll management endpoints
│   │   │   ├── [id]/
│   │   │   │   ├── vote/
│   │   │   │   └── qrcode/
│   │   │   └── route.ts
│   │   └── users/             # User-specific endpoints
│   │       └── [id]/polls/
│   ├── lib/
│   │   ├── actions/           # Server Actions
│   │   │   ├── auth-actions.ts
│   │   │   └── poll-actions.ts
│   │   ├── types/             # TypeScript types
│   │   │   └── index.ts
│   │   └── context/           # React Context
│   ├── (auth)/                # Authentication pages
│   ├── (dashboard)/           # Dashboard pages
│   └── components/            # UI components
├── lib/
│   ├── supabase/              # Supabase configuration
│   └── utils/                 # Utility functions
└── components/ui/             # shadcn/ui components
```

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate user

### Polls

- `GET /api/polls` - List all polls (with pagination)
- `POST /api/polls` - Create a new poll
- `GET /api/polls/[id]` - Get poll details
- `PUT /api/polls/[id]` - Update a poll
- `DELETE /api/polls/[id]` - Delete a poll
- `POST /api/polls/[id]/vote` - Vote on a poll
- `GET /api/polls/[id]/qrcode` - Get QR code for poll

### Users

- `GET /api/users/[id]/polls` - Get polls by user

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd alx-polly
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. **Set up Supabase**

   - Create a new Supabase project
   - Run the database migrations (see Database Schema below)
   - Configure authentication settings

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Schema

### Tables

#### `polls`

```sql
CREATE TABLE polls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  options TEXT[] NOT NULL,
  settings JSONB DEFAULT '{"allowMultipleVotes": false, "requireAuthentication": true}',
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `votes`

```sql
CREATE TABLE votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  option TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(poll_id, user_id)
);
```

## 🔧 Development

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for Next.js
- **Prettier**: Code formatting
- **Zod**: Runtime validation
- **Error Handling**: Custom error classes with proper HTTP status codes

### Best Practices Implemented

1. **Type Safety**: Comprehensive TypeScript types for all data structures
2. **Validation**: Zod schemas for all input validation
3. **Error Handling**: Custom error classes with proper HTTP status codes
4. **Authentication**: Secure user authentication with Supabase
5. **Authorization**: Proper ownership checks for poll operations
6. **API Design**: RESTful endpoints with consistent response formats
7. **Security**: Input sanitization, SQL injection prevention
8. **Performance**: Server-side rendering, proper caching strategies

### Testing API Endpoints

Use the provided test scripts in the `api-tests/` directory:

```bash
# JavaScript tests
cd api-tests
npm run register-user
npm run login-get-polls
npm run create-poll
npm run vote-poll

# Shell scripts
./register-user.sh
./create-poll.sh
./vote-poll.sh
```

## 📝 API Documentation

### Request/Response Examples

#### Register User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"John Doe"}'
```

#### Create Poll

```bash
curl -X POST http://localhost:3000/api/polls \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Favorite Color?","options":["Red","Blue","Green"]}'
```

#### Vote on Poll

```bash
curl -X POST http://localhost:3000/api/polls/POLL_ID/vote \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"option":"Red"}'
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.
