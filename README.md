# 🛍️ ShopEase — Full-Stack E-Commerce Platform

> A modern, feature-rich online shopping platform with real-time messaging, role-based access, AI-powered recommendations, Razorpay payments, and live order tracking — built with **React + Spring Boot**.

---

## 📌 Table of Contents

- [About the Project](#-about-the-project)
- [✨ Full Feature Breakdown](#-full-feature-breakdown)
  - [🛒 Consumer / Buyer Features](#-consumer--buyer-features)
  - [🏪 Seller Features](#-seller-features)
  - [🛡️ Admin Features](#️-admin-features)
  - [💬 Real-Time Messaging](#-real-time-messaging)
  - [🤖 AI-Powered Recommendations](#-ai-powered-recommendations)
  - [🔐 Authentication & Security](#-authentication--security)
  - [💅 UI/UX & Design](#-uiux--design)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Available Roles](#-available-roles)
- [API Overview](#-api-overview)
- [Contributing](#-contributing)
- [License](#-license)

---

## 📖 About the Project

**ShopEase** is a production-ready, full-stack e-commerce web application crafted to deliver a premium shopping experience. It supports three distinct user roles — **Consumer**, **Seller**, and **Admin** — each with their own dedicated interface and feature set.

Key highlights include **WebSocket-powered real-time chat** between buyers and sellers, **Google Gemini AI** for intelligent product recommendations, **Razorpay** for seamless INR payment processing, **JWT authentication**, and automated **email notifications** for orders and password resets.

---

## ✨ Full Feature Breakdown

### 🛒 Consumer / Buyer Features

| Feature | Description |
|---|---|
| **Browse & Search** | Explore all products with category filters, price-based sorting, and keyword search |
| **Product Detail Page** | Multi-image gallery, star ratings, discount badge, stock availability, brand info, return policy & features |
| **3D Product Cards** | Immersive 3D hover effect on product cards for a premium feel |
| **Add to Cart** | Adjustable quantity selector, live cart badge in the navbar |
| **Wishlist** | Save products with a heart toggle; persisted per user in the database |
| **Checkout** | Full shipping form with name, address, city, state, PIN, and phone |
| **Razorpay Payments** | Secure INR payments via Razorpay — test & live key support |
| **Order History** | View all past orders with product images, seller names, and subtotals |
| **Order Status Tracker** | 5-step visual progress bar: Pending → Paid → Processing → Shipped → Delivered |
| **Tracking Number** | Displayed on the order card once the seller dispatches the item |
| **PDF Invoice Download** | One-click, print-ready HTML invoice with GST breakdown (18% GST applied) |
| **Write Reviews** | Star rating + comment form on every product detail page |
| **Chat with Seller** | Start a real-time conversation with the seller directly from the product page |
| **AI Recommendations** | Personalized product suggestions on the homepage powered by Gemini AI |
| **Forgot / Reset Password** | Email-based password reset flow with a time-limited token link |

---

### 🏪 Seller Features

| Feature | Description |
|---|---|
| **Seller Dashboard** | Central hub with tabs for Analytics, Products, Orders, Messages, and Add Item |
| **Analytics Charts** | Interactive Pie chart (products by category) and Bar chart (order fulfillment breakdown) using Recharts |
| **Revenue Overview** | KPI cards showing Total Revenue, Total Products, Total Orders, and Returns |
| **Add Products** | Rich form: name, brand, price, discount price, stock, category, image URL, description, features, return policy |
| **Manage Products** | View all listings in a table; toggle status (Active / Out of Stock / Removed); delete listings |
| **Order Management** | Hierarchical order view grouped by Category → Product → Individual Orders |
| **Dispatch & Deliver** | One-click buttons to move an order from Paid → Shipped → Delivered |
| **Return Handling** | Mark orders as Returned directly from the order management panel |
| **Message Buyer** | Click "Message Buyer" on any order to open a real-time chat with that customer |
| **Seller Inbox (Real-Time)** | Full embedded chat panel inside the Seller Dashboard via WebSocket |

---

### 🛡️ Admin Features

| Feature | Description |
|---|---|
| **Admin Dashboard** | Dedicated panel protected by role-based route guards |
| **User Overview** | KPI stats showing total Consumers and total Sellers on the platform |
| **Consumer Management** | Browse all buyers with name, email, phone, and join date |
| **Seller Management** | Browse all sellers with their store name and verified GST number |
| **Search & Filter** | Live search bar to find any user instantly by name or email |
| **Delete Any User** | Hard delete a consumer or seller account with a confirm dialog |
| **No Shopping UI** | Admin users are redirect away from shop/cart — they only see the management panel |

---

### 💬 Real-Time Messaging

ShopEase has a **full WebSocket-based real-time chat system** built with Spring WebSocket (STOMP) on the backend and a custom `ChatClient` on the frontend.

| Feature | Description |
|---|---|
| **Consumer Inbox** | Dedicated `/messages` page with a sidebar of all conversations |
| **Start Chat from Product** | "Chat with Seller" button on every product detail page — opens chat pre-loaded with that seller |
| **Seller Inbox** | Embedded chat panel inside the Seller Dashboard under the "Messages" tab |
| **Start Chat from Order** | "Message Buyer" button on every order card inside the Seller Dashboard |
| **WebSocket Live Delivery** | Messages arrive in real-time without page refresh via STOMP over WebSocket |
| **Unread Count API** | Backend endpoint tracks and exposes unread message count per user |
| **Mark as Read** | Messages can be marked read via a dedicated API endpoint |
| **Conversation History** | Full chat history is persisted in MySQL and loaded on conversation open |
| **Contact Discovery** | Auto-populated contact list based on previous conversations |

---

### 🤖 AI-Powered Recommendations

| Feature | Description |
|---|---|
| **Personalized for Logged-in Users** | Gemini 2.0 Flash analyses the user's purchase history and wishlist to suggest relevant products |
| **Public Trending Products** | Unauthenticated visitors see AI-curated trending products on the homepage |
| **Seamless Integration** | Recommendations appear as a styled product grid section on the homepage |
| **Graceful Fallback** | If AI fetch fails, the section is silently hidden — no error shown to the user |

---

### 🔐 Authentication & Security

| Feature | Description |
|---|---|
| **JWT Authentication** | Stateless session management using signed JSON Web Tokens |
| **BCrypt Password Hashing** | All passwords stored with BCrypt — never in plain text |
| **Role-Based Route Guards** | React routes and Spring Security endpoints are both protected by role |
| **Forgot Password** | User requests a reset link sent to their registered email |
| **Reset Password** | Time-limited token link leads to a dedicated reset form |
| **Email via Gmail SMTP** | Order confirmations and password reset emails sent via Spring Mail |
| **CORS Configuration** | Backend configured to only accept requests from the registered frontend URL |

---

### 💅 UI/UX & Design

| Feature | Description |
|---|---|
| **3D Product Cards** | CSS perspective transform creates a realistic 3D hover "pop" on product images |
| **Responsive Layout** | Fully adapts to desktop, tablet, and mobile viewports |
| **INR Currency (₹)** | All prices, invoices, and payment flows use Indian Rupees |
| **Toast Notifications** | Action feedback (add to cart, wishlist, errors) via React Hot Toast |
| **Smooth Loading States** | Spinner overlays on every async data fetch |
| **Category Browsing** | Visual category cards with images on the homepage |
| **Related Products** | "You may also like" grid shown below product details |
| **Order Success Page** | Animated confirmation screen after a successful Razorpay payment |
| **Empty State Screens** | Friendly illustrations with CTAs for empty cart, wishlist, and orders |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, React Router 7, Axios, Lucide / React Icons, React Hot Toast |
| **Backend** | Java 17, Spring Boot 3.2, Spring Security, Spring Data JPA, Hibernate |
| **Real-Time** | Spring WebSocket (STOMP) + custom frontend `ChatClient` |
| **Database** | MySQL 8.0 (auto-created schema: `shopease_db`) |
| **Authentication** | JWT (JSON Web Tokens) + BCrypt |
| **Payments** | Razorpay API (INR, test & live modes) |
| **AI** | Google Gemini API (`gemini-2.0-flash`) |
| **Email** | Spring Mail (Gmail SMTP) |
| **Charts** | Recharts (seller analytics — Pie, Bar, Line, Area) |
| **Build Tools** | Maven Wrapper (backend), npm + Vite (frontend) |

---

## 📁 Project Structure

```
Online shopping/
├── backend/                          # Spring Boot application
│   ├── src/
│   │   └── main/
│   │       ├── java/com/shopease/
│   │       │   ├── config/           # CORS, Security, WebSocket config
│   │       │   ├── controller/       # REST + WebSocket controllers
│   │       │   │   ├── AuthController.java
│   │       │   │   ├── CartController.java
│   │       │   │   ├── CategoryController.java
│   │       │   │   ├── MessageController.java   ← WebSocket + REST chat
│   │       │   │   ├── OrderController.java
│   │       │   │   ├── ProductController.java
│   │       │   │   ├── RecommendationController.java
│   │       │   │   ├── ReviewController.java
│   │       │   │   ├── UserController.java
│   │       │   │   └── WishlistController.java
│   │       │   ├── dto/              # Request & response DTOs
│   │       │   ├── exception/        # Global exception handler
│   │       │   ├── model/            # JPA entity classes
│   │       │   ├── repository/       # Spring Data JPA repositories
│   │       │   ├── security/         # JWT filter, provider, UserDetailsService
│   │       │   └── service/          # Business logic services
│   │       └── resources/
│   │           └── application.properties
│   └── pom.xml
│
└── frontend/                         # React + Vite application
    ├── public/
    ├── src/
    │   ├── assets/
    │   ├── components/               # Navbar, Footer, ProductCard
    │   ├── context/                  # AuthContext, CartContext
    │   ├── pages/
    │   │   ├── HomePage.jsx          # Hero, categories, AI recs, featured
    │   │   ├── ShopPage.jsx          # Product listing with filters
    │   │   ├── ProductDetailPage.jsx # Full product + reviews + chat-with-seller
    │   │   ├── CartPage.jsx          # Cart with quantity management
    │   │   ├── CheckoutPage.jsx      # Shipping form + Razorpay checkout
    │   │   ├── OrdersPage.jsx        # Order history + tracker + invoice
    │   │   ├── WishlistPage.jsx      # Saved products
    │   │   ├── MessagesPage.jsx      # Real-time chat inbox (buyer)
    │   │   ├── SellerDashboard.jsx   # Full seller panel + embedded chat
    │   │   ├── AdminDashboard.jsx    # User management panel
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── ForgotPasswordPage.jsx
    │   │   └── ResetPasswordPage.jsx
    │   └── services/
    │       ├── api.js                # Axios service for all REST endpoints
    │       └── messageService.js     # ChatClient (WebSocket) + message API
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 📋 Prerequisites

| Tool | Version | Download |
|---|---|---|
| **Java JDK** | 17 or higher | [adoptium.net](https://adoptium.net/) |
| **Apache Maven** | 3.8+ (or use included `mvnw`) | [maven.apache.org](https://maven.apache.org/) |
| **Node.js** | v18 or higher | [nodejs.org](https://nodejs.org/) |
| **MySQL** | 8.0, running on port `3306` | [mysql.com](https://www.mysql.com/) |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) |

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/shopease.git
cd shopease
```

---

### 2. Configure the Backend

Open `backend/src/main/resources/application.properties` and update with your own credentials:

```properties
# MySQL — update with your local MySQL credentials
spring.datasource.url=jdbc:mysql://localhost:3306/shopease_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD

# Razorpay — get your keys at https://dashboard.razorpay.com/app/keys
razorpay.key.id=rzp_test_YOUR_RAZORPAY_KEY_ID
razorpay.key.secret=YOUR_RAZORPAY_KEY_SECRET

# Google Gemini AI — get your key at https://aistudio.google.com/apikey
gemini.api.key=YOUR_GEMINI_API_KEY

# Gmail SMTP — use an App Password (not your account password)
spring.mail.username=your-email@gmail.com
spring.mail.password=YOUR_GMAIL_APP_PASSWORD

# Frontend URL — update if your Vite dev server runs on a different port
app.frontend.url=http://localhost:5173
```

> **Tip:** To generate a Gmail App Password, go to Google Account → Security → 2-Step Verification → App Passwords.

---

### 3. Database Setup (MySQL)

Open your **MySQL Workbench**, **MySQL Shell**, or any MySQL client and run the following commands:

#### 3a. Create the Database

```sql
-- Create the database (Hibernate will also auto-create it on first run,
-- but running this manually ensures it exists before startup)
CREATE DATABASE IF NOT EXISTS shopease_db;

-- Verify it was created
SHOW DATABASES;

-- Select the database
USE shopease_db;
```

> **Note:** The JDBC connection URL already contains `createDatabaseIfNotExist=true`, so the database will also be auto-created when the backend starts for the first time.

#### 3b. Seed the Admin Account (after first backend startup)

> ⚠️ **Important:** Run this SQL **only after the backend has started at least once** — Hibernate needs to auto-create the `users` table first.

Admin accounts **cannot be created via the registration form** — they must be inserted directly into the database:

```sql
USE shopease_db;

-- Insert an Admin account
-- Default password: admin123  (BCrypt hashed)
INSERT INTO users (name, email, password, role, phone, created_at)
VALUES (
  'Admin',
  'admin@shopease.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LnGPwbO.Wdm',
  'ADMIN',
  '9999999999',
  NOW()
);
```

| Field | Value |
|---|---|
| **Email** | `admin@shopease.com` |
| **Password** | `admin123` |
| **Role** | `ADMIN` |

> 🔒 **Security tip:** Change the admin password immediately after your first login.

#### 3c. Quick Summary — What Needs SQL vs. What's Automatic

| Task | SQL Required? |
|---|---|
| Create the `shopease_db` database | ✅ Optional (auto-created by Hibernate) |
| Create all tables | ❌ Auto-created by Hibernate on startup |
| Seed Admin user | ✅ Manual `INSERT` required (after first run) |
| Add products / categories | ❌ Use the Seller Dashboard UI |

---

### 4. Run the Backend

```bash
cd backend
./mvnw spring-boot:run
```

- Backend starts on **http://localhost:8081**
- MySQL database `shopease_db` is **auto-created** on first run
- All tables are created/updated automatically via Hibernate

> **Windows users:** Use `mvnw.cmd spring-boot:run` if `./mvnw` does not work.

---

### 5. Run the Frontend

Open a **new terminal** and run:

```bash
cd frontend
npm install
npm run dev
```

- Frontend starts on **http://localhost:5173** (default Vite port)
- Open your browser and navigate to **http://localhost:5173**

---

## 🔑 Environment Variables

All sensitive configuration lives in `backend/src/main/resources/application.properties`. **Never commit this file with real credentials** — use environment variable substitution for production.

| Property | Description |
|---|---|
| `spring.datasource.password` | Your local MySQL root password |
| `razorpay.key.id` | Razorpay Key ID (starts with `rzp_`) |
| `razorpay.key.secret` | Razorpay Key Secret |
| `gemini.api.key` | Google Gemini API key |
| `spring.mail.username` | Gmail address used for sending emails |
| `spring.mail.password` | Gmail App Password (16-character app-specific) |
| `app.jwt.secret` | Secret string used to sign JWT tokens |
| `app.frontend.url` | Base URL of your frontend (for CORS & email links) |

---

## 👥 Available Roles

| Role | How to Register |
|---|---|
| **Consumer (Buyer)** | Select "Shop (Consumer)" during registration |
| **Seller** | Select "Sell (Seller)" — GST Number and Store Name are required |
| **Admin** | Admin accounts must be created directly in the database or seeded on first run |

---

## 🌐 API Overview

The backend REST API is served at `http://localhost:8081/api`.

| Endpoint Prefix | Description |
|---|---|
| `/api/auth/**` | Registration, login, JWT, forgot/reset password |
| `/api/products/**` | Product CRUD (sellers), public listing, search, related, top-rated |
| `/api/categories/**` | Fetch all product categories |
| `/api/orders/**` | Place orders, view history, update status (seller), tracking |
| `/api/cart/**` | Add / remove / update cart items |
| `/api/wishlist/**` | Add / remove wishlist items |
| `/api/reviews/**` | Submit and fetch product reviews |
| `/api/messages/**` | REST chat endpoints (send, conversation, contacts, unread count, mark read) |
| `/ws/**` | WebSocket endpoint (STOMP) for real-time message delivery |
| `/api/admin/**` | Admin-only user management (list all, delete user) |
| `/api/payment/**` | Razorpay order creation & payment verification |
| `/api/recommendations/**` | Gemini AI product recommendations (authenticated + public) |

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📬 Contact & Support

For queries, issues, or feedback: **shopeaseshoppingapp@gmail.com**

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

*Built with ❤️ using React & Spring Boot — Happy Shopping with ShopEase!*
