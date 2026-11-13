import express from  "express"
import dotenv from "dotenv"
import errorHandle from "./middlewares/apiError.middleware.js"

dotenv.config()
const app = express()



app.use(express.json())
app.use(errorHandle)

export default app