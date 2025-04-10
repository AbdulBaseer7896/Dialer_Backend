require("dotenv").config();

const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

app.use(cors({
    origin:  "http://127.0.0.1:5501", // default for Vite/React
    credentials: true,
}));

// Sessions
app.use(session({
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        httpOnly: true,
        sameSite: 'lax'
    }
}));

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Routes
app.use("/api", authRoutes);
app.use("/api", adminRoutes);
// Static files (optional)
app.use(express.static(path.join(__dirname, "public")));

// Server
app.listen(port, () => {
    console.log(`✅ Backend server running at http://localhost:${port}`);
});
