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

        console.log("This is ther user = " , user)

        // Sanitize user data (exclude sensitive fields)
        const sanitizedUser = {
            email: user.email,
            domain: user.domain,
            role: user.role,
            fullName: user.fullName,
            sipUsername: user.sipUsername,
            sipPassword: user.sipPassword,
            secureWebSocketServer: user.secureWebSocketServer,
            webSocketPort: user.webSocketPort,
            webSocketPath: user.webSocketPath,
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


// routes/admin.js
router.put('/admin/toggle-ban/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        user.status = user.status === 'active' ? 'banned' : 'active';
        await user.save();
        res.json({ message: `User ${user.status} successfully` });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/admin/update-password/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        user.password = req.body.newPassword;
        await user.save();
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
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
