#Car Rental
This Full Stack Car Rental Booking App is a production-ready application built using the MERN stack (MongoDB, Express, React, Node.js). It features a completely animated frontend, a robust booking system with availability logic, and a comprehensive Owner Dashboard for fleet and revenue management
,
,
.
Project Overview
The platform allows users to browse luxury vehicles and book them online for specific date ranges
. It uniquely allows any user to transition into a "Car Owner" role, enabling them to list their own vehicles for rent and manage those bookings through a dedicated admin interface
,
.
Key Features
Fully Animated UI: Developed with Framer Motion (Motion package) to provide smooth entrance and scroll-reveal animations
,
.
Advanced Booking Logic: Implements a backend utility to check vehicle availability against existing bookings for specific date ranges and locations to prevent double-booking
.
Owner Dashboard: A specialized interface where owners can:
Track Monthly Revenue (calculated automatically from confirmed bookings)
,
.
Monitor stats for total cars, total bookings, and pending vs. confirmed requests
,
.
Manage fleet availability (Toggle "Available/Unavailable") and delete listings
.
Real-Time Media Optimization: Integrated with ImageKit for media processing. This ensures car images are automatically compressed, resized, and converted to modern formats like WebP to enhance performance and reduce bandwidth
,
.
Secure Authentication: Features user registration and login using JSON Web Tokens (JWT) for session management and bcrypt for password encryption
,
.
Responsive Design: Built with Tailwind CSS to ensure a seamless experience across mobile, tablet, and desktop devices
,
.
Tech Stack
Frontend: React.js, Tailwind CSS, Framer Motion, Axios, React Router
,
,
,
,
.
Backend: Node.js, Express.js
.
Database: MongoDB Atlas with Mongoose
,
.
Media Management: ImageKit API
,
.
Deployment: Vercel (Frontend & Backend)
,
.
Environment Variables Needed
To run this project, you will need to configure the following variables in your .env files:
Server:
MONGODB_URI: Your MongoDB connection string
.
JWT_SECRET: A secret key for token generation
.
IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT: Credentials from your ImageKit developer dashboard
.
Client:
VITE_BASE_URL: Your deployed backend URL
.
VITE_CURRENCY: The currency symbol (e.g., $)
