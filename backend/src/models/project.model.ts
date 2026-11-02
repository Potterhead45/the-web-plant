import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IProject extends Document {
  title: string;
  description?: string;
  user: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
      minlength: [1, "Project title cannot be empty"],
      maxlength: [150, "Project title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Project must belong to a user"],
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

// Compound index for user queries sorted by creation date
projectSchema.index({ user: 1, createdAt: -1 });

export const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>("Project", projectSchema);
