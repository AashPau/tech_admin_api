import JWT from "jsonwebtoken";
import { createNewSession } from "../model/session/sessionModel.js";

export const signAcessJWT = async ({ email }) => {
  const token = JWT.sign({ email }, process.env.ACCESSJWT_SECRET, {
    expiresIn: "15m",
  });

  const session = await createNewSession({ token, associate: email });
  return session._id ? token : null;
};
export const signRefreshJWT = async (payload) => {
  const refreshJWT = JWT.sign(payload, process.env.REFRESHJWT_SECRET, {
    expiresIn: "30d",
  });
  const session = await updateUser({ email }, { refreshJWT });
  return user._id ? refreshJWT : null;
};

export const getTokens = async (email) => {
  return {
    accessJWT: await signAcessJWT(email),
    refreshJWT: await signRefreshJWT(email),
  };
};

//==============
export const verifyAcessJWT = async (token) => {
  try {
    const decoded = JWT.verify(token, process.env.ACCESSJWT_SECRET);
    return decoded;
  } catch (error) {
    return error.message;
  }
};
