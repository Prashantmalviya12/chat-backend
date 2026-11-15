import app from "./app.js";
import dotenv from "dotenv"
dotenv.config()


const PORT = process.env.PORT||8000

const startServer = async (): Promise<void> => {
  try {
    const { default: app } = await import("./app.js");
    const { squelizer } = await import("./config/db.js");

    console.log("db_Name",process.env.DB_NAME)
    await squelizer.authenticate();
    console.log("Databased Connected Successfully.");

    await squelizer.sync();
    console.log("Database Sync Model");

    app.listen(PORT, () => {
      console.log("Server Connected with http://localhost:",PORT);
    });
  } catch (error) {
    console.error("Application startup failed:", error);
    process.exit(1);
  }
};

void startServer()
