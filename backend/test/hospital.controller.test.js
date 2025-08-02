import mongoose from "mongoose"
import request from "supertest"
import { Hospital } from "../models/hospital.model.js"
import { app } from "../server.js"
import { ConnectDB } from "../lib/dbConnetion.js"
import jwt from "jsonwebtoken"
beforeAll(async () => {
    await ConnectDB()
}, 20000)
afterEach(async () => {
    await Hospital.deleteMany({})
}, 20000)
afterAll(async () => {
    await mongoose.connection.close()
}, 20000)

describe("Hospital controller", () => {
    it("Should register a new hospital", async () => {
        const res = await request(app)
            .post("/api/hospital/register")
            .send({
                name: "General Hospital",
                code: "genhosp01",
                location: "Kenya",
                legalIdNumber: "MOH-001122",
                contactEmail: "info@genhosp.com",
                phone: "+254700123456",
            })
        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty("message", "Hospital registered successfully")
    })
    it("Should not register a hospital with a duplicate LegalIdNumber", async () => {
        await request(app)
            .post("/api/hospital/register")
            .send({
                name: "General Hospital",
                code: "genhosp01",
                location: "Kenya",
                legalIdNumber: "MOH-001122",
                contactEmail: "info@genhosp.com",
                phone: "+254700123456"
            })

        const res = await request(app)
            .post("/api/hospital/register")
            .send({
                name: "General Hospital",
                code: "genhosp01",
                location: "Kenya",
                legalIdNumber: "MOH-001122",
                contactEmail: "info@genhosp.com",
                phone: "+254700123456"
            })
        expect(res.statusCode).toBe(409)
        expect(res.body).toHaveProperty("message", "Hospital with Legal Id Number already exists.")
    })
    it("Should return all registered hospitals", async () => {
        // Register some hospitals first
        await request(app)
            .post("/api/hospital/register")
            .send({
                name: "General Hospital",
                code: "genhosp01",
                location: "Kenya",
                legalIdNumber: "MOH-001122",
                contactEmail: "info@genhosp.com",
                phone: "+254700123456"
            })

        await request(app)
            .post("/api/hospital/register")
            .send({
                name: "St. Mary’s Hospital",
                code: "stmaryshosp02",
                location: "Kenya",
                legalIdNumber: "MOH-009988",
                contactEmail: "contact@stmarys.com",
                phone: "+254711334455"
            })

        const token = jwt.sign(
            {
                _id: "12345",
                email: "trial@gmail.com",
                role: "developer"
            },
            process.env.ACCESS_SECRET,
            { expiresIn: '15m' }
        )

        const res = await request(app)
            .get("/api/hospital/get-hospitals")
            .set("Authorization", `Bearer ${token}`)
        expect(res.body).toHaveLength(2)
        expect(res.statusCode).toBe(200)
    })
    it("Should block a hospital account", async () => {
        //register a hospital
        await request(app)
            .post("/api/hospital/register")
            .send({
                name: "General Hospital",
                code: "genhosp01",
                location: "Kenya",
                legalIdNumber: "MOH-001122",
                contactEmail: "info@genhosp.com",
                phone: "+254700123456"
            })
        //block it with the code
        const token = jwt.sign(
            { _id: "12345", email: "trial@gmail.com", role: "developer" },
            process.env.ACCESS_SECRET,
            { expiresIn: '15m'}
        )
        const res = await request(app)
            .post("/api/hospital/block-hospital-account")
            .set("Authorization", `Bearer ${token}`)
            .send({
                code: "genhosp01"
            })
            expect(res.statusCode).toBe(200)
            expect(res.body).toHaveProperty("message", `General Hospital has been blocked from using the application`)
    })
})