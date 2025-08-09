import { Router } from "express";
import { body } from "express-validator";
import * as projectController from "../controllers/project.controller.js";
import * as authMiddleWare from "../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/create",
  authMiddleWare.authUser,
  body("name").isString().withMessage("Name is required"),
  projectController.createProject
);

router.delete(
  "/delete/:projectId",
  authMiddleWare.authUser,
  projectController.deleteProject
);

router.get(
  "/allProjects/:userId",
  authMiddleWare.authUser,
  projectController.getAllProjectsOfUserByUserId
);

router.get("/all", authMiddleWare.authUser, projectController.getAllProject);

router.get(
  "/all-users/:projectId",
  authMiddleWare.authUser,
  projectController.getAllUsersOfProjectById
);

router.put(
  "/add-user",
  authMiddleWare.authUser,
  body("projectId").isString().withMessage("Project ID is required"),
  body("users")
    .isArray({ min: 1 })
    .withMessage("Users must be an array of strings")
    .bail()
    .custom((users) => users.every((user) => typeof user === "string"))
    .withMessage("Each user must be a string"),
  projectController.addUserToProject
);

router.put(
  "/remove-user",
  authMiddleWare.authUser,
  body("projectId").isString().withMessage("Project ID is required"),
  body("users")
    .isArray({ min: 1 })
    .withMessage("Users must be an array of strings")
    .bail()
    .custom((users) => users.every((user) => typeof user === "string"))
    .withMessage("Each user must be a string"),
  projectController.removeUserFromProject
);

router.get(
  "/get-project/:projectId",
  authMiddleWare.authUser,
  projectController.getProjectById
);

router.put(
  "/update-file-tree",
  authMiddleWare.authUser,
  body("projectId").isString().withMessage("Project ID is required"),
  body("fileTree").isObject().withMessage("File tree is required"),
  projectController.updateFileTree
);

router.put(
  "/update-description",
  authMiddleWare.authUser,
  body("projectId").isString().withMessage("Project ID is required"),
  body("description").isString().withMessage("Description must be a string"),
  projectController.updateDescription
);

router.post(
  "/add-message",
  authMiddleWare.authUser,
  body("projectId").isString().withMessage("Project ID is required"),
  body("message").isString().withMessage("Message is required"),
  projectController.addMessageToProject
);

router.get(
  "/messages/:projectId",
  authMiddleWare.authUser,
  projectController.getProjectMessages
);

export default router;
