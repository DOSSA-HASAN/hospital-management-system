import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import "dotenv/config"
import hospitalRouter from "./routes/hospital.route.js"
import { ConnectDB } from "./lib/dbConnetion.js"
// ConnectDB()
export const app = express()
app.use(express.json())
app.use(cookieParser()) 
app.use(cors({
    origin: "*",
    credentials: true
}))
app.use("/api/hospital", hospitalRouter)
const PORT = process.env.PORT
// app.listen(PORT, () => { console.log(`Server running on port ${PORT}`)})