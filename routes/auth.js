// routes/auth.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");

// POST /api/login - login route
// router.post("/login", async (req, res) => {
//     const { email, password } = req.body;
//     try {
//         const user = await User.findOne({ email });
//         // In production, use bcrypt for password comparison
//         if (user && user.password === password) {
//             req.session.loggedIn = true;
//             req.session.user = user;
//             console.log("This is the user = " , user)
//             return res.json({ 
//                 success: true, 
//                 message: "Login successful",
//                 user: user 
//             });
//         } else {
//             return res.status(401).json({ success: false, message: "Invalid credentials" });
//         }
//     } catch (err) {
//         console.error("Login error:", err);
//         return res.status(500).json({ success: false, message: "Server error" });
//     }
// });

// routes/auth.js
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || user.password !== password) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
        if (user.banned) {
            return res.status(403).json({ success: false, message: "Account banned" });
        }

        // Sanitize user data (exclude sensitive fields)
        const sanitizedUser = {
            email: user.email,
            domain: user.domain,
            role: user.role,
            fullName: user.fullName,
            status: user.status
        };

        req.session.loggedIn = true;
        req.session.userId = user._id; // Store only user ID in session

        res.json({ 
            success: true, 
            message: "Login successful",
            user: sanitizedUser 
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});


// GET /api/logout - logout route
router.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ success: false, message: "Logout failed" });
        }
        res.json({ success: true, message: "Logged out successfully" });
    });
});

module.exports = router;
