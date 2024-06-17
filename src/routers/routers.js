import adminRouter from "./adminRouter.js";
export default [
  {
    path: "/api/v1/admin",
    middlewares: [adminRouter],
  },
];
