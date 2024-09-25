import mongoose, { Mongoose, Schema } from "mongoose";

const courseSchema = new Schema(
  {
    videoURL: {
      type: String,
      required: true,
    },
    title:{
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true,
    },
    price:{
        type: Number,
        required: true,
    },
    imageURL:{
        type: String,
        required: true,   
    },
    creatorID:{
        type:Schema.Types.ObjectId,
        ref:"Admin"
    }
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", courseSchema);
