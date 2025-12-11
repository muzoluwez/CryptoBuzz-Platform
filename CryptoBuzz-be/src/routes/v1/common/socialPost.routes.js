import express from "express";
import { getPosts, createPost, updatePost, deletePost } from "../../../controllers/common/socialPost.js";
import Auth from "../../../middlewares/auth.js";
import { upload } from "../../../middlewares/multer.js";

const router = express.Router();

router.get("/", Auth.CommonAuth, getPosts);

router.post(
  "/",
  Auth.CommonAuth,
  upload.fields([
    { name: "videos", maxCount: 20 },
    { name: "images", maxCount: 20 }
  ]),
  createPost
);

router.put(
  "/:postId",
  upload.fields([
    { name: "videos", maxCount: 20 },
    { name: "images", maxCount: 20 }
  ]),
  Auth.CommonAuth,
  updatePost
);

router.delete("/:id", Auth.CommonAuth, deletePost);

export default router;
