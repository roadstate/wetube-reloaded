import express from "express";
import session from "express-session";
import morgan from "morgan";
import "./db";
import { localsMiddleware } from "./middlewares";
import rootRouter from "./routers/rootRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";
import MongoStore from "connect-mongo";

const app = express();
const logger = morgan("dev");

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
app.use(logger);
app.use(express.urlencoded({extended: true}));

app.use(
    session({
        secret:process.env.COOKIE_SECRET,
        resave:true,
        saveUninitialized:true,
        store : MongoStore.create({mongoUrl : process.env.DB_URL}),
    })
);


app.use(localsMiddleware);
app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);
app.use("/uploads", express.static("uploads"))

export default app;


