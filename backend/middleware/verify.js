import jwt from "jsonwebtoken"
import { consoleError } from "../lib/logErrors.js"
export const verifyUser = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith("Bearer "))
            return res.status(401).json({ message: "Unauthorised - Missing credentials" })
        const token = authHeader.split(" ")[1]
        const decoded = jwt.verify(token, process.env.ACCESS_SECRET)
        if (!decoded)
            return res.status(401).json({ message: "Invalid or expired token" })
        req.user = decoded
        next()
    } catch (error) {
        consoleError(res, 500, error.message)
    }
}