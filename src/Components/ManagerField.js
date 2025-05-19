import React, { useState, useEffect, useRef } from "react";

const ManagerField = ({ setManagerDn }) => {
  const [managerName, setManagerName] = useState("");
  const [managers, setManagers] = useState([]);
  const [resultsVisible, setResultsVisible] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const suppressFetch = useRef(false); // Utiliser useRef pour empêcher une nouvelle recherche après sélection

  useEffect(() => {
    if (suppressFetch.current) {
      suppressFetch.current = false; // Réinitialisation après suppression de la recherche
      return;
    }

    if (managerName.length > 1) {
      clearTimeout(debounceTimeout);
      const timeout = setTimeout(() => {
        fetchManagers(managerName);
      }, 500);
      setDebounceTimeout(timeout);
    } else {
      setManagers([]);
      setResultsVisible(false);
    }
  }, [managerName]);

  const fetchManagers = (query) => {
    if (!query) {
      console.warn("Aucune requête fournie pour la recherche des managers.");
      setManagers([]);
      setResultsVisible(false);
      return;
    }
  
    const url = new URL("/api/search_manager", window.location.href);
    url.searchParams.append("query", query);
  
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Erreur HTTP ! Statut : ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Données reçues pour les managers :", data);
        if (data && Array.isArray(data.managers)) {
          setManagers(data.managers);
          setResultsVisible(data.managers.length > 0);
        } else {
          console.warn("Format inattendu des données pour les managers :", data);
          setManagers([]);
          setResultsVisible(false);
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la recherche des managers :", error);
        setManagers([]);
        setResultsVisible(false); // Masquer les résultats en cas d'erreur
      });
  };

  const handleManagerSelect = (manager) => {
    setManagerDn(manager.dn);
    setManagerName(manager.cn);
    suppressFetch.current = true; // Utilisation de useRef pour empêcher la recherche après sélection
    setResultsVisible(false);

    // Log the selected manager's details
    console.log("Manager selected:", manager);
  };

  return (
    <div className="relative grid grid-cols-1">
      <label
        htmlFor="managerName"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-4" // Ajout de 'mt-4' ici
      >
        Nom du manager :
      </label>
      <div className="relative">
        <input
          type="text"
          value={managerName}
          onChange={(e) => setManagerName(e.target.value)}
          placeholder="Entrez le nom du manager..."
          className="h-[40px] mt-1 rounded-[7px] border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-50"
          role="combobox"
          aria-expanded={resultsVisible}
        />
        {/* Ajout de la flèche de la liste déroulante */}
        <div className="absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none">
          <svg
            className="shrink-0 w-5 h-5 text-gray-500 dark:text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m7 15 5 5 5-5"></path>
          </svg>
        </div>
      </div>
      {resultsVisible && (
        <div className="absolute z-50 w-full max-h-72 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden overflow-y-auto mt-2">
          {managers.map((manager, index) => (
            <div
              key={index}
              className="cursor-pointer py-2 px-4 w-full text-sm text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              onClick={() => handleManagerSelect(manager)}
              tabIndex={index}
            >
              <div className="flex justify-between items-center w-full">
                <span>{manager.cn}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManagerField;