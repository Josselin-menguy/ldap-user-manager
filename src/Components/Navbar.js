import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import logo from "../images/logo_generic.png"; // Utilisez un logo générique

const Navbar = () => {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const [theme, setTheme] = useState(localStorage.getItem("hs_theme") || "light");
  const navigate = useNavigate();

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("hs_theme", newTheme);
    document.querySelector("html").classList.toggle("dark", newTheme === "dark");
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <nav className="bg-white dark:bg-gray-900 p-6 shadow-lg">
      <div className="container mx-auto flex items-center space-x-8">
        {/* Logo générique en début de flexbox */}
        <Link to="/" className="flex-shrink-0">
          <img src={logo} alt="Logo" className="h-16 w-auto object-contain" />
        </Link>

        {isAuthenticated && (
          <ul className="flex-grow flex justify-center space-x-10 text-xl">
            <li>
              <a
                href="/mouvement-interne-admin"
                className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
              >
                Mouvement Interne Admin
              </a>
            </li>
            <li>
              <a
                href="/mouvement-interne-enseignant"
                className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
              >
                Mouvement Interne Enseignant
              </a>
            </li>
            <li>
              <a
                href="/formulaire-entree-collaborateur"
                className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
              >
                Formulaire Entrée Collaborateur
              </a>
            </li>
            <li>
              <a
                href="/formulaire-sortie-effectifs"
                className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
              >
                Formulaire Sortie Effectifs
              </a>
            </li>
          </ul>
        )}

        <div className="flex space-x-4 ml-auto">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700"
          >
            {theme === "light" ? (
              <svg
                className="h-6 w-6 text-black dark:text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
              </svg>
            ) : (
              <svg
                className="h-6 w-6 text-black dark:text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="4"></circle>
                <path d="M12 2v2"></path>
                <path d="M12 20v2"></path>
                <path d="m4.93 4.93 1.41 1.41"></path>
                <path d="m17.66 17.66 1.41 1.41"></path>
                <path d="M2 12h2"></path>
                <path d="M20 12h2"></path>
                <path d="m6.34 17.66-1.41 1.41"></path>
                <path d="m19.07 4.93-1.41 1.41"></path>
              </svg>
            )}
          </button>

          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="font-medium text-white bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Déconnexion
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
