✈️ AeroServe – Airline Reservation System

AeroServe is a full-stack airline reservation system built using the MERN stack (MongoDB, Express.js, React, Node.js). It simulates real-world airline workflows including authentication, flight booking, payment processing, and administrative analytics, all wrapped in a modern animated UI.

🚀 Features
🔐 Authentication & Authorization
JWT-based login & registration
Role-Based Access Control (Admin, Agent, Passenger)
✈️ Flight Search & Booking
Search flights dynamically
Passenger-based seat allocation
Real-time pricing display
💳 Mock Payment Gateway
Simulated card transactions
Random success/failure responses
🎫 Boarding Pass Generation
PDF ticket generation using jsPDF
🌍 Interactive UI
Animated dark-themed flight map using Leaflet.js
Glassmorphism design with smooth animations
📊 Admin Dashboard
Total revenue tracking
Active flights overview
User and booking analytics
🏗️ Project Structure
AeroServe/
│
├── backend/      # Express server, APIs, models, middleware
├── frontend/     # React app (Vite + Tailwind + Framer Motion)
🗄️ Database Models
User
Flight
Reservation
Payment
WebCheckin
Cancellation
FlightStatus
⚙️ Installation & Setup
Prerequisites
Node.js (v18+)
MongoDB (running on port 27017)
🔧 Backend Setup
cd backend
npm install

# Seed admin user
node seedAdmin.js

Default Admin Credentials

Email: admin@aeroserve.com
Password: admin123
# Start backend server
node server.js

Backend runs on: http://localhost:5000

💻 Frontend Setup
cd frontend
npm install
npm run dev

Frontend runs on: http://localhost:5173

🧪 Tech Stack
Frontend: React, Vite, Tailwind CSS, Framer Motion
Backend: Node.js, Express.js
Database: MongoDB, Mongoose
Authentication: JWT
Maps: Leaflet.js
PDF Generation: jsPDF
📌 Highlights
Full-stack MERN implementation
Clean architecture (separated frontend & backend)
Realistic airline booking simulation
Modern UI with animations and interactive elements
📈 Future Improvements
Integration with real payment gateways (Stripe / Razorpay)
Email/SMS notifications
Seat selection UI
Cloud deployment (Docker, AWS, etc.)
🤝 Contributing

Contributions are welcome. Feel free to fork the repository and submit a pull request.

📄 License

This project is for educational purposes and can be freely used or modified.
