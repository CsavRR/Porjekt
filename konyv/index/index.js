let currentUser = null;
const guestNav = document.getElementById("guestNav");
const userNav = document.getElementById("userNav");
const userSection = document.getElementById("userSection");
const publicSection = document.getElementById("publicSection");
const userBooks = document.getElementById("userBooks");
const publicBooks = document.getElementById("publicBooks");
const message = document.getElementById("message");
const modalMessage = document.getElementById("modalMessage");
const logoutButton = document.getElementById("logoutButton");
const btnShowPublic = document.getElementById("btnShowPublic");
const btnShowUser = document.getElementById("btnShowUser");
const bookCountBadge = document.getElementById("bookCountBadge");

// Modális ablakok fülváltója
const tabLogin = document.getElementById("tabLogin");
const tabRegister = document.getElementById("tabRegister");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const authModalTitle = document.getElementById("authModalTitle");

function switchAuthTab(tab) {
  modalMessage.textContent = "";
  if (tab === "register") {
    tabRegister.classList.add("active");
    tabLogin.classList.remove("active");
    registerForm.hidden = false;
    loginForm.hidden = true;
    if (authModalTitle) authModalTitle.textContent = "Regisztráció";
  } else {
    tabLogin.classList.add("active");
    tabRegister.classList.remove("active");
    loginForm.hidden = false;
    registerForm.hidden = true;
    if (authModalTitle) authModalTitle.textContent = "Bejelentkezés";
  }
}

// Nézetváltó (Publikus könyvek <-> Elmentett könyveim)
function switchView(view) {
  if (view === "user" && currentUser) {
    btnShowUser.classList.add("active");
    btnShowPublic.classList.remove("active");
    userSection.hidden = false;
    publicSection.hidden = true;
    bookCountBadge.textContent = `${userBooks.children.length} saját könyv`;
  } else {
    btnShowPublic.classList.add("active");
    btnShowUser.classList.remove("active");
    publicSection.hidden = false;
    userSection.hidden = true;
    bookCountBadge.textContent = `${publicBooks.children.length} publikus könyv`;
  }
}

btnShowPublic.onclick = () => switchView("public");
btnShowUser.onclick = () => switchView("user");

// Magazin-stílusú könyvkártya létrehozása
function createBookCard(book, editable = false) {
  const column = document.createElement("div");
  column.className = "col-12 col-sm-6 col-md-4 col-lg-3";

  const card = document.createElement("div");
  card.className = "book-card";

  // Felső borítórész + műfaj címke
  const coverTop = document.createElement("div");
  coverTop.className = "book-cover-top";

  const genreTag = document.createElement("span");
  genreTag.className = "genre-tag";
  genreTag.textContent = book.genre;

  if (book.cover) {
    const img = document.createElement("img");
    img.src = book.cover;
    img.onerror = () => {
      coverTop.innerHTML = `<span class="book-placeholder">📖</span>`;
      coverTop.appendChild(genreTag);
    };
    coverTop.appendChild(img);
  } else {
    coverTop.innerHTML = `<span class="book-placeholder">📖</span>`;
  }

  coverTop.appendChild(genreTag);
  card.appendChild(coverTop);

  // Alsó tartalom
  const body = document.createElement("div");
  body.className = "book-body";

  const title = document.createElement("h3");
  title.textContent = book.title;
  body.appendChild(title);

  const author = document.createElement("div");
  author.className = "book-author";
  author.textContent = book.author;
  body.appendChild(author);

  const meta1 = document.createElement("p");
  meta1.className = "book-meta";
  meta1.textContent = `Kiadás: ${book.published_year} • ${book.pages} oldal`;
  body.appendChild(meta1);

  const meta2 = document.createElement("p");
  meta2.className = "book-meta";
  meta2.textContent = `ISBN: ${book.isbn}`;
  body.appendChild(meta2);

  if (editable) {
    const buttons = document.createElement("div");
    buttons.className = "character-buttons";

    const edit = document.createElement("button");
    edit.textContent = "✏️";
    edit.title = "Szerkesztés";

    edit.onclick = () => {
      card.innerHTML = "";
      const editBody = document.createElement("div");
      editBody.className = "book-body";

      const fields = [
        ["Cím", "title"],
        ["Szerző", "author"],
        ["Kiadás éve", "published_year"],
        ["Műfaj", "genre"],
        ["Oldalszám", "pages"],
        ["Borító URL", "cover"],
      ];

      const isbnLabel = document.createElement("p");
      isbnLabel.className = "small fw-bold mb-2";
      isbnLabel.textContent = "ISBN: " + book.isbn;
      editBody.appendChild(isbnLabel);

      const inputs = {};
      fields.forEach(([label, key]) => {
        const input = document.createElement("input");
        input.className = "form-control form-control-sm mb-2";
        input.placeholder = label;
        input.value = book[key] || "";
        if (key === "pages" || key === "published_year") input.type = "number";
        inputs[key] = input;
        editBody.appendChild(input);
      });

      const publicSelect = document.createElement("select");
      publicSelect.className = "form-select form-select-sm mb-2";
      publicSelect.innerHTML = `
                <option value="1">Publikus</option>
                <option value="0">Privát</option>
            `;
      publicSelect.value = book.isPublic;
      editBody.appendChild(publicSelect);

      const controls = document.createElement("div");
      controls.className = "character-buttons";

      const save = document.createElement("button");
      save.textContent = "💾";
      save.title = "Mentés";

      save.onclick = () => {
        fetch(
          `/api/users/books/${currentUser.id}/${encodeURIComponent(book.isbn)}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: inputs.title.value,
              author: inputs.author.value,
              published_year: inputs.published_year.value,
              genre: inputs.genre.value,
              pages: Number(inputs.pages.value),
              cover: inputs.cover.value,
              isPublic: Number(publicSelect.value),
            }),
          },
        )
          .then((res) => res.json())
          .then((data) => {
            if (data.message == "Book updated") {
              loadUserBooks();
              loadPublicBooks();
            } else {
              alert("Nem sikerült a módosítás!");
            }
          });
      };

      const cancel = document.createElement("button");
      cancel.textContent = "❌";
      cancel.title = "Mégse";
      cancel.onclick = loadUserBooks;

      controls.append(save, cancel);
      editBody.appendChild(controls);
      card.appendChild(editBody);
    };

    const del = document.createElement("button");
    del.textContent = "🗑️";
    del.title = "Törlés";

    del.onclick = () => {
      if (confirm("Biztosan törlöd ezt a könyvet?")) {
        fetch(
          `/api/users/books/${currentUser.id}/${encodeURIComponent(book.isbn)}`,
          {
            method: "DELETE",
          },
        ).then(() => {
          loadUserBooks();
          loadPublicBooks();
        });
      }
    };

    buttons.append(edit, del);
    body.appendChild(buttons);
  }

  card.appendChild(body);
  column.appendChild(card);
  return column;
}

// Publikus könyvek betöltése
function loadPublicBooks() {
  fetch("/api/books")
    .then((res) => res.json())
    .then((data) => {
      publicBooks.innerHTML = "";
      data.forEach((book) => {
        publicBooks.appendChild(createBookCard(book));
      });
      if (!publicSection.hidden) {
        bookCountBadge.textContent = `${data.length} publikus könyv`;
      }
    });
}

// Saját könyvek betöltése
function loadUserBooks() {
  fetch(`/api/users/books/${currentUser.id}`)
    .then((res) => res.json())
    .then((data) => {
      userBooks.innerHTML = "";
      data.forEach((book) => {
        userBooks.appendChild(createBookCard(book, true));
      });
      if (!userSection.hidden) {
        bookCountBadge.textContent = `${data.length} saját könyv`;
      }
    });
}

// Regisztráció
registerForm.onsubmit = (e) => {
  e.preventDefault();
  fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: document.getElementById("regUsername").value,
      email: document.getElementById("regEmail").value,
      password: document.getElementById("regPassword").value,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.id) {
        e.target.reset();
        switchAuthTab("login");
        modalMessage.textContent = "Sikeres regisztráció! Most már beléphetsz.";
        modalMessage.style.color = "green";
      } else {
        modalMessage.textContent = data.message || "Sikertelen regisztráció!";
        modalMessage.style.color = "red";
      }
    });
};

// Bejelentkezés
loginForm.onsubmit = (e) => {
  e.preventDefault();
  fetch("/api/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: document.getElementById("loginEmail").value,
      password: document.getElementById("loginPassword").value,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.id) {
        currentUser = data;
        guestNav.hidden = true;
        userNav.hidden = false;
        btnShowUser.hidden = false;

        document.getElementById("welcome").textContent =
          "Szia, " + data.username + "!";
        e.target.reset();
        modalMessage.textContent = "";

        // Belépési ablak automatikus bezárása
        const authModalEl = document.getElementById("authModal");
        const modalInstance = bootstrap.Modal.getInstance(authModalEl);
        if (modalInstance) modalInstance.hide();

        loadUserBooks();
        switchView("user");
      } else {
        modalMessage.textContent = "Hibás e-mail cím vagy jelszó!";
        modalMessage.style.color = "red";
      }
    });
};

// Új könyv hozzáadása
document.getElementById("bookForm").onsubmit = (e) => {
  e.preventDefault();
  fetch("/api/users/books", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: document.getElementById("bookTitle").value,
      isbn: document.getElementById("isbn").value,
      author: document.getElementById("author").value,
      published_year: document.getElementById("publishedYear").value,
      genre: document.getElementById("genre").value,
      pages: Number(document.getElementById("pages").value),
      cover: document.getElementById("cover").value,
      isPublic: Number(document.getElementById("isPublic").value),
      userId: currentUser.id,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.message == "Book saved") {
        e.target.reset();
        message.textContent = "Könyv sikeresen hozzáadva!";
        message.style.color = "green";
        setTimeout(() => (message.textContent = ""), 3000);

        // Új könyv ablak automatikus bezárása
        const addModalEl = document.getElementById("addBookModal");
        const modalInstance = bootstrap.Modal.getInstance(addModalEl);
        if (modalInstance) modalInstance.hide();

        loadUserBooks();
        loadPublicBooks();
      } else {
        alert(data.message || "Nem sikerült a mentés!");
      }
    });
};

// Kijelentkezés
logoutButton.onclick = () => {
  currentUser = null;
  document.querySelectorAll("form").forEach((form) => form.reset());
  userBooks.innerHTML = "";
  message.textContent = "";
  document.getElementById("welcome").textContent = "";

  userNav.hidden = true;
  btnShowUser.hidden = true;
  guestNav.hidden = false;

  switchView("public");
  loadPublicBooks();
};

loadPublicBooks();
