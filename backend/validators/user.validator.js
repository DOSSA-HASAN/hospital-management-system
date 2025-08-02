import { check } from "express-validator";
export const validateUserRegistration = [

    check("fullName").notEmpty().withMessage("Fullnames are required"),

    check("email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email format"),

    check("phone")
        .notEmpty().withMessage("Phone number is required")
        .isMobilePhone().withMessage("Invalid phone number format"),

    check("password")
        .notEmpty().withMessage("Password is required")
        .isStrongPassword().withMessage("Passowrd is not strong enough"),

    check("role")
        .notEmpty().withMessage("Role is required")
        .isIn(["admin", "doctor", "nurse", "lab-tech", "receptionist"]).withMessage("Invalid role"),

    check("createdBy")
        .notEmpty().withMessage("Id of account thats creating this account is required")
        .isMongoId().withMessage("Not a valid Id"),
]

export const validateUserLogin = [
    check("credential").notEmpty().withMessage("Email or Phone is required")
        .custom(value => {
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
            const isPhone = /^[0-9]{10,15}$/.test(value)
            if (!isEmail && !isPhone)
                throw new Error("Credential must be a valid email or phone")
            return true;
        }),

    check("password").notEmpty().withMessage("Password is required")
]