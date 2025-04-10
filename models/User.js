// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    domain: { 
        type: String 
    },
    sipUsername: { 
        type: String 
    },
    sipPassword: { 
        type: String 
    },
    secureWebSocketServer: { 
        type: String 
    },
    webSocketPort: { 
        type: Number 
    },
    webSocketPath: { 
        type: String 
    },
    banned: { 
        type: Boolean, 
        default: false 
    },
    role: { 
        type: String, 
        enum: ["user", "admin"], 
        default: "user" 
    },
    fullName: { 
        type: String, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ["active", "banned"], 
        default: "active" 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model("User", userSchema);
