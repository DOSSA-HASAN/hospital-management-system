import express from "express"
import { authorizedRoles } from "../middleware/authorizedRoles.js"
import { deleteUser, getAllUsers, getUserById, login, logout, registerUser, updateUser } from "../controllers/user.controller.js"
import { verifyUser } from "../middleware/verify.js"
import { validateUserLogin, validateUserRegistration } from "../validators/user.validator.js"
import { validateRequest } from "../middleware/validateRequest.js"

const router = express.Router()
router.post('/register-user', verifyUser, authorizedRoles("admin"), validateUserRegistration, validateRequest, registerUser)
// router.post('/register-user', verifyUser, authorizedRoles("admin"), registerUser)
router.post('/login', validateUserLogin, validateRequest, login)
router.post('/logout', logout)
router.get('/get-all-uses', verifyUser, authorizedRoles("admin"), getAllUsers)
router.get('/get-user/:id', verifyUser, authorizedRoles("admin"), getUserById)
router.post('/update-user', verifyUser, authorizedRoles("admin", "user"), updateUser)
router.delete("/delete-user/:id", verifyUser, authorizedRoles("admin"), deleteUser)

export default router