import { consoleError } from "../lib/logErrors.js"
import { Hospital } from "../models/hospital.model.js"

// Function to register a new hospital
// TODO: send email on sucess with one admin account created for this hospital
// TODO: auto-generate the code for now it can be provided from client side
export const registerHospital = async (req, res) => {
    const { name, code, location, legalIdNumber, contactEmail, phone } = req.body
    try {
        // Check if there is a hospital registerd with the legalIdNumber
        const hospitalExists = await Hospital.findOne({
            $or: [
                { code: code },
                { legalIdNumber: legalIdNumber },
                { contactEmail: contactEmail },
                { phone: phone }
            ]
        })
        if (hospitalExists) {
            return res.status(409).json({ message: "Hospital with Legal Id Number already exists." })
        }
        const newHospital = await Hospital.create({
            name,
            code,
            location,
            legalIdNumber,
            contactEmail,
            phone
        })
        return res.status(200).json({ message: "Hospital registered successfully" })
    } catch (error) {
        console.log(`ERROR: ${error.stack}`)
        return res.status(500).json({ message: "Internal server error" })
    }

}

// **FOR DEV ONLY**
export const getHospitals = async (req, res) => {
    try {
        const hospitals = await Hospital.find()
        if (!hospitals)
            return res.status(404).json({ message: "No hospitals registered" })
        return res.status(200).json(hospitals)
    } catch (error) {
        consoleError(res, 500, error.message)
    }
}

// **FOR DEV ONLY**
export const getHospitalByCode = async (req, res) => {
    const { code } = req.body
    try {
        if (!code)
            return res.status(400).json({ message: "Hospital code is required" })
        const hospital = await Hospital.findOne({ code: code })
        if (!hospital)
            return res.status(404).json({ message: "No hospital found with specified code" })
    } catch (error) {
        consoleError(res, 500, error.message)
    }

}

// **FOR DEV ONLY**
export const blockHospitalAccount = async (req, res) => {
    const { code } = req.body
    try {
        if (!code)
            return res.status(400).json({ message: "Hospital code is required" })
        const existingHospital = await Hospital.findOne({ code: code })
        if (!existingHospital)
            return res.status(400).json({ message: `No hospital with code ${code} was found` })
        existingHospital.isBlocked = true
        await existingHospital.save()
        // TODO: send an email to the hospital saying they have been blocked
        return res.status(200).json({ message: `${existingHospital.name} has been blocked from using the application` })
    } catch (error) {
        consoleError(req, 500, error.message)
    }
}

export const updateHospitalInfo = async (req, res) => {
    const { code } = req.user
    try {
        if (!code)
            return res.status(400).json({ message: "Missing hospital code" })
        const updateData = []
        const allowedFields = ["name", "location", "contactEmail", "phone"]
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined)
                updateData[field] = req.body[field]
        })
        const updatedHospital = await Hospital.findOneAndUpdate({ code, updateData, new: true, runValidators: true })
        return res.status(200).json(updatedHospital)
    } catch (error) {
        console.log(`ERROR: ${error.message}`)
        return res.status(500).json({ message: error.message })
    }
}

// **FOR DEV ONLY**
export const updateHospitalLegalIdNumber = async (req, res) => {
    const { code, legalIdNumber } = req.body
    try {
        const hospitalExists = Hospital.findOneAndUpdate({code, legalIdNumber})
    } catch (error) {
        console.log(`ERROR: ${error.message}`)
        return res.status(500).json({ message: error.message })
    }
}