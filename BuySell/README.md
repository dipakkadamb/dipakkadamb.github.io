# ASYNCRIX Global - Cloud ERP Platform

Welcome to **ASYNCRIX Global**, a high-performance, real-time Cloud ERP platform designed to streamline business operations including Sales, Purchases, Banking, and Inventory Management. Optimized for **Google Sheets** as a robust, scalable backend.

## 🌟 Key Features
- **Google Sheets Synchronization**: Full integration with Google Sheets API for seamless, transparent data persistence.
- **Admin Panel & User Management**: Dedicated interface for managing system users, roles, and administrative access.
- **Role-Based Access Control (RBAC)**: Zoho-inspired permission system with **Admin** and **Staff** roles.
- **System Reset & Mapping**: Automated initialization of the entire ERP structure in Google Sheets with one click.
- **Comprehensive Business Modules**:
  - **Sales**: Quotes, Sales Orders, Invoices, Payments Received, and Proforma Invoices.
  - **Purchases**: Vendors, Bills, Payments Made, and Vendor Credits.
  - **Banking**: Bank account management with automated balance tracking.
  - **Inventory**: Real-time stock tracking for Goods and Services.
- **Professional Reporting**: Financial summaries and Inventory status reports.
- **Smart Toast Notifications**: Immediate visual feedback for all data operations (Success/Sync Status).

## 🛠 Technical Architecture
### 1. Data Access Layer (`js/database.js` & Google Apps Script)
- **Sheet Mapping**: Intelligent module-to-tab mapping system.
- **Batch Operations**: Optimized batch saving and migration logic for high performance.
- **CRUD Operations**: Standardized `async/await` operations via custom Google Apps Script web app.

### 2. Modular Architecture (`js/` directory)
- **Lean Entry Point**: `script.js` (~150 lines) serves as a clean orchestrator.
- **Separation of Concerns**:
  - `js/ui.js`: Centralized view rendering and modal management.
  - `js/handlers.js`: Complex document processes and entity logic.
  - `js/utils.js`: Core formatting and calculation utilities.
- **RBAC**: Protected sensitive modules (Reports/Banking) from unauthorized staff access.

### 3. Premium UI/UX (`style.css`)
- **Zoho-Inspired Aesthetic**: Modern glassmorphism, high-contrast light theme, and professional typography (Inter/Outfit).
- **Responsive Layouts**: Fully mobile-optimized sidebar and data tables.
- **Interactive Feedback**: Smooth transitions and sleek toast notifications.

## 🚀 Recent Milestones
- **Transitioned to Google Sheets**: Removed Firebase dependency for better transparency and spreadsheet-native data management.
- **Implemented Admin Suite**: Added user directory and secure cloud-based authentication.
- **Enforced RBAC**: Protected sensitive modules (Reports/Banking) from unauthorized staff access.
- **Automated Infrastructure**: Built the `initializeMapping` protocol to set up the entire backend in seconds.

## 📬 Contact & Support
Developed by **Dipak Kadamb | ASYNCRIX Global Team**
*Innovating the Async Future.*
