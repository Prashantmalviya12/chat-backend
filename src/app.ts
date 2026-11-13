import express from  "express"
import dotenv from "dotenv"
import cors from "cors";
import errorHandle from "./middlewares/apiError.middleware.js"
import chatRoutes from '../src/routes/chat.routes.js'
import messageRoutes from "../src/routes/message.route.js"
import userRoutes from "../src/routes/user.route.js"

dotenv.config()
const app = express()



app.use(express.json())
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// app.get("/health", (_req: Request, res: Response) => {
//   res.status(200).json({
//     success: true,
//     message: "Chat backend is running"
//   });
// });

app.use("/chat", chatRoutes);
app.use("/chat", messageRoutes);
app.use("/user", userRoutes);

app.use(errorHandle)

export default app