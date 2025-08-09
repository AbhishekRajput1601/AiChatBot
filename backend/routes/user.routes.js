import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import { body } from "express-validator";
import * as authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/register",
  body("email").isEmail().withMessage("Email must be a valid email address"),
  body("password")
    .isLength({ min: 3 })
    .withMessage("Password must be at least 3 characters long"),
  userController.createUserController
);

router.post(
  "/login",
  body("email").isEmail().withMessage("Email must be a valid email address"),
  body("password")
    .isLength({ min: 3 })
    .withMessage("Password must be at least 3 characters long"),
  userController.loginController
);

router.get(
  "/profile",
  authMiddleware.authUser,
  userController.profileController
);

router.get("/logout", authMiddleware.authUser, userController.logoutController);

router.get(
  "/all",
  authMiddleware.authUser,
  userController.getAllUsersController
);

router.put(
  "/update-profile",
  authMiddleware.authUser,
  body("name").optional().trim().isLength({ max: 50 }).withMessage("Name must not be longer than 50 characters"),
  body("role").optional().trim().isLength({ max: 50 }).withMessage("Role must not be longer than 50 characters"),
  body("phone").optional().trim().isLength({ max: 15 }).withMessage("Phone number must not be longer than 15 characters"),
  body("bio").optional().trim().isLength({ max: 200 }).withMessage("Bio must not be longer than 200 characters"),
  body("skills").optional().isArray().withMessage("Skills must be an array"),
  userController.updateProfileController
);

export default router;
