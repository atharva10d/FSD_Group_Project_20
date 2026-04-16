# Project Technology Stack

This document details the technologies used in building the full-stack Airline Reservation System (AeroServe). The project is divided into two main parts: the Frontend (Client-side) and the Backend (Server-side).

---

## 1. Frontend Technologies (Client-Side)

The frontend is what the user interacts with in their web browser. It is built to be fast, responsive, and visually appealing.

### Core Frameworks & Libraries
*   **React (v18)**: The core library used to build the user interface. It allows us to build reusable UI components and manage the state of the application efficiently.
*   **Vite**: A modern frontend build tool that is significantly faster than older tools like Create React App. It provides an extremely fast development server and optimized production builds.
*   **React Router DOM**: Used to handle navigation within the React application without reloading the entire page. It manages different "pages" like Login, Search Flights, Profile, and the Admin Dashboard.

### Styling & UI
*   **Tailwind CSS**: A utility-first CSS framework. Instead of writing custom CSS files, Tailwind allows us to rapidly style components directly within the React JSX code using predefined classes (e.g., `bg-blue-500`, `p-4`, `rounded-xl`).
*   **Framer Motion**: A powerful animation library for React. It is used to create smooth, complex, and beautiful animations and transitions between pages and elements (like the fade-in and slide-up effects on the dashboard).
*   **Lucide React**: A set of beautiful and consistent SVG icons used throughout the application (e.g., the plane, user, settings, and calendar icons).

### Utilities & HTTP Requests
*   **Axios**: A promise-based HTTP client used to make requests (GET, POST, PUT, DELETE) from the frontend to our backend API. It's used to fetch flights, submit logins, and manage reservations.
*   **jsPDF**: A library used to generate PDF documents on the client-side. In this project, it is used to allow users to generate and download their "Boarding Pass" as a PDF file.

---

## 2. Backend Technologies (Server-Side)

The backend handles the business logic, database interactions, authentication, and serves the API that the frontend communicates with.

### Core Environment
*   **Node.js**: A JavaScript runtime environment that allows us to run JavaScript on the server.
*   **Express.js**: A fast, unopinionated, minimalist web framework for Node.js. It is used to handle routing (API endpoints), handle incoming HTTP requests, and send responses back to the frontend.

### Database
*   **MongoDB**: A NoSQL document database perfectly suited for modern applications. Data is stored in flexible, JSON-like documents (e.g., user profiles, flight details, reservations).
*   **Mongoose**: An Object Data Modeling (ODM) library for MongoDB and Node.js. It provides a straightforward, schema-based solution to model the application data. It enforces structure (Schemas) on the MongoDB data and provides powerful querying tools.

### Security & Authentication
*   **JSON Web Tokens (JWT)**: Used for secure, stateless authentication. When a user logs in, the server generates a token (JWT) containing their identity and sends it to the frontend. The frontend uses this token to prove they are authenticated for subsequent requests (like booking a flight).
*   **bcryptjs**: A widely-used library for hashing passwords securely before storing them in the database. It ensures that even if the database is compromised, user passwords remain unreadable.

### Server Utilities
*   **dotenv**: A module that loads environment variables from a `.env` file into `process.env`. This keeps sensitive information (like database connection strings and secret keys) out of the main source code.
*   **CORS (Cross-Origin Resource Sharing)**: A middleware used in Express to allow our frontend application (running on one port, e.g., 5173) to securely request data from our backend application (running on a different port, e.g., 5000).

---

## How They Work Together

1.  A user accesses the frontend built with **React/Vite**.
2.  The user fills out a form (e.g., searching for flights).
3.  The frontend uses **Axios** to send an HTTP GET request to a specific endpoint on the backend.
4.  The **Express.js** backend receives the request, and based on the route, invokes a controller function.
5.  The controller function uses **Mongoose** to query the **MongoDB** database for matching flights.
6.  The database returns the data to the backend.
7.  The backend sends the flight data back to the frontend as a JSON response.
8.  The frontend receives the data and uses **React** and **Tailwind CSS** to render the available flights dynamically on the screen.
