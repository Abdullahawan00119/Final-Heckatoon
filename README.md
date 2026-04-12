# Local Services Marketplace Platform

A production-grade, full-stack marketplace for local services (plumbing, electrical, tutoring, etc.) built with the MERN stack and Socket.IO.

## 🚀 Features

- **Authentication**: Secure JWT-based auth with role-based access (Customer & Provider).
- **Marketplace**: Browse jobs and services with advanced filtering.
- **Posting**: Customers can post jobs; Providers can create service listings.
- **Real-time Chat**: Built-in messaging system for communication between users.
- **Dashboards**: Personalized dashboards for managing orders and jobs.
- **Premium UI**: Modern design using Tailwind CSS, ShadCN UI, and Framer Motion.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, ShadCN UI, Lucide Icons.
- **Backend**: Node.js, Express, MongoDB, Socket.IO.
- **Security**: JWT, Bcrypt, Helmet, Rate Limiting.
- **Storage**: Cloudinary (configuration required).

## 📦 Installation

### Backend
1. Go to `backend/` directory.
2. Run `npm install`.
3. Create a `.env` file based on the provided structure:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   CLOUDINARY_CLOUD_NAME=name
   CLOUDINARY_API_KEY=key
   CLOUDINARY_API_SECRET=secret
   ```
4. Start the server: `npm run dev` (if nodemon is installed) or `npm start`.

### Frontend
1. Go to `frontend/` directory.
2. Run `npm install`.
3. Start the dev server: `npm run dev`.

## 📸 Screenshots & Walkthrough
See the [walkthrough.md](.gemini/antigravity/artifacts/walkthrough.md) for a detailed overview of the implementation.
