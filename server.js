import express from "express";
import cors from "cors";
import adminRouter from "./src/routers/adminRouter.js";
import morgan from "morgan";

const app = express();
const PORT = process.env.PORT || 8001;

//connect db
import { dbConnection } from "./src/config/dbConnection.js";

dbConnection();
//middlewares
app.use(express.json());
app.use(cors());

//morgan
app.use(morgan("tiny"));
//apis
// app.use("/api/v1/admin", adminRouter);
import routers from "./src/routers/routers.js";
routers.forEach(({ path, middlewares }) => app.use(path, ...middlewares));

app.get("/", (req, res, next) => {
  res.json({
    status: "success",
    message: "server is healthy",
  });
});

app.use("*", (req, res, next) => {
  const err = new Error("404 not found");
  err.status = 404;
  next(err);
});

//global error handler
app.use((error, req, res, next) => {
  console.log(error, "----------");
  res.status(error.status || 500);

  res.json({
    status: "error",
    message: error.message,
  });
});

app.listen(PORT, (error) => {
  error
    ? console.log(error)
    : console.log(`server running at http://localhost:${PORT}`);
});
