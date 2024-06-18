import express from "express";

import { createNewUser, updateUser } from "../model/user/userModel.js";
import { hashPassword } from "../utils/bcrypt.js";
import { newUserValidation } from "../middlewares/joiValidation.js";
import { v4 as uuidv4 } from "uuid";
import {
  createNewSession,
  deleteSession,
} from "../model/session/sessionModel.js";
import { emailVerification } from "../services/email/nodemailer.js";
const router = express.Router();

router.post("/", newUserValidation, async (req, res, next) => {
  try {
    req.body.password = hashPassword(req.body.password);

    const user = await createNewUser(req.body);

    //create new url
    if (user?._id) {
      const token = uuidv4();
      const obj = {
        token,
        associate: user.email,
      };
      const result = await createNewSession(obj);
      if (result?._id) {
        emailVerification({
          email: user.email,
          fName: user.fName,
          url:
            process.env.FE_ROOT_URL + `/verify-user?c=${token}&e=${user.email}`,
        });
        return res.json({
          status: "success",
          message:
            "we have sent an email with instruction  for login. please check you email",
        });
      }
    }
    res.json({
      status: "error",
      message: "account creation failed, please contact administration",
    });
  } catch (error) {
    next(error);
  }
});

//user verification
router.post("/user-verification", async (req, res, next) => {
  try {
    const { c, e } = req.body;
    //delete session data
    const session = await deleteSession({
      token: c,
      associate: e,
    });
    if (session?._id) {
      res.json({
        status: "success",
        message: "your account has been verified",
      });
    }
    //update user table
    const result = await updateUser(
      { email: e },
      { status: "active", isEmailVerified: true }
    );
    if (result?._id) {
      res.json({
        status: "error",
        message: "your account has been verified. you may sign in now",
      });
    }
    res.json({
      status: "error",
      message: "invalid Link, contact admin",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
