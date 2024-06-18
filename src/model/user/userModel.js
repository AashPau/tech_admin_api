import userSchema from "./userSchema.js";

// C
export const createNewUser = (obj) => {
  return userSchema(obj).save();
};
//r
export const getAUser = (filter) => {
  return userSchema.findOne(filter);
};

export const getAllUser = () => {
  return userSchema.find();
};
//u
export const updateUserById = ({ _id, obj }) => {
  return userSchema.findByIdAndUpdate({ _id, obj });
};
//d
export const updateUser = (filter, obj) => {
  return userSchema.findOneAndUpdate(filter, obj);
};
