import Database from "better-sqlite3";

const db = new Database("./data/books.db");

export const GetAllUserBooks = (userId) =>
  db.prepare("SELECT * FROM books WHERE userId = ?").all(userId);

export const GetAllPublicBooks = () =>
  db.prepare("SELECT * FROM books WHERE isPublic = 1").all();

export const GetUserBookByIsbn = (userId, isbn) =>
  db
    .prepare("SELECT * FROM books WHERE userId = ? AND isbn = ?")
    .get(userId, isbn);

export const GetPublicBookByIsbn = (isbn) =>
  db.prepare("SELECT * FROM books WHERE isbn = ? AND isPublic = 1").get(isbn);

export const UpdateUserBook = (
  title,
  isbn,
  author,
  published_year,
  genre,
  pages,
  isPublic,
  userId,
  cover,
) =>
  db
    .prepare(
      "UPDATE books SET title = ?, author = ?, published_year = ?, genre = ?, pages = ?, isPublic = ?, cover = ? WHERE userId = ? AND isbn = ?",
    )
    .run(
      title,
      author,
      published_year,
      genre,
      pages,
      isPublic,
      cover,
      userId,
      isbn,
    );

export const SaveUserBook = (
  title,
  isbn,
  author,
  published_year,
  genre,
  pages,
  isPublic,
  userId,
  cover,
) =>
  db
    .prepare(
      "INSERT INTO books (title, isbn, author, published_year, genre, pages, isPublic, userId, cover) VALUES (?,?,?,?,?,?,?,?,?)",
    )
    .run(
      title,
      isbn,
      author,
      published_year,
      genre,
      pages,
      isPublic,
      userId,
      cover,
    );

export const DeleteUserBook = (userId, isbn) =>
  db
    .prepare("DELETE FROM books WHERE userId = ? AND isbn = ?")
    .run(userId, isbn);
