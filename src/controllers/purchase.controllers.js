import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Purchase } from "../schema/purchasesSchema.js";

const purchaseCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user._id;
  // Integrate RazorPay here.
  const alreadyPurchased = await Purchase.findById(userId);
  if (alreadyPurchased) {
    throw new ApiError(409, "You have already purchased the course");
  }

  const purchaseCourse = await Purchase.create({
    courseId,
    userId,
  });

  if (!purchaseCourse) {
    throw new ApiError(400, "Something went wrong when purchasing the course.");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        purchaseCourse,
        "Course purchased successfully!!! Thank you for purchasing the course."
      )
    );
});

export { purchaseCourse };
