import express from "express";
import { createNewAdmin } from "../model/adminModel.js";
const router = express.Router();

router.post("/", (req, res, next) => {
  try {
    const obj = req.body;
    const result = createNewAdmin(obj);

    res.json({
      status: "success",
      message: "todo",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
