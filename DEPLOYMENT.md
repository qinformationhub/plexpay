# PlexPay Deployment Guide

## Deploying to Vercel

This guide will help you deploy the PlexPay application to Vercel.

### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub/GitLab/Bitbucket**: Your code should be in a Git repository
3. **Database**: You'll need a PostgreSQL database (recommended: Neon, Supabase, or Railway)

### Environment Variables

Before deploying, you'll need to set up the following environment variables in your Vercel project:

1. **DATABASE_URL**: Your PostgreSQL connection string

   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   ```

2. **NODE_ENV**: Set to production
   ```
   NODE_ENV=production
   ```

### Deployment Steps

1. **Install Vercel CLI** (optional):

   ```bash
   npm i -g vercel
   ```

2. **Deploy via Vercel Dashboard**:

   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your Git repository
   - Configure the following settings:
     - **Framework Preset**: Other
     - **Root Directory**: `./` (leave empty)
     - **Build Command**: `npm run vercel-build`
     - **Output Directory**: `dist/public`
     - **Install Command**: `npm install`

3. **Set Environment Variables**:

   - In your Vercel project dashboard, go to Settings → Environment Variables
   - Add the required environment variables listed above

4. **Deploy**:
   - Click "Deploy"
   - Vercel will automatically build and deploy your application

### Database Setup

1. **Create Database Tables**:
   After deployment, you'll need to run the database migrations:

   ```bash
   npm run db:push
   ```

2. **Database Options**:
   - **Neon**: Recommended for serverless deployments
   - **Supabase**: Good alternative with additional features
   - **Railway**: Simple PostgreSQL hosting

### Custom Domain (Optional)

1. In your Vercel project dashboard, go to Settings → Domains
2. Add your custom domain
3. Configure DNS settings as instructed

### Troubleshooting

**Build Errors**:

- Ensure all dependencies are in `package.json`
- Check that the build command is correct
- Verify environment variables are set

**Database Connection Issues**:

- Verify `DATABASE_URL` is correct
- Ensure your database allows connections from Vercel's IP ranges
- Check that the database is accessible from the internet

**Runtime Errors**:

- Check Vercel function logs in the dashboard
- Ensure all required environment variables are set
- Verify the database schema is properly migrated

### Monitoring

- Use Vercel Analytics to monitor performance
- Check function logs for debugging
- Set up error monitoring (e.g., Sentry)

### Security Notes

- Never commit `.env` files to your repository
- Use environment variables for all sensitive data
- Regularly rotate database credentials
- Enable Vercel's security features (HTTPS, etc.)
