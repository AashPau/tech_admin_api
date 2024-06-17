import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 8001;

app.use(express.json());
app.use(cors());

app.listen(PORT, (error) => {
  error
    ? console.log(error)
    : console.log(`server running at http://localhost:${PORT}`);
});
