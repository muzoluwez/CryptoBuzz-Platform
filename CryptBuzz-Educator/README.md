# CryptoBuzz Educator Platform

The **CryptoBuzz Educator Platform** is a specialized web application designed for educators to manage their content, interact with students, and provide trading insights. Built with modern web technologies, it offers a seamless experience for live streaming, course management, trade analysis, and community engagement.

## 🚀 Key Features

*   **Live Streaming:** High-quality live sessions with integrated chat and recording capabilities (powered by Stream SDK).
*   **Trade Ideas:** Create, manage, and share trade ideas with detailed entry/exit points and analysis.
*   **Course Management:** Comprehensive tools to create, edit, and organize educational courses and modules.
*   **Trade Analysis:** In-depth tools for analyzing trade performance and market trends.
*   **Community Feed:** Interactive social feed for educators to post updates and engage with their audience.
*   **Educator Profile:** Customizable profile management with portfolio and performance tracking.
*   **Responsive Design:** Fully responsive interface optimization for desktop, tablet, and mobile devices.

## 🛠️ Technology Stack

*   **Frontend Framework:** React.js (v18+)
*   **Build Tool:** Vite (for fast HMR and optimized builds)
*   **Language:** JavaScript (ES6+)
*   **State Management:** Redux Toolkit & RTK Query (efficient API caching and global state)
*   **Styling:** Tailwind CSS (utility-first styling) & Custom Design System
*   **Routing:** React Router DOM (v6)
*   **Streaming & Chat:** Stream.io SDK
*   **Form Handling:** Formik & Yup
*   **UI Components:** Custom component library (KeenIcons, Lucide React, etc.)
*   **HTTP Client:** Axios

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js:** v18.0.0 or higher (v20+ recommended)
*   **npm:** v9.0.0 or higher

## ⚙️ Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/QuirkBees-Technologies-LLP/CryptoBuzz-Platform.git
    cd CryptBuzz-Educator
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    npm ci  # for clean install based on lockfile
    ```

3.  **Environment Configuration:**
    Create a `.env` file in the root directory based on `.env.example`. Required variables include:
    ```env
    VITE_APP_API_URL=https://api.yourdomain.com/v1
    VITE_APP_STREAM_KEY=your_stream_api_key
    VITE_APP_CRM_API_KEY=your_crm_key
    ```

4.  **Start Development Server:**
    ```bash
    npm run dev
    ```
    The application will launch at `http://localhost:5173`.

## 🏗️ Project Structure

```text
src/
├── auth/               # Authentication logic & providers (JWT, etc.)
├── components/         # Reusable UI components (Buttons, Inputs, Modals)
├── config/             # App-wide configurations (Menu, Theme)
├── layouts/            # Page layouts (Demo1, Sidebar, Headers)
├── pages/              # Page components (routed views)
│   ├── educator/       # specific Educator modules (Trade Ideas, Courses, etc.)
│   └── ...
├── providers/          # React Context Providers (Theme, Settings, etc.)
├── routing/            # Router setup and route definitions
├── shared/             # Shared utilities and components specific to business logic
├── store/              # Redux Store setup
│   ├── api/            # RTK Query API slices
│   └── reducer/        # Redux slices
└── utils/              # Helper functions and utilities
```

## 📦 Build & Deployment

To build the project for production:

1.  **Run the build command:**
    ```bash
    npm run build
    ```
    This generates a `dist` folder with optimized static assets.

2.  **Preview locally:**
    ```bash
    npm run preview
    ```

3.  **Deployment:**
    The content of the `dist` folder can be deployed to any static hosting service (Vercel, Netlify, AWS S3, Nginx).

## 🧪 Quality Assurance

*   **Linting:** `npm run lint` - Checks for code quality issues.
*   **Formatting:** Prettier is configured for consistent code style.

## 🤝 Contributing

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📄 License

This project is proprietary software of **QuirkBees Technologies LLP**. All rights reserved.
