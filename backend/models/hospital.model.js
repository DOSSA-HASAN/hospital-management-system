import mongoose from "mongoose"
const hospitalSchema = new mongoose.Schema(
    {
        // Full hospital name
        name: { type: String, required: true },
        // Unique code used for DB name
        code: { type: String, required: true, unique: true },
        // Hospital Location
        location: { type: String, required: true },
        // Government issued registration number / license number
        legalIdNumber: { type: String, required: true, unique: true },
        // Admin or contact email
        contactEmail: { type: String, required: true, unique: true },
        // Hospital telephone / mobile number
        phone: { type: String, required: true, unique: true },
        isBlocked: { type: Boolean, default: false }
    },
    {
        timestamps: true
    }
)

export const hospital = mongoose.model("hospital", hospitalSchema)