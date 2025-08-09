import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minLength: [6, "Email must be at least 6 characters long"],
    maxLength: [50, "Email must not be longer than 50 characters"],
  },

  password: {
    type: String,
    select: false,
  },

  name: {
    type: String,
    trim: true,
    maxLength: [50, "Name must not be longer than 50 characters"],
  },

  role: {
    type: String,
    trim: true,
    maxLength: [50, "Role must not be longer than 50 characters"],
    default: "Developer",
  },

  phone: {
    type: String,
    trim: true,
    maxLength: [15, "Phone number must not be longer than 15 characters"],
  },

  bio: {
    type: String,
    trim: true,
    maxLength: [200, "Bio must not be longer than 200 characters"],
  },

  skills: [{
    type: String,
    trim: true,
  }],

  avatar: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

userSchema.statics.hashPassword = async function (password) {
  return await bcrypt.hash(password, 10);
};

userSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateJWT = function () {
  return jwt.sign({ 
    email: this.email, 
    _id: this._id 
  }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
};

const User = mongoose.model("user", userSchema);

export default User;
