# AeroServe - Airline Reservation System ✈️

A full-stack modern web application built with the MERN stack (MongoDB, Express, React, Node.js), featuring a stunning animated dark-theme flight map background and glassmorphism UI.

## Features Included
- **Authentication**: JWT-based login and registration with Role-Based Access Control (Admin, Agent, Passenger).
- **Flight Search & Booking**: Search for flights, select passengers (counts against available seats), and view prices.
- **Mock Payment Gateway**: Simulates credit card transactions dynamically with success/failure generation.
- **Boarding Pass**: Frontend generates a structured PDF using `jsPDF` for confirmed reservations.
- **Animated Map Background**: Uses `Leaflet.js` rendering a stunning dark terrain mapped with continually moving planes.
- **Admin Panel**: Dedicated controllers to view aggregated reports (total revenue, flights active, users, bookings).
- **Full Database Schema**: MongoDB schemas modeling `User`, `Flight`, `Reservation`, `Payment`, `WebCheckin`, `Cancellation`, `FlightStatus`.

## Project Structure
- `/backend`: Node.js Express server housing Mongoose models, auth middleware, and API routes.
- `/frontend`: Vite React App containing Tailwind CSS configurations, Framer Motion animated components, and React Router views.

## Installation & Setup

### Requirements
- **Node.js** v18+
- **MongoDB** Local Server running on port 27017

### 1. Backend Setup
```bash
cd backend
# Install dependencies (already done)
npm install

# Seed the Admin user into DB
node seedAdmin.js 
# Result: Admin Email: admin@aeroserve.com | Password: admin123

# Start the server (Runs on port 5000)
node server.js
```

### 2. Frontend Setup
```bash
cd frontend
# Install dependencies (already done)
npm install

# Start the development server (Runs on port 5173 default)
npm run dev
```

Enjoy exploring the elegant UI and exploring your high-performance routing.
