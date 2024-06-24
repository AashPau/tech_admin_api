import sessionSchema from "./sessionSchema.js";

// C
export const createNewSession = (obj) => {
  return sessionSchema(obj).save();
};

//d
export const deleteSession = (filter) => {
  return sessionSchema.findOneAndDelete(filter);
};

export const getASession = (filter) => {
  return sessionSchema.findOne(filter);
};
