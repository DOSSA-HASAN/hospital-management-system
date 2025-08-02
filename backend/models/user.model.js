import mongoose from "mongoose"
const UserModel = new mongoose.Schema(
    {
        fullName: { type: String, required: true },
        email: { type: String, required: true, lowercase: true, trim: true },
        phone: { type: String, required: true },
        password: { type: String, required: true },
        role: { type: String, enum: ["admin", "doctor", "nurse", "lab-tech", "receptionist"], required: true },
        isActive: { type: Boolean, default: true },
        hospitalCode: { type: String, required: true },
        // Track who created this account by their _id
        // TODO: make this required
        createdBy: { type: mongoose.Schema.ObjectId, ref:"User"}

    },
    {
        timestamps: true
    }
)

export const User = mongoose.model("User", UserModel)