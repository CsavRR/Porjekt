import Database from "better-sqlite3";

const db = new Database("./data/users.db");

// Tábla automatikus létrehozása, ha még nem létezik
db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )
`).run();

export const GetAllUsers = () => 
    db.prepare(`SELECT id, username, email FROM users`).all();

export const GetUserById = (id) => 
    db.prepare(`SELECT id, username, email FROM users WHERE id = ?`).get(id);

export const GetUserByEmail = (email) => 
    db.prepare(`SELECT id, username, email FROM users WHERE email = ?`).get(email);

export const GetPwById = (id) => {
    const row = db.prepare(`SELECT password FROM users WHERE id = ?`).get(id);
    return row ? row.password : null;
};

export const SaveUser = (username, email, password) => 
    db.prepare(`INSERT INTO users (username, email, password) VALUES (?,?,?)`).run(username, email, password);