import bcrypt from "bcrypt";
import express from "express";
import * as db from "./data/dbUsers.js";
import * as bookdb from "./data/dbBooks.js";

const router = express.Router();

// Új felhasználó hozzáadása
router.post("/", (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: "Missing data" });
    }
    const salt = bcrypt.genSaltSync();
    const hashedPassword = bcrypt.hashSync(password, salt);

    const saved = db.SaveUser(username, email, hashedPassword);
    const user = db.GetUserById(saved.lastInsertRowid);
    res.status(201).json(user);
});

// Bejelentkezés
router.post("/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Invalid credentials" });
    }
    const user = db.GetUserByEmail(email);
    if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!bcrypt.compareSync(password, db.GetPwById(user.id))) {
        return res.status(400).json({ message: "Invalid credentials" });
    }
    res.status(200).json(user);
});

// Saját könyvek lekérése
router.get("/books/:userId", (req, res) => {
    const userId = +req.params.userId;
    const books = bookdb.GetAllUserBooks(userId);
    res.status(200).json(books);
});

// Új könyv hozzáadása
router.post("/books", (req, res) => {
    const { title, isbn, author, published_year, genre, pages, isPublic, userId, cover } = req.body;
    if (!title || !isbn || !author || !published_year || !genre || pages === undefined || isPublic === undefined || userId === undefined) {
        return res.status(400).json({ message: "Missing data" });
    }
    try {
        const saved = bookdb.SaveUserBook(title, isbn, author, published_year, genre, pages, isPublic, userId, cover || "");
        res.status(201).json({ message: "Book saved", changes: saved.changes });
    } catch (err) {
        res.status(400).json({ message: "Már létezik könyv ezzel az ISBN számmal!" });
    }
});

// Saját könyv módosítása
router.put("/books/:userId/:isbn", (req, res) => {
    const userId = +req.params.userId;
    const isbn = req.params.isbn;
    const { title, author, published_year, genre, pages, isPublic, cover } = req.body;
    if (!title || !author || !published_year || !genre || pages === undefined || isPublic === undefined) {
        return res.status(400).json({ message: "Missing data" });
    }
    const book = bookdb.GetUserBookByIsbn(userId, isbn);
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }
    const updated = bookdb.UpdateUserBook(title, isbn, author, published_year, genre, pages, isPublic, userId, cover || "");
    res.status(200).json({ message: "Book updated", changes: updated.changes });
});

// Saját könyv törlése
router.delete("/books/:userId/:isbn", (req, res) => {
    const userId = +req.params.userId;
    const isbn = req.params.isbn;
    const book = bookdb.GetUserBookByIsbn(userId, isbn);
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }
    const deleted = bookdb.DeleteUserBook(userId, isbn);
    res.status(200).json({ message: "Book deleted", changes: deleted.changes });
});

export default router;