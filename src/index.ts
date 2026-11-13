import app from "./app.js";
import { squelizer } from "./config/db.js";
import { firebaseDB } from "./config/firebase.js";

const PORT = process.env.PORT||8000

const startServer = async (): Promise<void> => {
  try {
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
