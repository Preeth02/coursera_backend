import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Admin } from "../schema/adminSchema.js";
import mongoose from "mongoose";

const generateRefreshandAccessToken = async (AdminId) => {
  const admin = await Admin.findById(AdminId);
  const accessToken = admin.generateAccessToken();
  const refreshToken = admin.generateRefreshToken();

  admin.refreshToken = refreshToken;
  await admin.save({
    validateBeforeSave: false,
  });
  return { accessToken, refreshToken };
};

const registerAdmin = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;

  //   if (!(userName || email || password)) {
  //     throw new ApiError(401, "All fields are required");
  //   }
  if ([userName, email, password].some((fields) => fields?.trim === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const AdminExisted = await Admin.findOne({
    email,
  });
  if (AdminExisted) {
    throw new ApiError(409, "Email already exists");
  }

  const admin = await Admin.create({
    email,
    userName,
    password,
  });

  const createdAdmin = await Admin.findById(admin._id).select(
    "-password -refreshToken"
  );

  if (!createdAdmin) {
    throw new ApiError(500, "Something went wrong while registering the Admin");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, "Admin created successfully"));
});

const loginAdmin = asyncHandler(async (req, res) => {
  const { email, userName, password } = req.body;
  if (!(userName || email)) {
    throw new ApiError(400, "Email or userName is required");
  }
  const admin = await Admin.findOne({
    $or: [{ email }, { userName }],
  });

  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }
  const isPassword = await admin.isPasswordCorrect(password);

  if (!isPassword) {
    throw new ApiError(401, "Invalid Password");
  }

  const { accessToken, refreshToken } = await generateRefreshandAccessToken(
    admin._id
  );

  const loggedInAdmin = await Admin.findById(admin._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { loggedInAdmin, accessToken, refreshToken },
        "Admin logged in successfully"
      )
    );
});

const logoutAdmin = asyncHandler(async (req, res) => {
  await Admin.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "Admin logged out"));
});

const getCurrentAdmin = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(200, req.user, "Current Admin fetched successfully")
    );
});

// const getAdminPurchases = asyncHandler(async (req, res) => {
//   const Admin = await Admin.aggregate([
//     {
//       $lookup: {
//         from: "purchases",
//         localField: "_id",
//         foreignField: "AdminId",
//         as: "isAdmin",
//         pipeline: [
//           {
//             $match: {
//               _id: new mongoose.Types.ObjectId(req.Admin._id),
//             },
//           },
//         ],
//       },
//     },
//   ]);
// });

//Add ZOD validation

export { registerAdmin, loginAdmin, logoutAdmin, getCurrentAdmin };
