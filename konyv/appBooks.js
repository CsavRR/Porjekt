import express from "express";
import * as db from "./data/dbBooks.js";

const router = express.Router();

router.get("/", (req, res) => {
  const books = db.GetAllPublicBooks();
  res.status(200).json(books);
});

router.get("/:isbn", (req, res) => {
  const book = db.GetPublicBookByIsbn(req.params.isbn);
  if (!book) {
    return res.status(404).json({ message: "Not found" });
  }
  res.status(200).json(book);
});

export default router;