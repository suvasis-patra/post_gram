import mongoose from "mongoose";
import { DB_NAME } from "../constants";

async function connectDB() {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}/${DB_NAME}`
    );
    console.log(
      "Db connection request is send",
      connectionInstance.connection.host
    );
  } catch (error) {
    console.log("something went wrong while connectiong to db", error);
  }
}

export default connectDB;
