import express from "express";
import books from "./appBooks.js";
import users from "./appUsers.js";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("index"));

app.use("/api/books", books);
app.use("/api/users", users);

app.listen(PORT, () => {
  console.log(`Server runs on http://localhost:3000`);
});