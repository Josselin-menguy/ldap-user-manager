import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import { initDarkMode, toggleDarkMode } from "../Darkmode";
import accueilImage from "../images/accueil.jpg";
// import logo from "../images/logo.png"; // Utilisez votre logo générique si besoin

const Accueil = () => {
  const { logout } = useContext(AuthContext);
  const [theme, setTheme] = useState(localStorage.getItem("hs_theme") || "light");

  useEffect(() => {
    initDarkMode();
  }, [theme]);

  const handleThemeToggle = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "light" ? "dark" : "light";
      toggleDarkMode();
      return newTheme;
    });
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="relative flex h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
      <div className="absolute top-4 right-4 flex space-x-4 z-50">
        <button
          onClick={handleThemeToggle}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700"
        >
          {theme === "light" ? (
            <svg className="h-6 w-6 text-black dark:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
            </svg>
          ) : (
            <svg className="h-6 w-6 text-black dark:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
        >
          Déconnexion
        </button>
      </div>

      {/* Logo générique si besoin */}
      {/* <Link to="/" className="absolute top-4 left-4 z-50">
        <img src={logo} alt="Logo" className="h-[100px]" />
      </Link> */}

      <div className="w-1/2 h-full flex flex-col justify-center items-center p-10 bg-white dark:bg-gray-900 text-black dark:text-white">
        <h2 className="text-3xl text-blue-600 italic mb-6 text-center">
          Sélectionnez le formulaire souhaité
        </h2>

        <div className="space-y-6 w-full">
          <Link to="/mouvement-interne-admin" className="block w-full text-left px-6 py-4 text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg transition">
            Mouvement Interne Administratif
          </Link>

          <Link to="/mouvement-interne-enseignant" className="block w-full text-left px-6 py-4 text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg transition">
            Mouvement Interne Enseignant
          </Link>

          <Link to="/formulaire-entree-collaborateur" className="block w-full text-left px-6 py-4 text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg transition">
            Formulaire Entrée Collaborateur
          </Link>

          <Link to="/formulaire-sortie-effectifs" className="block w-full text-left px-6 py-4 text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg transition">
            Formulaire Sortie des Effectifs
          </Link>
        </div>
      </div>

      <div className="w-1/2 h-full bg-cover bg-center bg-gray-100 dark:bg-gray-800" style={{ backgroundImage: `url(${accueilImage})` }}>
        <span className="sr-only">Image de fond représentant l'accueil</span>
      </div>
    </div>
  );
};

export default Accueil;
