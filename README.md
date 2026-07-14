# ⚡ NextBit Updates — Full Deployment & Run Guide

Tech + AI news platform | Netlify + MongoDB Atlas + Vanilla JS

---

## 📁 Complete File Structure

```
nextbit-updates/
├── public/              ← Static frontend (served by Netlify CDN)
│   ├── index.html       Homepage
│   ├── news.html        News listing + category filters
│   ├── article.html     Dynamic article detail
│   ├── about.html       About page
│   ├── contact.html     Contact form
│   ├── subscribe.html   YouTube subscribe page
│   ├── admin.html       Admin login  →  /admin
│   ├── dashboard.html   Admin panel  →  /dashboard
│   ├── style.css        Global dark neon styles
│   └── app.js           Shared frontend JavaScript
│
├── functions/           ← Netlify serverless functions (Node.js)
│   ├── db.js            MongoDB connection + Mongoose models
│   ├── articles.js      Public articles API
│   ├── subscribe.js     Newsletter subscribe API
│   ├── contact.js       Contact form API
│   ├── settings.js      Public site settings API
│   ├── seed.js          One-time DB seed (admin + sample data)
│   └── admin/
│       ├── login.js     JWT authentication
│       ├── articles.js  Protected articles CRUD
│       └── settings.js  Protected settings update
│
├── netlify.toml         Netlify routing + headers config
├── package.json         Node.js dependencies
├── .env.example         Environment variables template
└── README.md            This file
```

---

## 🚀 DEPLOYMENT GUIDE (Step by Step)

---

### STEP 1 — Set Up MongoDB Atlas (Free, No Credit Card)

1. Go to **https://cloud.mongodb.com** → Sign up free
2. Create a **Free Cluster** (M0 tier)
3. **Database Access** → Add Database User:
   - Username: `nextbit-admin`
   - Password: generate a strong password (save it!)
   - Role: **Read and write to any database**
4. **Network Access** → Add IP Address → **Allow Access from Anywhere** (`0.0.0.0/0`)
   *(Required for Netlify serverless functions)*
5. **Clusters** → Connect → **Drivers** → Copy the connection string:
   ```
   mongodb+srv://nextbit-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Edit the string to include your database name `nextbit`:
   ```
   mongodb+srv://nextbit-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/nextbit?retryWrites=true&w=majority
   ```
   *(Save this — you'll need it in Step 3)*

---

### STEP 2 — Deploy to Netlify

**Option A: Drag & Drop (Quickest)**
1. Go to **https://app.netlify.com** → Sign in / create free account
2. From the dashboard, drag the entire **`nextbit-updates`** folder onto the page
3. Netlify detects `netlify.toml` automatically and deploys

**Option B: GitHub (Best for updates)**
1. Push the `nextbit-updates` folder to a new GitHub repository
2. In Netlify → **Add new site** → **Import an existing project** → GitHub
3. Select your repo
4. Build settings are auto-detected:
   - Publish directory: `public`
   - Functions directory: `functions`
5. Click **Deploy**

After deploy, your site will be at something like:
`https://amazing-name-12345.netlify.app`

---

### STEP 3 — Add Environment Variables in Netlify

**This is required before the site works.**

1. In Netlify → your site → **Site Configuration** → **Environment Variables**
2. Click **Add a variable** for each of these:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | Your Atlas connection string from Step 1 |
| `JWT_SECRET` | A long random string (min 32 chars) |
| `SEED_SECRET` | `nextbit-seed-2025` (or any custom key) |

**Generating a JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Or use any password generator with 40+ characters.

3. After adding all 3 variables → go to **Deploys** → **Trigger deploy** → **Deploy site**

---

### STEP 4 — Run the Database Seed (One Time Only)

This creates your admin account, default settings, and 3 sample articles.

Visit this URL in your browser:
```
https://YOUR-SITE.netlify.app/.netlify/functions/seed?key=nextbit-seed-2025
```
*(Replace `YOUR-SITE` with your actual Netlify subdomain)*

**You should see:**
```json
{
  "message": "Seed completed! NextBit Updates is ready.",
  "results": {
    "created": [
      "Admin user: nextbitupdates@gmail.com",
      "Default site settings",
      "Article: Top 10 AI Tools...",
      "Article: Gemini vs GPT-4o...",
      "Article: $5,000/Month Passive Income..."
    ]
  }
}
```

---

### STEP 5 — Log Into Admin Dashboard

1. Visit: `https://YOUR-SITE.netlify.app/admin.html`
2. Login with:
   - **Email:** `nextbitupdates@gmail.com`
   - **Password:** `NextBit2009@`
3. You'll be redirected to the **Dashboard**

---

## 🛠 LOCAL DEVELOPMENT

### Requirements
- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB)
- Netlify CLI

### Setup
```bash
# 1. Install dependencies
npm install

# 2. Install Netlify CLI globally
npm install -g netlify-cli

# 3. Create your .env file
cp .env.example .env
# Now edit .env and fill in your real MONGODB_URI and JWT_SECRET

# 4. Start local dev server
netlify dev
```

### Access locally:
| URL | Description |
|-----|-------------|
| http://localhost:8888 | Homepage |
| http://localhost:8888/news.html | News page |
| http://localhost:8888/admin.html | Admin login |
| http://localhost:8888/dashboard.html | Admin dashboard |
| http://localhost:8888/.netlify/functions/seed?key=nextbit-seed-2025 | Run seed |
| http://localhost:8888/.netlify/functions/articles | Articles API |
| http://localhost:8888/.netlify/functions/settings | Settings API |

---

## 🔑 Default Admin Credentials

| Field | Value |
|-------|-------|
| Email | nextbitupdates@gmail.com |
| Password | NextBit2009@ |
| Admin URL | /admin.html |
| Dashboard | /dashboard.html |

---

## ✏️ How to Customize

### Change Your Logo
1. Dashboard → Settings tab
2. Paste any image URL into **Logo URL** field
3. Save — updates across all pages instantly

### Update Social Links
1. Dashboard → Settings → Social Links section
2. Update YouTube, Facebook, Twitter, Instagram URLs
3. Save — all footer/header links update site-wide

### Create an Article
1. Dashboard → Articles → **Create New** tab
2. Fill in: Title, Category (Tech Updates / AI Tools), Excerpt, Content (HTML supported), Thumbnail URL
3. Check "Publish immediately" → **Publish Article**

### Update YouTube Videos
Edit `public/index.html` and `public/subscribe.html` — find:
```javascript
const YT_VIDEOS = [
  { id: 'YOUR_VIDEO_ID', title: 'Your Title', date: '2025-01-01' },
  // add more...
];
```
Replace the IDs with your actual YouTube video IDs (from `youtube.com/watch?v=VIDEO_ID`).

---

## 🔌 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/.netlify/functions/articles` | None | List articles (`?limit=10&page=1&category=AI+Tools`) |
| GET | `/.netlify/functions/articles/:slug` | None | Single article by slug |
| GET | `/.netlify/functions/settings` | None | Site settings |
| POST | `/.netlify/functions/subscribe` | None | Newsletter signup `{email}` |
| POST | `/.netlify/functions/contact` | None | Contact form `{name,email,subject,message}` |
| GET | `/.netlify/functions/seed?key=X` | Key | Run DB seed |
| POST | `/.netlify/functions/admin/login` | None | Login `{email,password}` → JWT |
| GET | `/.netlify/functions/admin/articles` | JWT | All articles + stats |
| POST | `/.netlify/functions/admin/articles` | JWT | Create article |
| DELETE | `/.netlify/functions/admin/articles/:id` | JWT | Delete article |
| PUT | `/.netlify/functions/admin/settings` | JWT | Update site settings |

---

## 🔒 Security Notes

- JWT tokens expire in 7 days
- Passwords hashed with bcrypt (cost factor 12)
- All admin routes require Bearer token authentication
- After running seed.js, consider deleting it for security
- Never commit your `.env` file — it's in `.gitignore`

---

## ❓ Troubleshooting

**"Internal Server Error" on API calls?**
→ Check MONGODB_URI is set correctly in Netlify environment variables
→ Make sure MongoDB Atlas Network Access allows `0.0.0.0/0`

**Login returns "Invalid credentials"?**
→ Make sure you ran the seed first (Step 4)
→ Check JWT_SECRET is set in Netlify env vars

**Articles not showing on homepage?**
→ Run seed first OR create articles from admin dashboard

**Functions timing out?**
→ Your MongoDB Atlas cluster may be paused (free tier auto-pauses)
→ Go to Atlas → Resume Cluster

---

## 📞 Support

- Email: nextbitupdates@gmail.com
- YouTube: @NextBitUpdates
- Twitter: @NextBitUpdates

*Built with ⚡ by NextBit Updates*
