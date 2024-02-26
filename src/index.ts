import dotenv from "dotenv";
import connectDB from "./db";
import { app } from "./app";

dotenv.config({ path: "./.env" });

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8080, () =>
      console.log(`server is running at port ${process.env.PORT}`)
    );
  })
  .catch((error) => console.log("failed to connect to database", error));
