import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_DB_URL}/${process.env.DB_NAME}`
    );
    if (connectionInstance) {
      console.log("Connected successful", connectionInstance.connection.host);
    }
  } catch (error) {
    console.log("MongoDB connection error", error);
    process.exit(1);
  }
};
export default connectDB;