import { check } from "express-validator"
export const validateHospitalRegistration = [
    check("name").notEmpty().withMessage("Name is required").withMessage("Hospital name is required"),

    check("location").notEmpty().withMessage("Hospital location is required"),
    
    check("code")
    .notEmpty().withMessage("Code is required")
    .isAlphanumeric().withMessage("Hospital code is required & should be alphanumeric"),
    
    check("legalIdNumber").notEmpty().withMessage("Legal Id Number is required"),
    
    check("contactEmail")
    .notEmpty().withMessage("Contact email is required")
    .isEmail().withMessage("Invalid email format"),
    
    check("phone")
    .notEmpty().withMessage("Phone number is required")
    .isMobilePhone().withMessage("Invalid phone number"),
]