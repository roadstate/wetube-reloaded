import express from "express";
import { watch, getEdit, deleteVideo, getUpload, postEdit, postUpload } from "../controllers/videoController";
import { protectorMiddleware, publicOnlyMiddleware, videoUpload } from "../middlewares";
const videoRouter = express.Router();

videoRouter.get("/:id([0-9a-f]{24})", watch);
videoRouter.all(protectorMiddleware).get("/:id([0-9a-f]{24})/edit", getEdit);
videoRouter.all(protectorMiddleware).post("/:id([0-9a-f]{24})/edit", postEdit);
videoRouter.all(protectorMiddleware).get("/:id([0-9a-f]{24})/delete", deleteVideo);
videoRouter
    .route("/upload")
    .all(protectorMiddleware)
    .get(getUpload)
    .post(videoUpload.single("video"), postUpload);

export default videoRouter;