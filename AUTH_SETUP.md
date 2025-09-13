# Authentication Setup Guide

This guide will help you set up Google OAuth authentication for your Guide Me AI application.

## 1. Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-key-here-change-this-in-production

# Google OAuth (Get these from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/guide_me_db"
```

## 2. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set the application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3001/api/auth/callback/google` (for development)
   - `https://yourdomain.com/api/auth/callback/google` (for production)
7. Copy the Client ID and Client Secret to your `.env.local` file

## 3. Generate NextAuth Secret

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Or use an online generator: https://generate-secret.vercel.app/32

## 4. Database Setup

The database migration has already been run, but if you need to reset:

```bash
npx prisma migrate reset
npx prisma migrate dev
```

## 5. Features Included

- ✅ Google OAuth authentication
- ✅ User session management
- ✅ Protected routes
- ✅ User profile display
- ✅ Sign in/out functionality
- ✅ Database integration with Prisma
- ✅ Responsive design with theme support

## 6. Usage

- Users will be redirected to `/auth/signin` if not authenticated
- The auth button is located in the sidebar next to the theme toggle
- User sessions are persisted in the database
- All chat sessions are now associated with authenticated users

## 7. Production Deployment

For production deployment:

1. Update `NEXTAUTH_URL` to your production domain
2. Add your production domain to Google OAuth redirect URIs
3. Use a secure `NEXTAUTH_SECRET`
4. Ensure your database is accessible from production

## 8. Troubleshooting

- Make sure all environment variables are set correctly
- Check that Google OAuth redirect URIs match your domain
- Verify database connection and migrations
- Check browser console for any authentication errors
