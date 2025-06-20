import { useState, useEffect } from "react";

const API_URL = "http://64.23.209.28";

export default function BookApp() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({
    title: "",
    author: "",
    year: "",
    category: "",
    pages: "",
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchType, setSearchType] = useState("all");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [showLogin, setShowLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [actionError, setActionError] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (token) {
      fetchBooks();
    } else {
      setBooks([]);
      setLoading(false);
    }
  }, [token]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/books`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        setBooks([]);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setBooks(Array.isArray(data) ? data : []);
    } catch (e) {
      setBooks([]);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // LOGIN
  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginForm),
    });
    if (res.ok) {
      const data = await res.json();
      setToken(data.token);
      localStorage.setItem("token", data.token);
      setShowLogin(false);
      setLoginForm({ email: "", password: "" });
    } else {
      setLoginError("Credenciales incorrectas");
    }
  };

  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("token");
    setBooks([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionError("");
    if (!token) {
      setActionError("Debes iniciar sesión para agregar o editar libros.");
      return;
    }
    if (editingId) {
      // PUT (editar)
      const response = await fetch(`${API_URL}/books/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          year: Number(form.year),
          pages: Number(form.pages),
        }),
      });
      if (response.ok) {
        await fetchBooks();
        setForm({ title: "", author: "", year: "", category: "", pages: "" });
        setEditingId(null);
      } else {
        setActionError("No autorizado o error al editar libro");
      }
    } else {
      // POST (agregar)
      const response = await fetch(`${API_URL}/books`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          year: Number(form.year),
          pages: Number(form.pages),
        }),
      });
      if (response.ok) {
        await fetchBooks();
        setForm({ title: "", author: "", year: "", category: "", pages: "" });
      } else {
        setActionError("No autorizado o error al agregar libro");
      }
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (searchType === "id" && search) {
      const res = await fetch(`${API_URL}/books/${search}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setBooks(data ? [data] : []);
      } else {
        setBooks([]);
      }
    } else if (searchType === "category" && search) {
      const res = await fetch(
        `${API_URL}/books/?category=${encodeURIComponent(search)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setBooks(data);
      } else {
        setBooks([]);
      }
    } else {
      await fetchBooks();
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        maxWidth: 1200,
        minHeight: 1000,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <button
          onClick={() => {
            if (token) {
              handleLogout();
            } else {
              setShowLogin(true);
              setLoginError("");
            }
          }}
          style={{
            background: "#007bff",
            color: "#fff",
            border: "none",
            padding: "10px 24px",
            borderRadius: 6,
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          {token ? "Cerrar sesión" : "Iniciar sesión"}
        </button>
        <h1 style={{ margin: 0, fontSize: 36, letterSpacing: 1 }}>Book App</h1>
      </div>

      {/* Modal de login */}
      {showLogin && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "rgb(71, 70, 70)",
              padding: 32,
              borderRadius: 10,
              minWidth: 350,
              boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
            }}
          >
            <h2 style={{ marginBottom: 16 }}>Iniciar sesión</h2>
            <form onSubmit={handleLogin}>
              <input
                name="email"
                placeholder="Email"
                value={loginForm.email}
                onChange={handleLoginChange}
                required
                style={{
                  marginBottom: 12,
                  width: "100%",
                  padding: 10,
                  fontSize: 16,
                }}
              />
              <input
                name="password"
                type="password"
                placeholder="Contraseña"
                value={loginForm.password}
                onChange={handleLoginChange}
                required
                style={{
                  marginBottom: 12,
                  width: "100%",
                  padding: 10,
                  fontSize: 16,
                }}
              />
              <button
                type="submit"
                style={{
                  width: "100%",
                  marginBottom: 10,
                  padding: 10,
                  fontSize: 16,
                  background: "#007bff",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                Entrar
              </button>
              <button
                type="button"
                style={{
                  width: "100%",
                  padding: 10,
                  fontSize: 16,
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
                onClick={() => setShowLogin(false)}
              >
                Cancelar
              </button>
            </form>
            {loginError && <p style={{ color: "red" }}>{loginError}</p>}
          </div>
        </div>
      )}

      {/* Solo mostrar el buscador, formulario y lista si hay sesión */}
      {token ? (
        <>
          {/* Buscador */}
          <form
            onSubmit={handleSearch}
            style={{
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              style={{ padding: 8, fontSize: 16 }}
            >
              <option value="all">Todos</option>
              <option value="id">Buscar por ID</option>
              <option value="category">Buscar por Categoría</option>
            </select>
            <input
              type="text"
              placeholder={
                searchType === "id"
                  ? "ID"
                  : searchType === "category"
                  ? "Categoría"
                  : "Buscar"
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={searchType === "all"}
              style={{ padding: 8, fontSize: 16, flex: 1 }}
            />
            <button
              type="submit"
              disabled={searchType === "all"}
              style={{
                padding: "8px 18px",
                fontSize: 16,
                border: "none",
                borderRadius: 6,
                cursor: searchType === "all" ? "not-allowed" : "pointer",
              }}
            >
              Buscar
            </button>
            {searchType !== "all" && (
              <button
                type="button"
                onClick={async () => {
                  setSearch("");
                  setSearchType("all");
                  await fetchBooks();
                }}
                style={{
                  padding: "8px 18px",
                  fontSize: 16,
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                Limpiar
              </button>
            )}
          </form>

          {/* Formulario para agregar libro */}
          <form
            onSubmit={handleSubmit}
            style={{
              marginBottom: 32,
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              alignItems: "flex-end",
            }}
          >
            <input
              name="title"
              placeholder="Título"
              value={form.title}
              onChange={handleChange}
              required
              style={{ flexBasis: 200, padding: 8, fontSize: 16 }}
            />
            <input
              name="author"
              placeholder="Autor"
              value={form.author}
              onChange={handleChange}
              required
              style={{ flexBasis: 180, padding: 8, fontSize: 16 }}
            />
            <input
              name="year"
              type="number"
              placeholder="Año"
              value={form.year}
              onChange={handleChange}
              required
              style={{ width: 100, padding: 8, fontSize: 16 }}
            />
            <input
              name="category"
              placeholder="Categoría"
              value={form.category}
              onChange={handleChange}
              required
              style={{ flexBasis: 150, padding: 8, fontSize: 16 }}
            />
            <input
              name="pages"
              type="number"
              placeholder="Páginas"
              value={form.pages}
              onChange={handleChange}
              required
              style={{ width: 100, padding: 8, fontSize: 16 }}
            />
            <button
              type="submit"
              style={{
                minWidth: 150,
                padding: "8px 18px",
                fontSize: 16,
                background: "rgb(85, 83, 83)",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                alignSelf: "flex-end",
                marginLeft: "auto",
              }}
            >
              {editingId ? "Guardar cambios" : "Agregar"}
            </button>
          </form>
          {actionError && <p style={{ color: "red" }}>{actionError}</p>}

          {/* Lista de libros */}
          {loading ? (
            <p>Cargando libros...</p>
          ) : (
            <ul style={{ fontSize: 18, paddingLeft: 0, textAlign: "left", maxWidth: 1150, margin: "0 auto" }}>
              {Array.isArray(books) && books.length === 0 ? (
                <li>No se encontraron libros.</li>
              ) : (
                Array.isArray(books) &&
                books.map((book) => (
                  <li
                    key={book.id}
                    style={{
                      marginBottom: 18,
                      padding: 16,
                      borderRadius: 8,
                      boxShadow: "0 1px 4px rgb(0, 0, 0)",
                      listStyle: "none",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <strong>{book.title}</strong> de {book.author} ({book.year})<br />
                      Categoría: {book.category} | Páginas: {book.pages}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {editingId === book.id ? (
                        <button
                          style={{
                            background: "#6c757d",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            padding: "6px 14px",
                            fontSize: 15,
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            setEditingId(null);
                            setForm({ title: "", author: "", year: "", category: "", pages: "" });
                          }}
                        >
                          Cancelar
                        </button>
                      ) : (
                        <button
                          style={{
                            background: "rgb(68, 51, 218)",
                            color: "#222",
                            border: "none",
                            borderRadius: 6,
                            padding: "6px 14px",
                            fontSize: 15,
                            cursor: "pointer",
                          }}
                          onClick={async () => {
                            if (!token) {
                              setActionError("Debes iniciar sesión para editar libros.");
                              return;
                            }
                            setForm({
                              title: book.title,
                              author: book.author,
                              year: book.year,
                              category: book.category,
                              pages: book.pages,
                            });
                            setEditingId(book.id);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                        >
                          Editar
                        </button>
                      )}
                      <button
                        style={{
                          background: "#dc3545",
                          color: "#fff",
                          border: "none",
                          borderRadius: 6,
                          padding: "6px 14px",
                          fontSize: 15,
                          cursor: "pointer",
                        }}
                        onClick={async () => {
                          if (!token) {
                            setActionError("Debes iniciar sesión para eliminar libros.");
                            return;
                          }
                          if (window.confirm("¿Seguro que deseas eliminar este libro?")) {
                            const res = await fetch(`${API_URL}/books/${book.id}`, {
                              method: "DELETE",
                              headers: {
                                Authorization: `Bearer ${token}`,
                              },
                            });
                            if (res.ok) {
                              await fetchBooks();
                              if (editingId === book.id) {
                                setEditingId(null);
                                setForm({ title: "", author: "", year: "", category: "", pages: "" });
                              }
                            } else {
                              setActionError("No autorizado o error al eliminar libro");
                            }
                          }
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          )}
        </>
      ) : (
        <div style={{ textAlign: "center", marginTop: 100, fontSize: 22, color: "#555" }}>
          Inicia sesión para ver y gestionar los libros.
        </div>
      )}
    </div>
  );
}