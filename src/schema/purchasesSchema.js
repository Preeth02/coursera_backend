import mongoose, { Schema } from "mongoose";
const purchaseSchema = new Schema(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const Purchase = mongoose.model("Purchase", purchaseSchema);
