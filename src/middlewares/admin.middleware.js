import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
// import { User } from "../schema/userSchema.js";

const verifyAdmin = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req?.cookies?.accessToken ||
      req?.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized admin");
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_ADMIN_SECRET);
    if (!decodedToken) {
      throw new ApiError(401, "Invalid Access Token");
    }
    req.user = decodedToken;
    // console.log(decodedToken)
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token");
  }
});

export default verifyAdmin;
