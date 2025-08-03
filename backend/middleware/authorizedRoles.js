export const authorizedRoles = (...allowedRoles) => {
    return (req, res, next) => {
        const user = req.user
        if (!user){
            console.log("NO user found in req body")
            return res.status(400).json({ message: "missing user from request body" })
        }
        if (!allowedRoles.includes(user.role)) {
            return res.status(401).json({
                success: false,
                message: "Unauthorised - you do not have access to this resource"
            })
        }
        next()
    }
}