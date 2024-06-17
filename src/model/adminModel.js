import adminSchema from "./adminSchema.js";

// C
export const createNewAdmin = async (obj) => {
  return await adminSchema(obj).save();
};
//r

//u

//d
