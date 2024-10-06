import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { Purchase } from "../schema/purchasesSchema";

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
