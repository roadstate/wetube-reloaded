import mongoose from "mongoose";

mongoose.connect(process.env.DB_URL,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;

const handleOpen = () => console.log("connect to db");
const handleError = (error) => console.log("x error",error);

db.on("error",handleError);
db.once("open",handleOpen);