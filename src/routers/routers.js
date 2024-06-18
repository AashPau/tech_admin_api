import userRouter from "./userRouter.js";
export default [
  {
    path: "/api/v1/user",
    middlewares: [userRouter],
  },
];
