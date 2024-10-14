import connectDB from "./db/db.js";
import app from "./app.js";
import mongoose from "mongoose";

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("Error", error);
      throw error;
    });
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at port : localhost:${process.env.PORT}`);
      mongoose.set("debug", true);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection failed!!", err);
  });
