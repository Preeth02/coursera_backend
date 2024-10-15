import mongoose, { Schema } from "mongoose";

const folderSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    videoID: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    courseID: {
      type: Schema.Types.ObjectId,
      ref: "Course",
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

export const Folder = mongoose.model("Folder", folderSchema);
