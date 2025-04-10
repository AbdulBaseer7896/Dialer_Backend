const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Middleware to ensure only admins can access
function ensureAdmin(req, res, next) {
    console.log("Ensure admin middleware hit.");
    // Uncomment and adjust the following if you use session based auth:
    // if (req.session.user && req.session.user.role === 'admin') {
    //     return next();
    // }
    // return res.status(403).json({ success: false, message: "Access denied" });
    return next();
}


// GET /admin/users - Fetch all users
// router.get("/admin/users", ensureAdmin, async (req, res) => {
//     try {
//         const users = await User.find({});
//         return res.json(users);
//     } catch (err) {
//         console.error("Error fetching users:", err);
//         return res.status(500).json({ success: false, message: "Error fetching users" });
//     }
// });


// routes/auth.js
router.get("/user", async (req, res) => {
    if (!req.session.loggedIn) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    try {
        const user = await User.findById(req.session.userId).select('-password -__v');
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        res.json({ success: true, user });
    } catch (err) {
        console.error("Error fetching user:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});


// 1. Create new user (storing all values from the frontend)
router.post("/admin/create", ensureAdmin, async (req, res) => {
    // Destructure all expected fields from the request body
    const { 
        email, 
        password, 
        fullName, 
        domain, 
        sipUsername, 
        sipPassword, 
        secureWebSocketServer, 
        webSocketPort, 
        webSocketPath, 
        role 
    } = req.body;
    
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email already registered" });
        }

        // Create a new User document with all provided values
        const newUser = new User({
            email,
            password,
            fullName,
            domain,                    // optional
            sipUsername,               // optional
            sipPassword,               // optional
            secureWebSocketServer,     // optional
            webSocketPort,             // optional
            webSocketPath,             // optional
            role: role || "user"       // default to "user" if role not provided
        });

        await newUser.save();
        return res.json({ success: true, message: "User created successfully" });
    } catch (err) {
        console.error("Create user error:", err);
        return res.status(500).json({ success: false, message: "Error creating user" });
    }
});

// 2. Update user details (updated to include the extra fields)
router.put("/admin/update/:id", ensureAdmin, async (req, res) => {
    const { id } = req.params;
    // Destructure the fields that can be updated (adjust as needed)
    const { 
        email, 
        fullName, 
        domain, 
        sipUsername, 
        sipPassword, 
        secureWebSocketServer, 
        webSocketPort, 
        webSocketPath, 
        role 
    } = req.body;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Update fields if provided
        user.email = email || user.email;
        user.fullName = fullName || user.fullName;
        user.domain = domain || user.domain;
        user.sipUsername = sipUsername || user.sipUsername;
        user.sipPassword = sipPassword || user.sipPassword;
        user.secureWebSocketServer = secureWebSocketServer || user.secureWebSocketServer;
        user.webSocketPort = webSocketPort !== undefined ? webSocketPort : user.webSocketPort;
        user.webSocketPath = webSocketPath || user.webSocketPath;
        user.role = role || user.role;

        await user.save();
        return res.json({ success: true, message: "User updated successfully" });
    } catch (err) {
        console.error("Update user error:", err);
        return res.status(500).json({ success: false, message: "Error updating user" });
    }
});

// 3. Ban user
router.put("/admin/ban/:id", ensureAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.banned = true; // Set banned flag
        user.status = "banned";
        await user.save();
        return res.json({ success: true, message: "User banned successfully" });
    } catch (err) {
        console.error("Ban user error:", err);
        return res.status(500).json({ success: false, message: "Error banning user" });
    }
});

// 4. Delete user
router.delete("/admin/delete/:id", ensureAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        await user.remove();
        return res.json({ success: true, message: "User deleted successfully" });
    } catch (err) {
        console.error("Delete user error:", err);
        return res.status(500).json({ success: false, message: "Error deleting user" });
    }
});

module.exports = router;
