import mongoose, { Schema } from "mongoose";

export default mongoose.model(
  "User",
  new Schema({
    id: Schema.ObjectId,
    displayName: String,
  })
);
