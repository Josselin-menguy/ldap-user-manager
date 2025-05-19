import React from "react";
import { useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  // Masquer la sidebar sur la page de sortie des effectifs
  if (location.pathname === "/formulaire-sortie-effectifs") {
    return null;
  }

  return (
    <div className="fixed top-16 left-0 bottom-0 w-1/4 p-4 flex items-center justify-center">
      <div className="shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 w-full max-w-xs mx-auto transition-transform transform hover:scale-105">
        <ul className="space-y-6 text-center">
          <li>
            <a
              href="#ldap-search"
              className="text-lime-700 dark:text-lime-400 hover:text-lime-500 dark:hover:text-lime-300 underline decoration-transparent hover:decoration-lime-500 dark:hover:decoration-lime-300 transition duration-300 ease-in-out"
            >
              Utilisateur
            </a>
          </li>
          <li>
            <a
              href="#ou-section"
              className="text-lime-700 dark:text-lime-400 hover:text-lime-500 dark:hover:text-lime-300 underline decoration-transparent hover:decoration-lime-500 dark:hover:decoration-lime-300 transition duration-300 ease-in-out"
            >
              Statut
            </a>
          </li>
          <li>
            <a
              href="#new-ou-section"
              className="text-lime-700 dark:text-lime-400 hover:text-lime-500 dark:hover:text-lime-300 underline decoration-transparent hover:decoration-lime-500 dark:hover:decoration-lime-300 transition duration-300 ease-in-out"
            >
              Informations du profil
            </a>
          </li>
          <li>
            <a
              href="#groups-section"
              className="text-lime-700 dark:text-lime-400 hover:text-lime-500 dark:hover:text-lime-300 underline decoration-transparent hover:decoration-lime-500 dark:hover:decoration-lime-300 transition duration-300 ease-in-out"
            >
              Groupes
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
