# 🌐 NOVA Storefront: Full-Stack Backend Architecture & Production Hosting Guide

> **Welcome to the Backend & Deployment Phase!**  
> This guide demystifies how modern full-stack web applications work behind the scenes, how client-to-server APIs communicate, and how to host this site live on the internet with zero hosting costs.

---

## 🧠 Part 1: The Full-Stack Mental Model (Frontend vs. Backend)

```mermaid
flowchart TD
    subgraph Browser["🖥️ CLIENT (User's Browser)"]
        UI["React 19 Components<br/>(Header, ProductCard, CheckoutModal)"]
        State["Client State & Storage<br/>(Zustand Stores, localStorage, DOM Events)"]
        FetchCall["HTTP Fetch Request<br/>fetch('/api/orders', { method: 'POST', body: ... })"]
        UI --> State
        State --> FetchCall
    end

    subgraph Internet["🌐 THE INTERNET / NETWORK LAYER"]
        HTTPS["Encrypted HTTPS Traffic<br/>Headers, JSON Payloads, Status Codes (200, 201, 400, 500)"]
    end

    subgraph Server["☁️ BACKEND SERVER (Node.js / Vercel Serverless)"]
        RouteHandler["app/api/orders/route.ts<br/>(Next.js Route Handler / REST Endpoint)"]
        ServerAction["app/actions/orderActions.ts<br/>(Next.js 16 Server Actions 'use server')"]
        Security["Zero-Trust Security & Recalculation<br/>(Queries Database catalog, prevents price tampering)"]
        Database["Database Layer<br/>(PostgreSQL, Prisma ORM, In-Memory Store)"]
        
        RouteHandler --> Security
        ServerAction --> Security
        Security --> Database
    end

    FetchCall -->|JSON Request| HTTPS
    HTTPS -->|Request| RouteHandler
    RouteHandler -->|JSON Response 201 Created| HTTPS
    HTTPS -->|Response| UI
```

### 1. What runs on the Frontend (Client)?
- **Location:** The user's device (Mac, Windows, iPhone, Android) running Chrome, Safari, or Firefox.
- **Components:** Files with `"use client"` at the top.
- **Responsibilities:** Rendering UI, handling clicks, playing animations, managing local shopping cart state in `localStorage`.
- **Golden Rule:** **NEVER trust calculations from the client!** Anyone can open browser Developer Tools (F12) and change JavaScript variables (e.g. changing an item's price from \$249.99 to \$0.01).

### 2. What runs on the Backend (Server)?
- **Location:** Secure cloud servers or serverless lambda functions (e.g., AWS, Vercel, Node.js runtime).
- **Components:** Files in `app/api/.../route.ts` and files marked with `"use server"`.
- **Responsibilities:**
  - Authenticating user identity (passwords, JWT tokens, session cookies).
  - Recalculating prices against the genuine database catalog.
  - Interacting with databases (PostgreSQL, MongoDB, Prisma).
  - Calling private payment gateways (Stripe Secret Key).
  - Accessing private environment variables that must **never** be leaked to the public.

---

## 🔌 Part 2: How APIs Work in Next.js 16 (Route Handlers vs. Server Actions)

Next.js App Router provides two distinct ways for the frontend to communicate with the backend:

| Feature | 📡 Route Handlers (`app/api/.../route.ts`) | ⚡ Server Actions (`"use server"`) |
| :--- | :--- | :--- |
| **Protocol** | Standard HTTP REST (GET, POST, PUT, DELETE) | Direct RPC (Remote Procedure Call) over HTTP POST |
| **How to Call** | `fetch('/api/products')` | `import { submitOrderAction }` then `await submitOrderAction()` |
| **Best For** | Public APIs, mobile apps, webhooks, external integrations | Internal React form submissions, fast database mutations |
| **Output** | Raw JSON (`NextResponse.json(...)`) | Plain JavaScript/TypeScript values or revalidated paths |

### Testing our Backend APIs in your browser:
Once your local dev server is running (`npm run dev`), open these URLs in your browser:
1. **Catalog Search & Filter API:**  
   `http://localhost:3000/api/products`  
   `http://localhost:3000/api/products?search=audio&sort=price-asc`
2. **Single Product Slug API:**  
   `http://localhost:3000/api/products/nova-sonic-wireless`
3. **Orders Endpoint:**  
   `http://localhost:3000/api/orders` (GET: list orders, POST: submit new verified order)

---

## 🚀 Part 3: How Hosting Works in Next.js

When you build a Next.js application for production (`npm run build`), Next.js performs **Hybrid Compilation**:

```mermaid
flowchart LR
    Source["Next.js Source Code<br/>(TSX, CSS, API Routes)"] --> Build["'npm run build' (Compiler)"]
    Build --> Static["1. Static Assets (CDN Edge)<br/>HTML, CSS, Images, JS Bundles<br/>(Cached worldwide for 0ms load)"]
    Build --> Serverless["2. Serverless Functions (Backend)<br/>API Route Handlers & Server Actions<br/>(Spins up in milliseconds on demand)"]
```

1. **Static Files (HTML/CSS/JS):** Deployed to a **Global Edge CDN** (Content Delivery Network) with servers in over 300 cities worldwide. When a user in London or Tokyo visits your site, they receive files from a server just miles away!
2. **Dynamic Backend APIs:** Packaged as lightweight **Serverless Functions** (powered by AWS Lambda under the hood). They scale from 0 to 100,000 requests automatically and cost \$0 when nobody is using them.

---

## 🛠️ Part 4: Step-by-Step Guide to Host this Site on Vercel (Free)

Vercel is the company that created and maintains Next.js. Deploying on Vercel is free, takes under 3 minutes, and includes free SSL (HTTPS) and continuous deployment.

### Method 1: The Git Integration (Recommended Industry Standard)

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer
    participant Git as GitHub / GitLab
    participant Vercel as Vercel Cloud Platform
    participant Web as Live Web URL (HTTPS)

    Dev->>Git: git push origin main
    Git->>Vercel: Webhook Notification (New Commit Detected)
    Vercel->>Vercel: Executes 'npm run build' & tests
    Vercel->>Web: Deploys globally to CDN & Serverless Nodes
    Web-->>Dev: Live Production URL (e.g., nova-storefront.vercel.app)
```

#### Step-by-Step Instructions:
1. **Push your code to your Git repository:**
   ```bash
   git add .
   git commit -m "Day 10: Full-stack backend APIs and deployment ready"
   git push origin main
   ```
2. **Sign up or log in to Vercel:**
   - Go to [https://vercel.com](https://vercel.com) and click **"Sign Up"** (use your GitHub account for 1-click access).
3. **Import Project:**
   - Click the **"Add New..."** button in Vercel and select **"Project"**.
   - Under "Import Git Repository", find your `nova-ecommerce` repository and click **"Import"**.
4. **Configure Project:**
   - **Framework Preset:** Vercel automatically selects `Next.js`.
   - **Root Directory:** Leave as `./` (or select `nova-ecommerce` if inside a subfolder).
   - **Build Command:** `next build` (default).
   - **Output Directory:** `.next` (default).
5. **Click "Deploy":**
   - Vercel will install dependencies, run the Next.js production build, compile your API routes, and deploy!
   - In ~60 seconds, you get a custom live link: `https://your-project-name.vercel.app`.

---

### Method 2: Deploy Directly from Terminal (Vercel CLI)

If you do not want to connect GitHub right away, you can deploy straight from your local terminal using the Vercel CLI:

```bash
# 1. Run the Vercel deploy tool
npx vercel

# Follow the interactive prompts:
# ? Set up and deploy "D:\NOVA Project\nova-ecommerce"? [Y/n] y
# ? Which scope do you want to deploy to? (Select your personal account)
# ? Link to existing project? [y/N] n
# ? What's your project's name? nova-ecommerce
# ? In which directory is your code located? ./

# 2. Deploy directly to live production:
npx vercel --prod
```

---

## 🔐 Part 5: Managing Environment Variables & Secrets

In real production, sensitive keys (such as Stripe API keys or database passwords) must **never** be committed to Git.

### 1. Local Development (`.env.local`):
Create a file named `.env.local` in your project root:
```env
# Server-only private secrets (never exposed to client browser)
DATABASE_URL="postgresql://user:password@localhost:5432/nova_db"
STRIPE_SECRET_KEY="sk_test_51Mz..."

# Public variables (accessible in browser client components)
NEXT_PUBLIC_STORE_NAME="NOVA Storefront"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### 2. Production Secrets in Vercel:
1. In your Vercel Project Dashboard, navigate to **Settings** ➔ **Environment Variables**.
2. Add your secret keys (`DATABASE_URL`, `STRIPE_SECRET_KEY`).
3. Vercel securely encrypts these keys and injects them only into the serverless backend functions during runtime.

---

## 🐳 Part 6: Alternative Hosting (Self-Hosted Node.js / Docker)

If you prefer hosting on your own Linux VPS (DigitalOcean, AWS EC2, Linode, or Hetzner) using Docker:

```dockerfile
# Multi-stage production Dockerfile for Next.js
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

To run without Docker on any computer with Node.js:
```bash
npm run build
npm run start
# Server starts listening on http://localhost:3000
```
