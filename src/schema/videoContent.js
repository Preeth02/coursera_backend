import mongoose, { Schema } from "mongoose";

const videoContentSchema = new Schema(
  {
    videoURL: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    creatorID: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
    courseID: {
      type: Schema.Types.ObjectId,
      ref: "Course",
    },
    folderID:{
      type: Schema.Types.ObjectId,
      ref: "Folder",

    }
  },
  { timestamps: true }
);

export const VideoContent = mongoose.model("VideoContent", videoContentSchema);
