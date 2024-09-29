import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const courseSchema = new Schema(
  {
    courseVideos: [
      {
        type: Schema.Types.ObjectId,
        ref: "VideoContent",
      },
    ],
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    imageURL: {
      type: String,
      required: true,
    },
    creatorID: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  {
    timestamps: true,
  }
);

courseSchema.plugin(mongooseAggregatePaginate);

export const Course = mongoose.model("Course", courseSchema);
