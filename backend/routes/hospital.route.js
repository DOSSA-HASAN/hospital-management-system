import express from "express"
import { validateHospitalRegistration } from "../validators/hospital.validator.js"
import { validateRequest } from "../middleware/validateRequest.js"
import { blockHospitalAccount, getHospitalByCode, getHospitals, registerHospital } from "../controllers/hospital.controller.js"
import { authorizedRoles } from "../middleware/authorizedRoles.js"
import { verifyUser } from "../middleware/verify.js"

const router = express.Router()
router.post('/register', validateHospitalRegistration, validateRequest, registerHospital)
router.get('/get-hospitals', verifyUser, authorizedRoles("developer"), getHospitals)
router.get('/get-hospital', verifyUser, authorizedRoles("developer"), getHospitalByCode)
router.post('/block-hospital-account', verifyUser, authorizedRoles("developer"), blockHospitalAccount)

export default router