import mongoose from "mongoose";
export const dbConnection = async () => {
  try {
    const con = await mongoose.connect(process.env.MONGO_URL);
    con && console.log("db connected");
  } catch (error) {
    console.log(error);
  }
};
