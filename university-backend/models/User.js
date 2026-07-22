const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
        },

        role: {
            type: String,
            required: [true, "Role is required"],
            enum: ["admin", "teacher", "student"],
        },

        phone: {
            type: String,
            trim: true,
            default: "",
        },

        photo: {
            type: String,
            default: "",
        },

        department: {
            type: String,
            trim: true,
            default: "",
        },
        rollNumber: {
            type: String,
            trim: true,
            default: ""
        },
        registrationNumber: {
            type: String,
            trim: true,
            default: ""
        },
        semester: {
            type: String,
            trim: true,
            default: ""
        },
    },
    {
        timestamps: true,
    }
);

// Password save karne se pehle hash karo
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 12);
});

// Login ke waqt password check karne ka method
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);