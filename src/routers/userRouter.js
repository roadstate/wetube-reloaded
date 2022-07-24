import express from "express";
import { finishGithubLogin, finishKakaoLogin, getChangePassword, getEdit, logout, postChangePassword, postEdit, startGithubLogin, startKakaoLogin, see } from "../controllers/userController";
import { avatarUpload, protectorMiddleware, publicOnlyMiddleware } from "../middlewares";

const userRouter = express.Router();

userRouter
    .route("/edit")
    .all(protectorMiddleware)
    .get(getEdit)
    .post(avatarUpload.single("avatar"), postEdit);

userRouter.get("/logout", protectorMiddleware, logout);

userRouter.route("/change-password").all(protectorMiddleware).get(getChangePassword).post(postChangePassword)
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin)
userRouter.get("/github/finish",publicOnlyMiddleware, finishGithubLogin)
userRouter.get("/kakao/start",publicOnlyMiddleware, startKakaoLogin)
userRouter.get("/kakao/finish", publicOnlyMiddleware,finishKakaoLogin)

userRouter.get("/:id",see)
export default userRouter;