import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    lowercase: true,
    required: true,
    trim: true,
    unique: [true, "Project name must be unique"],
  },

  description: {
    type: String,
    default: "",
    trim: true,
  },

  users: [
    {
      type: mongoose.Schema.Types.ObjectId, // user id from user model
      ref: "user", // reference to user model
    },
  ],
  fileTree: {
    type: Object,
    default: {},
  },
  messages: [
    {
      sender: {
        type: mongoose.Schema.Types.Mixed, // Can be ObjectId or String for AI
        required: true,
      },
      message: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const Project = mongoose.model("project", projectSchema);

export default Project;
