import { getASession } from "../model/session/sessionModel.js";
import { getAUser } from "../model/user/userModel.js";
import { verifyAccessJWT } from "../utils/jwt.js";

export const auth = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    let message = "";

    console.log("atutorization", authorization);
    if (authorization) {
      const decoded = await verifyAccessJWT(authorization);
      if (decoded === "jwt expired") message = "jwt expired";

      console.log("decoded", decoded);
      console.log("decoded-email", decoded.email);
      console.log({ message });

      if (decoded?.email) {
        const session = await getASession({
          token: authorization,
          associate: decoded.email,
        });
        if (session?._id) {
          const user = await getAUser({ email: decoded.email });

          if (user?._id && user?.isEmailVerified && user?.status === "active") {
            user.password = undefined;
            user.__v = undefined;
            req.userInfo = user;
            return next();
          }

          if (user?.status === "inactive") {
            message = "Your account is not active, contact admin";
          }

          if (!user?.isEmailVerified) {
            message = "User not verified, please check your email and verify";
          }
        }
      }
    }

    const statusCode = message == "jwt expired" ? 403 : 401;
    res.status(statusCode).json({
      statu: "error",
      message: message || "unauthorized",
    });
  } catch (error) {
    next(error);
  }
};
