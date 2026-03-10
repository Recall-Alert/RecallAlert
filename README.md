# RecallAlert — FDA Recall Intelligence

> Search 80,000+ FDA recalls. Automated ingestion, AI summaries, email alerts, and SEO auto-pages.

---

## 🚀 Quick Start (30 minutes to production)

### 1. Clone & install
```bash
git clone https://github.com/you/recallalert
cd recallalert
npm install
cp .env.local.example .env.local
```

### 2. Set up Supabase (free)
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to **SQL Editor** → paste contents of `supabase/schema.sql` → Run
4. Copy your **Project URL** and **anon key** from Settings → API into `.env.local`
5. Copy **service_role key** (keep this secret — server only)

### 3. Set up Resend (free email — 3,000/mo)
1. Create account at [resend.com](https://resend.com)
2. Add and verify your domain (e.g. `recallalert.com`)
3. Copy API key into `.env.local`
4. Set `ALERT_FROM_EMAIL=alerts@yourdomain.com`

### 4. Get Anthropic API key (AI summaries)
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create API key → paste into `.env.local`

### 5. Run first sync (populates DB)
```bash
node scripts/sync-once.js
# Takes 10–30 min to import all 80,000+ recalls
```

### 6. Deploy to Vercel
```bash
npm i -g vercel
vercel
# Add all env vars in Vercel dashboard → Settings → Environment Variables
```

### 7. Submit sitemap to Google
```
https://search.google.com/search-console
Add property: recallalert.com
Submit sitemap: https://recallalert.com/api/sitemap
```

---

## 🏗 Architecture

```
openFDA API
    ↓ (every 6 hours via Vercel Cron)
lib/sync.js
    ↓ AI summary via Claude API
Supabase (Postgres)
    ↓
Next.js ISR pages (/recalls/[slug])   ← Google indexes these
    +
/api/search                           ← Frontend search
    +
lib/alerts.js → Resend               ← Email subscribers
```

## 📁 Project Structure

```
recallalert/
├── pages/
│   ├── index.js              # Main search UI
│   ├── recalls/[slug].js     # Auto-generated SEO pages
│   ├── category/[cat].js     # Category index pages
│   └── api/
│       ├── cron/sync.js      # Vercel cron handler
│       ├── subscribe.js      # Email signup
│       ├── confirm.js        # Email confirmation
│       ├── search.js         # Search API
│       └── sitemap.js        # XML sitemap
├── lib/
│   ├── sync.js               # FDA data ingestion
│   ├── alerts.js             # Email dispatch
│   └── supabase.js           # DB client
├── supabase/
│   └── schema.sql            # Full DB schema
├── scripts/
│   └── sync-once.js          # One-time full import
├── vercel.json               # Cron schedule
└── .env.local.example        # Environment variables
```

## 💰 Monetization

| Channel | Est. Revenue |
|---|---|
| Google AdSense | $2–4 RPM × traffic |
| Personal injury law firm affiliate | $50–200/lead |
| B2B recall monitoring API | $29–99/mo per customer |
| Email newsletter sponsorship | $100–500/send at 10k+ subs |

## 🛠 Stack

| Service | Purpose | Cost |
|---|---|---|
| [Vercel](https://vercel.com) | Hosting + Cron | Free → $20/mo |
| [Supabase](https://supabase.com) | Database | Free → $25/mo |
| [Resend](https://resend.com) | Email | Free 3k/mo → $20/mo |
| [Anthropic](https://anthropic.com) | AI summaries | ~$0.003/recall |
| [Cloudflare](https://cloudflare.com) | CDN + DNS | Free |

## 📊 SEO Strategy

Each recall auto-generates a page targeting:
- `[brand name] recall 2025` — high intent, low competition
- `[drug name] fda recall` — medical queries
- `[company] food recall` — brand searches
- `/category/food` — topical authority pages

With 80,000+ existing recalls and ~500 new per week, you build a massive content library automatically.

---

*Data sourced from openFDA.gov. Not affiliated with the FDA. For informational purposes only.*
