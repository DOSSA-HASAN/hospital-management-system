import { User } from "../models/user.model.js"
import bcrypt from "bcryptjs"
import { generateAccessToken } from "../lib/generateToken.js"
import { generateRefreshToken } from "../lib/generateRefreshToken.js"

export const registerUser = async (req, res) => {
    const { fullName, email, phone, password, role, createdBy } = req.body
    const { code } = req.user
    if(!code){
        return res.status(100).json({message: "No hospital code found from req.body"})
    }
    try {
        const userExists = await User.findOne({
            $or: [
                { email: email },
                { phone: phone }
            ]
        })
        if (userExists)
            return res.status(409).json({ message: "User with credentials already exists" })
        const saltRounds = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, saltRounds)
        const user = await User.create({
            fullName,
            email,
            phone,
            password: hashedPassword,
            role,
            hospitalCode: code,
            createdBy
        })
        // TODO: send email to user.email
        // Log activity
        return res.status(201).json({ message: "Account created successfully" })
    } catch (error) {
        console.log(`Error: ${error.message}`)
        return res.status(500).json({ message: error.message })
    }
}

export const login = async (req, res) => {
    const { credential, password } = req.body
    try {
        if (!credential || !password)
            return res.status(400).json({ message: "Missing required fields" })
        // Check for exisitng user with the credential
        const user = await User.findOne({
            $or: [
                { email: credential },
                { phone: credential }
            ]
        })

        if (!user)
            return res.status(404).json({ message: "User not found" })

        const isPasswordMatch = await bcrypt.compare(password, user.password)
        if (!isPasswordMatch)
            return res.status(403).json({ message: "Invalid credentials" })
        userObj = user.toObject()
        const { password: _, ...userWithoutPassword } = userObj
        // if password is okay & user exists
        // store in localstorage (sent as json response)
        const token = generateAccessToken(user._id, user.email, user.role, user.hospitalCode)
        // to be sent as cookie
        const refreshToken = generateRefreshToken(user._id, user.email, user.role)
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        return res.status(200).json({ user: userWithoutPassword, token: token })
    } catch (error) {
        console.log(`ERROR: ${error.message}`)
        return res.status(500).json({ message: error.message })
    }
}

export const logout = (req, res) => {
    try {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: '7 * 24 * 60 * 60 * 1000'
        })
        return res.status(200).json({ message: "User logged out" })
    } catch (error) {
        console.log(`ERROR: ${error.message}`)
        return res.status(500).json({ message: error.message })
    }
}

export const getAllUsers = async (req, res) => {
    const { code } = req.body
    try {
        if (!code)
            return res.status(400).json({ message: "Missing required field: hospital code" })
        const users = await User.find({ code: code }).select("-password")
        if (users.length <= 0)
            return res.status(400).json({ message: `No users registered` })
        return res.status(200).json(users)
    } catch (error) {
        console.log(`ERROR: ${error.message}`)
        return res.status(500).json({ message: error.message })
    }
}

export const getUserById = async (req, res) => {
    const { id } = req.params
    const { code } = req.user
    try {
        if (!id)
            return res.status(400).json({ message: "Missing user ID" })
        const user = await User.findOne({ _id: id, code: code }).select("-password")
        if (!user)
            return res.status(400).json({ message: "User with specified Id not found" })
        return res.status(200).json(user)
    } catch (error) {
        console.log(`ERROR: ${error.message}`)
        return res.status(500).json({ message: error.message })
    }
}

export const updateUser = async (req, res) => {
    const { id } = req.params
    const { code } = req.user
    try {
        if (!id)
            return res.status(400).json({ message: "Missing required field: User ID" })
        const user = await User.findOne({ _id: id, code: code })
        if (!user)
            return res.status(400).json({ message: "User with specified ID was not found" })
        const updateData = []
        const allowedFields = ["fullName", "email", "phone", "password", "role", "isActive", "isActive"]
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body.field
            }
        })
        const updatedUser = await User.findByIdAndUpdate({ id, updateData, new: true, runValidators: true }).select("-password")
        return res.status(200).json(updatedUser)
    } catch (error) {
        console.log(`ERROR: ${error.message}`)
        return res.status(500).json({ message: error.message })
    }
}

export const deleteUser = async (req, res) => {
    const { id } = req.params
    const { code } = req.user
    try {
        const user = await User.findOneAndDelete({ _id: id, code: code })
        if (!user)
            return res.status(400).json({ message: "No user found with specified ID" })
        return res.status(200).json({ message: "User deleted" })
    } catch (error) {
        console.log(`ERROR: ${error.message}`)
        return res.status(500).json({ message: error.message })
    }
}

