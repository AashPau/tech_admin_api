import { getASession } from "../model/session/sessionModel.js";
import { getAUser } from "../model/user/userModel.js";
import { verifyAcessJWT } from "../utils/jwt.js";

export const auth = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (authorization) {
      const decoded = await verifyAcessJWT(authorization);
      if (!decoded?.email) {
        throw new Error({ message: decoded, statusCode: 200 });
      }
      //check if exists in db
      const session = await getASession({
        token: authorization,
        associate: decoded.email,
      });

      if (session?._id) {
        const user = getAUser({ email: decoded.email });

        if (!user.isEmailVerified) {
          message = "User not active please check your email and verify";
        } else if (user?.status === "inactive") {
          message = "User not active please contact the admin";
        } else if (user?._id) {
          user.password = undefined;
          req.userInfo = user;
          return next();
        }
      }
    }
    throw new Error({ message: "Unauthorized", statusCode: 403 });
  } catch (error) {}
};
