# Database Setup Instructions

## Issue: 404 Errors on Dynamic Routes

If you're seeing "Page Not Found" (404) errors on dynamic routes like:
- `/exams/[slug]`
- `/subjects/[id]`
- `/posts/[id]`
- `/content/[id]`
- `/admin/contact/[id]`

This is because the **DATABASE_URL environment variable is not set**.

## Solution: Configure Database Connection

### For Development (Local Testing)

1. **Get your Neon database connection string:**
   - Go to your Neon project dashboard
   - Copy the Connection String from the "Connection details" section
   - It should look like: `postgresql://user:password@host/dbname`

2. **Create `.env.local` file in project root:**
   ```bash
   DATABASE_URL="postgresql://user:password@host/dbname"
   ```

3. **Restart the development server:**
   ```bash
   npm run dev
   ```

### For Production (Vercel Deployment)

1. **Set environment variable in Vercel:**
   - Go to your Vercel project settings
   - Navigate to "Environment Variables"
   - Add a new variable:
     - Name: `DATABASE_URL`
     - Value: Your Neon connection string
   - Select "Production" environment

2. **Redeploy your application:**
   ```bash
   git push
   # OR manually trigger deployment from Vercel dashboard
   ```

## How It Works

When you visit a dynamic route like `/exams/waec`:

1. The page component calls a server action (e.g., `getExamCategoryBySlug("waec")`)
2. The server action executes SQL query: `SELECT * FROM exam_categories WHERE slug = 'waec'`
3. If `DATABASE_URL` is not set:
   - The query throws an error
   - The server action returns `null`
   - The page component calls `notFound()`
   - User sees the 404 page

4. If `DATABASE_URL` is set:
   - The query succeeds
   - Data is returned and displayed
   - User sees the requested page content

## Verification

After setting DATABASE_URL, verify by checking server logs for:

```
[DB] Database connection initialized successfully
[SUBJECT] Fetching subject with ID: 1
[SUBJECT] Subject found: Mathematics
```

If you see "Failed to fetch subject" or "Database connection failed", contact support.

## Additional Notes

- The `.env.development.local` file is ignored by git (see .gitignore)
- Use `.env.production.local` only for sensitive testing - never commit it
- For Vercel deployment, always use the Vercel Environment Variables panel
- The DATABASE_URL is read-only once set on Vercel for security

## Support

If you continue to see 404 errors after setting DATABASE_URL:

1. Check that DATABASE_URL is properly set: `echo $DATABASE_URL`
2. Verify the connection string format is correct
3. Check that your database has the required tables (exam_categories, subjects, posts, etc.)
4. Review the server logs for specific error messages
5. Contact support at: wisdommeremeze@gmail.com
