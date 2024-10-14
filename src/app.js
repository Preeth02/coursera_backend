import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import purchaseRoutes from "./routes/purchase.routes.js";
import courseRoutes from "./routes/course.routes.js"
const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "16kb" }));
app.use(urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.get("/", function (req, res) {
  res.json({
    message: "Health checkup",
  });
});
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/purchases", purchaseRoutes);
app.use("/api/v1/course",courseRoutes)
export default app;
