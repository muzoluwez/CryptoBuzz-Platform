# Cripto Buzz Admin Dashboard

![Cripto Buzz Admin](https://placehold.co/1200x400?text=CriptoBuzz+Admin+Panel)

> A robust, production-ready admin dashboard for the Cripto Buzz platform, built with React, Vite, and a modern tech stack. This application manages users, educators, community feeds, and platform settings with a sleek, responsive interface.

## 🚀 Overview

Cripto Buzz Admin is the command center for the Cripto Buzz educational platform. It provides administrators with powerful tools to oversee platform operations, manage content, and interact with the user community. Designed for performance and scalability, it leverages the latest web technologies to deliver a seamless experience.

## ✨ Key Features

*   **📊 Interactive Dashboard**: Real-time visualization of platform statistics, user growth, and earnings.
*   **👥 User Management**: Comprehensive CRUD operations for students, educators, and admins.
*   **🎓 Educator Platform**: Tools for educators to manage courses, live sessions, and recordings.
*   **📱 Community Feed (Social Buzz)**: A full-featured social feed for admins to post updates, images, and videos, mimicking the educator experience.
*   **🔐 Secure Authentication**: Robust JWT-based authentication system with auto-logout and seamless redirection.
*   **🌍 Internationalization**: Multi-language support using `react-intl`.
*   **🎨 Dynamic Theming**: Light/Dark mode support powered by Tailwind CSS and custom settings.
*   **📱 Fully Responsive**: Optimized for desktops, tablets, and mobile devices.

## 🛠️ Technology Stack

**Core Framework**
*   **React 18** - UI Library
*   **Vite 5** - Next Generation Frontend Tooling
*   **Javascript (ES6+)** - Programming Language

**State Management & Data**
*   **Redux Toolkit** - Global State Management
*   **React Query (TanStack)** - Server State & Data Fetching
*   **Axios** - HTTP Client

**Styling & UI**
*   **Tailwind CSS** - Utility-first CSS Framework
*   **Radix UI** - Headless UI Primitives
*   **Material UI (MUI)** - UI Components
*   **KeenIcons** - Custom Icon Set
*   **Lucide React** - Iconography

**Forms & Validation**
*   **React Hook Form** - Performant Forms
*   **Yup / Zod** - Schema Validation

**Tools & Charts**
*   **ApexCharts / Recharts** - Data Visualization
*   **React Quill** - Rich Text Editor
*   **React Player** - Video Playback
*   **React Infinite Scroll** - Pagination handling

## ⚙️ Prerequisites

Ensure you have the following installed on your machine:
*   **Node.js**: >= 20.x
*   **npm**: >= 10.x

## 📦 Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-org/CriptoBuzz-admin.git
    cd CriptoBuzz-admin
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Environment Configuration**
    Copy the example environment file:
    ```bash
    cp .env.example .env
    ```
    Update `.env` with your local configuration:
    ```env
    VITE_API_URL=http://localhost:3000/api
    VITE_NODE_ENV=development
    ```

## 🚀 Running the Application

**Development Server**
Start the dev server with hot reload:
```bash
npm run dev
```
Access the app at `http://localhost:5173`.

**Production Build**
Create an optimized production build:
```bash
npm run build
```

**Preview Production Build**
Preview the built application locally:
```bash
npm run preview
```

## 📂 Project Structure

Verified and organized folder structure for scalability:

```
src/
├── auth/            # Authentication logic (JWT, Interceptors)
├── components/      # Reusable UI components (Buttons, Modals, etc.)
├── config/          # App-wide configuration (Menus, Theme)
├── i18n/            # Internationalization setup
├── layouts/         # Page layouts (Sidebar, Header)
├── pages/           # Application views/routes
│   ├── admin/       # Admin-specific pages (Social Buzz, Recordings)
│   ├── dashboards/  # Dashboard widgets and stats
│   └── public-profile/
├── partials/        # Layout fragments (Dropdowns, Menus)
├── providers/       # Context Providers (Theme, Auth, Settings)
├── routing/         # Router setup and navigation guards
├── store/           # Redux slices and store configuration
├── styles/          # Global styles and Tailwind setup
└── utils/           # Helper functions
```

## 🔑 Authentication Flow

The application uses a custom JWT (JSON Web Token) authentication provider (`JWTProvider.jsx`).
1.  **Login**: User credentials are sent to the backend.
2.  **Token Storage**: On success, the access token is stored in memory/Redux.
3.  **Interceptors**: Axios interceptors attach the token to every outgoing request.
4.  **Auto-Logout**: If the token expires (401 response), the user is automatically logged out and redirected to the login page via `useNavigate`.

## 🤝 Contributing

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'Add some amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
*Generated for Cripto Buzz Technologies LLP*
