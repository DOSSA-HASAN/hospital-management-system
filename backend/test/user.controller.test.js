import mongoose from "mongoose"
import { ConnectDB } from "../lib/dbConnetion.js"
import { hospital } from "../models/hospital.model.js"
import { User } from "../models/user.model.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import request from "supertest"
import { app } from "../server.js"
import { generateAccessToken } from "../lib/generateToken.js"

let decodedRole;
let decodedCode;
let decodedId;
let token;

beforeAll(async () => {
    await ConnectDB()
}, 20000)
beforeEach(async () => {
    // Create hospital
    const newHospital = await hospital.create({
        name: "Tes Hospital",
        code: "Test001",
        location: "Kenya",
        legalIdNumber: "Test",
        contactEmail: "test@gmail.com",
        phone: "07123456789"
    })
    // Create admin under the hospital
    const admin = await User.create({
        fullName: "Admin test",
        email: "admintest@gmail.com",
        phone: "07234567891",
        password: await bcrypt.hash("Password123?", 10),
        role: "admin",
        hospitalCode: newHospital.code
    })
    // Generate token (by logging in)
    const credentials = {
        credential: "admintest@gmail.com",
        password: "Password123?"
    }

    const res = await request(app)
        .post("/api/auth/login")
        .send(credentials)
    const decoded = jwt.verify(res.body.token, process.env.ACCESS_SECRET)
    token = res.body.token
    decodedRole = decoded.role
    decodedCode = decoded.code
    decodedId = decoded._id

})
afterEach(async () => {
    await User.deleteMany()
    await hospital.deleteMany()
})
afterAll(async () => {
    await mongoose.connection.close()
})

describe("User Controller", () => {
    it("Should allow a user to login", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                credential: "admintest@gmail.com",
                password: "Password123?"
            })
        console.log(res.error.message)
        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty("token")
        expect(res.body).toHaveProperty("user")
    })
    it("It should not allow a non-existent user to login", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                credential: "wrongemail@gmail.com",
                password: "wrongpasswrod"
            })
        expect(res.statusCode).toBe(404)
        expect(res.body).toHaveProperty("message", "User not found")
    })
    it("Should allow an admin to register user", async () => {
        const res = await request(app)
            .post("/api/auth/register-user")
            .set("Authorization", `Bearer ${token}`)
            .send({
                fullName: "test user",
                email: "testuser@gmail.com",
                phone: "07456789123",
                password: "Password123?",
                role: "doctor",
                createdBy: decodedId,
                hospitalCode: decodedCode,
            })
        expect(res.statusCode).toBe(201)
        expect(res.body).toHaveProperty("message", "Account created successfully")
    })
    it("Should not allow admin to register duplicate user", async () => {
        const initial = await request(app)
            .post("/api/auth/register-user")
            .set("Authorization", `Bearer ${token}`)
            .send({
                fullName: "test user",
                email: "testuser@gmail.com",
                phone: "07456789123",
                password: "Password123?",
                role: "doctor",
                createdBy: decodedId,
                hospitalCode: decodedCode,
            })
        const res = await request(app)
            .post("/api/auth/register-user")
            .set("Authorization", `Bearer ${token}`)
            .send({
                fullName: "test user",
                email: "testuser@gmail.com",
                phone: "07456789123",
                password: "Password123?",
                role: "doctor",
                createdBy: decodedId,
                hospitalCode: decodedCode,
            })
        expect(res.statusCode).toBe(409)
        expect(res.body).toHaveProperty("message", "User with credentials already exists")
    })
    it("Should not allow a non-admin user to register a user", async () => {
        const nonAdminUser = await User.create({
            fullName: "Admin test",
            email: "admintest@gmail.com",
            phone: "07234567891",
            password: await bcrypt.hash("Password123?", 10),
            role: "doctor",
            hospitalCode: decodedCode
        })

        // Creating
        const token = generateAccessToken(nonAdminUser._id, nonAdminUser.email, nonAdminUser.role, nonAdminUser.hospitalCode)
        let decoded = jwt.verify(token, process.env.ACCESS_SECRET)
        decodedCode = decoded.code
        decodedId = decoded._id

        const res = await request(app)
            .post("/api/auth/register-user")
            .set("Authorization", `Bearer ${token}`)
            .send({
                fullName: "test user",
                email: "testuser@gmail.com",
                phone: "07456789123",
                password: "Password123?",
                role: "doctor",
                createdBy: decodedId,
                hospitalCode: decodedCode,
            })
        expect(res.statusCode).toBe(401)
        expect(res.body).toHaveProperty("message", "Unauthorised - you do not have access to this resource")
    })
})