import "dotenv/config";
import app from "./src/app.js";
import Database from "./src/configs/dbconfig.js";
import Booth from "./src/models/boothmodel.js";
import Notification from "./src/models/notificationmodel.js";
import ExhibitorFile from "./src/models/exhibitorfilemodel.js";
import Message from "./src/models/messagemodel.js";
import { startSessionReminders } from "./src/services/sessionreminders.js";
const port = Number(process.env.PORT || 3000);

async function startServer() {
  try {
    await Database();

    await Promise.all([
      Booth.init(),
      Notification.init(),
      ExhibitorFile.init(),
      Message.init(),
    ]);

    const server = app.listen(port, () => {
      console.log(`http://localhost:${port}`);
      startSessionReminders();
    });

    server.on("error", (error) => {
      console.error("Server could not start:", error.code);
      process.exit(1);
    });
  } catch (error) {
    if (["MongooseServerSelectionError", "MongoServerSelectionError", "MongoNetworkError"].includes(error.name)) {
      console.error("MongoDB is temporarily unreachable. Retrying backend startup in 5 seconds.");
      setTimeout(startServer, 5000);
      return;
    }
    console.error("Backend startup failed:", error.name);
    process.exit(1);
  }
}

startServer();
