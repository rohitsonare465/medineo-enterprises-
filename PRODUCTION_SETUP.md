# Production Deployment - MongoDB Connection Fix

## Problem
Database works locally but not on the Render server.

## Root Causes & Solutions

### ✅ Step 1: Configure Environment Variables in Render

1. **Go to Render Dashboard**
   - Navigate to your service: `medineo-erp-api`
   - Click **Environment** in the left sidebar

2. **Add/Update Variables:**
   ```
   NODE_ENV = production
   MONGODB_URI = mongodb+srv://medineoenterprises_db_user:swAoqXYjruHhgn8U@medineoenterprises.98qohml.mongodb.net/medineo_erp
   JWT_SECRET = your-jwt-secret-here
   JWT_REFRESH_SECRET = your-jwt-refresh-secret-here
   FRONTEND_URL = your-production-frontend-url
   PORT = 5001
   ```

3. **Deploy** - Click "Deploy latest commit" after setting variables

### ✅ Step 2: Fix MongoDB Atlas IP Whitelist (CRITICAL!)

This is the most common issue. MongoDB blocks all IPs by default.

**Option A: Allow All IPs (Quick but less secure)**
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com)
2. Go to your cluster: `medineoenterprises`
3. Click **Network Access** → **Add IP Address**
4. Enter `0.0.0.0/0` and click **Confirm**

**Option B: Whitelist Only Render's IP (Recommended)**
1. In Render Dashboard, go to your service settings
2. Find the **Outbound IP** address
3. In MongoDB Atlas, add that specific IP address

### ✅ Step 3: Verify Connection String

Your connection string should include the database name:
```
mongodb+srv://medineoenterprises_db_user:swAoqXYjruHhgn8U@medineoenterprises.98qohml.mongodb.net/medineo_erp
```

Replace `medineo_erp` with your actual database name if different.

### ✅ Step 4: Monitor Logs

In Render Dashboard:
1. Go to your service
2. Click **Logs** tab
3. Look for connection messages:
   - ✅ `MongoDB Connected: medineoenterprises.98qohml.mongodb.net`
   - ❌ `MongoDB Connection Error` (if this appears, verify IP whitelist)

### ✅ Step 5: Test the Connection

After deployment:
1. Call any API endpoint that requires database access (e.g., login)
2. Check if it returns data or connection errors
3. Monitor the logs in Render

## Common Connection Errors & Fixes

| Error | Cause | Solution |
|-------|-------|----------|
| `getaddrinfo ENOTFOUND` | Can't reach MongoDB Atlas | Check IP whitelist in MongoDB Atlas |
| `connect ECONNREFUSED` | MongoDB server down | Verify cluster is running in MongoDB Atlas |
| `authentication failed` | Wrong credentials | Check username/password in connection string |
| `CORS error in frontend` | Frontend URL not whitelisted | Add FRONTEND_URL env var in Render |

## Quick Checklist

- [ ] Environment variables added to Render
- [ ] MongoDB Atlas IP whitelist updated (0.0.0.0/0 or specific Render IP)
- [ ] Connection string includes database name
- [ ] Deploy triggered after env changes
- [ ] Check Render logs for "MongoDB Connected" message
- [ ] Test API endpoints that use database

## Connection String Format

```
mongodb+srv://username:password@cluster.mongodb.net/database_name
```

All special characters in password should be URL-encoded. If your password has `@`, encode it as `%40`.

## Resolving Startup Latency & Cold Starts

### ⚡ Render Free Tier "Cold Start" Delay
If you are deploying the backend on the **Render Free Tier**, Render will automatically suspend (spin down) your service after **15 minutes** of inactivity. 
The next request to the API will trigger a **cold start**, which takes **50+ seconds** to boot the service and connect to the database.

**Mitigation (Recommended):**
Set up a free pinging service (like [UptimeRobot](https://uptimerobot.com) or [Cron-Job.org](https://cron-job.org)) to hit the backend's health check endpoint every **10–14 minutes**:
```
https://your-backend-url.onrender.com/health
```
This keeps the container warm and prevents it from entering sleep mode, ensuring zero startup delay for active users.

### ⚡ Node.js IPv6 DNS Resolution Latency
In Node.js 17+, the runtime defaults to resolving IPv6 addresses first. In environments like Render or AWS where IPv6 isn't fully set up for the database or outgoing mail SMTP servers, DNS lookups for MongoDB Atlas can hang for **5–30 seconds** before falling back to IPv4.

**Applied Fixes in code:**
1. We set DNS result order to prioritize IPv4 first at the entry point of the app (`src/index.js`):
   ```javascript
   const dns = require('dns');
   if (dns.setDefaultResultOrder) {
     dns.setDefaultResultOrder('ipv4first');
   }
   ```
2. We forced Mongoose to connect over IPv4 using the `{ family: 4 }` configuration option in `database.js` and command line scripts.
