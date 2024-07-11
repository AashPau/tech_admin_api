import JWT from "jsonwebtoken";
import { createNewSession } from "../model/session/sessionModel.js";
import { updateUser } from "../model/user/userModel.js";

export const signAccessJWT = async (email) => {
  console.log("email for jwt sign", email);
  const token = JWT.sign({ email }, process.env.ACCESSJWT_SECRET, {
    expiresIn: "15m",
  });

  const session = await createNewSession({ token, associate: email });
  return session._id ? token : null;
};

export const verifyAccessJWT = async (token) => {
  try {
    const decoded = JWT.verify(token, process.env.ACCESSJWT_SECRET);
    return decoded;
  } catch (error) {
    return error.message;
  }
};

//==============
export const signRefreshJWT = async (email) => {
  const refreshJWT = JWT.sign({ email }, process.env.REFRESHJWT_SECRET, {
    expiresIn: "30d",
  });
  const user = await updateUser({ email }, { refreshJWT });
  return user._id ? refreshJWT : null;
};

export const verifyRefreshJWT = (token) => {
  try {
    return JWT.verify(token, process.env.REFRESHJWT_SECRET);
  } catch (error) {
    return error.message;
  }
};

export const getTokens = async (email) => {
  console.log("email at get tokens", email);
  return {
    accessJWT: await signAccessJWT(email),
    refreshJWT: await signRefreshJWT(email),
  };
};
