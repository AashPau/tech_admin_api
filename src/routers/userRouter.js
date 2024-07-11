import express from "express";

import {
  createNewUser,
  getAUser,
  updateUser,
} from "../model/user/userModel.js";
import { comparePassword, hashPassword } from "../utils/bcrypt.js";
import { newUserValidation } from "../middlewares/joiValidation.js";
import { v4 as uuidv4 } from "uuid";
import {
  createNewSession,
  deleteManySession,
  deleteSession,
} from "../model/session/sessionModel.js";
import {
  accountUpdatedNotification,
  emailVerificationMail,
  sendOTPMail,
} from "../services/email/nodemailer.js";
import { getTokens, signAccessJWT, verifyRefreshJWT } from "../utils/jwt.js";
import { auth } from "../middlewares/auth.js";
const router = express.Router();

router.post("/", newUserValidation, async (req, res, next) => {
  try {
    //encrypt the password
    req.body.password = hashPassword(req.body.password);

    const user = await createNewUser(req.body);

    //create new url and add in database
    if (user?._id) {
      const token = uuidv4();
      const obj = {
        token,
        associate: user.email,
      };
      const result = await createNewSession(obj);
      if (result?._id) {
        //process for sending email
        emailVerificationMail({
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

//user verification //public
router.post("/user-verification", async (req, res, next) => {
  try {
    const { c, e } = req.body;
    //delete session data
    const session = await deleteSession({
      token: c,
      associate: e,
    });
    if (session?._id) {
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
    }

    res.json({
      status: "error",
      message: "invalid Link, contact admin",
    });
  } catch (error) {
    next(error);
  }
});

router.get("/", auth, (req, res, next) => {
  try {
    const { userInfo } = req;
    console.log("USERINFO", userInfo);
    userInfo.refreshJWT = undefined;

    userInfo?.status === "active"
      ? res.json({
          status: "success",
          message: "",
          userInfo,
        })
      : res.json({
          status: "error",
          message:
            "your account has not been activated. Check your email to verify your account",
        });
  } catch (error) {
    next(error);
  }
});

//admin authentication4
router.post("/login", async (req, res, next) => {
  try {
    let message = "";
    const { email, password } = req.body;
    console.log("userEmail", email);
    const user = await getAUser({ email });
    if (user?._id && user?.status === "active" && user?.isEmailVerified) {
      //verify the password
      const confirmPassword = comparePassword(password, user.password);

      if (confirmPassword) {
        //user is authenticated
        return res.json({
          status: "success",
          message: "login Successful",
          jwts: await getTokens(email),
        });
      }
    }

    if (user?.status === "inactive") {
      message = "Your account is not active, contact admin";
    }

    if (!user?.isEmailVerified) {
      message = "User not verified, please check your email and verify";
    }

    //create jwt then return

    res.json({
      status: "error",
      message: "Unable to process your request, try again later",
    });
  } catch (error) {
    next(error);
  }
});

//return new accessJWT
router.get("/new-accessjwt", async (req, res, next) => {
  try {
    const { authorization } = req.headers;

    //verify jwt
    const decode = verifyRefreshJWT(authorization);
    console.log(decode, "---------");
    if (decode?.email) {
      //check if exist in the user table
      const user = await getAUser({
        email: decode.email,
        refreshJWT: authorization,
      });
      if (user?._id) {
        //create new accessJWT and return
        const accessJWT = await signAccessJWT(decode.email);
        if (accessJWT) {
          return res.json({
            status: "success",
            message: "",
            accessJWT,
          });
        }
      }
    }
    res.status(401).json({
      status: "error",
      message: "Unauthorized",
    });
  } catch (error) {
    next(error);
  }
});

// Logout user
router.delete("/logout", auth, async (req, res, next) => {
  try {
    const { email } = req.userInfo;

    await updateUser({ email }, { refreshJWT: "" });
    // verify jwt
    await deleteManySession({ associate: email });

    res.json({
      status: "success",
      message: "you are loggedout",
    });
  } catch (error) {
    next(error);
  }
});

//request otp for password reset
router.post("/otp", async (req, res, next) => {
  try {
    const { email } = req.body;
    console.log(req.body, "req.body");

    const user = await getAUser({ email });

    if (user?._id) {
      const token = otpGenerator();

      await createNewSession({
        token,
        associate: email,
        type: "otp",
      });
      //sendd the email
      sendOTPMail({ token, fName: user.fName, email });
    }
    res.json({
      status: "success",
      message:
        "If your email is found in our system, we have sent you an OTP in your email, please check your Inbox",
    });
  } catch (error) {
    next(error);
  }
});

//check of the otp is valid and reset the password
router.patch("/password/reset", async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;
    if ((email, otp, password)) {
      const session = deleteSession({
        token: otp,
        associate: email,
        type: "otp",
      });
      if (session?._id) {
        //update user table with new hashPass
        const user = await updateUser(
          { email },
          { password: hashPassword(password) }
        );
        if (user?._id) {
          accountUpdatedNotification({ email, fName: user.fName });
          return res.json({
            status: "success",
            message: "Your password has been reset",
          });
        }
      }
    }
    res.json({
      status: "error",
      message: "Invalid otp por data request, try again later",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
