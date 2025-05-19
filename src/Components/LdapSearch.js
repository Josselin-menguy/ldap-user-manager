import React, { useState, useEffect, useRef } from "react";

const LdapSearch = ({ setOuResult, setSelectedUserDn }) => {
  const [localQuery, setLocalQuery] = useState("");
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const [userSelect, setUserSelect] = useState([]);
  const [resultsVisible, setResultsVisible] = useState(false);
  const suppressFetch = useRef(false);

  useEffect(() => {
    if (suppressFetch.current) {
      suppressFetch.current = false;
      return;
    }
    if (localQuery.length > 1) {
      clearTimeout(debounceTimeout);
      const timeout = setTimeout(() => {
        fetchUsers(localQuery);
      }, 500);
      setDebounceTimeout(timeout);
    } else {
      clearUserSelect();
    }
  }, [localQuery]);

  const fetchUsers = (query) => {
    const url = new URL("/api/search_user", window.location.href);
    url.searchParams.append("query", query);

    fetch(url)
      .then(async (response) => {
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          setUserSelect(data);

          if (data.length > 0) {
            const firstUserDetails = extractDetails(data[0].dn);
            setOuResult(firstUserDetails.ou);
          }

          setResultsVisible(data.length > 0);
        } catch (error) {
          console.error('Erreur lors de la récupération des utilisateurs :', error);
          console.error('Response text:', text);
        }
      })
      .catch((error) => console.error("Erreur lors de la récupération des utilisateurs :", error));
  };

  const extractDetails = (dn) => {
    try {
      const cnMatch = dn.match(/CN=([^,]+)/);
      const ouMatch = dn.match(/OU=([^,]+)/);

      if (!cnMatch || !ouMatch) {
        throw new Error("DN format incorrect: " + dn);
      }

      return {
        cn: cnMatch ? cnMatch[1] : "",
        ou: ouMatch ? ouMatch[1] : "",
      };
    } catch (error) {
      console.error("Erreur dans extractDetails :", error);
      return {
        cn: "",
        ou: "",
      };
    }
  };

  const clearUserSelect = () => {
    setUserSelect([]);
    setResultsVisible(false);
  };

  const handleUserSelect = (user) => {
    const userDetails = extractDetails(user.dn);
    setOuResult(userDetails.ou);
    setSelectedUserDn(user.dn);
    suppressFetch.current = true;
    setLocalQuery(userDetails.cn);
    setResultsVisible(false);
  };

  return (
    <div className="relative grid grid-cols-1">
      <label
        htmlFor="userSearch"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-left"
      >
        Rechercher un utilisateur
      </label>
      <div className="relative">
        <input
          type="text"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          placeholder="Rechercher un utilisateur..."
          className="h-[40px] mt-2 rounded-[7px] border text-left border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-50"
          role="combobox"
          aria-expanded={resultsVisible}
        />
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
        <div className="absolute z-50 w-full max-h-72 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden overflow-y-auto top-full">
          {userSelect.map((user, index) => (
            <div
              key={index}
              className="cursor-pointer py-2 px-4 w-full text-sm text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              onClick={() => handleUserSelect(user)}
              tabIndex={index}
            >
              <div className="flex justify-between items-center w-full">
                <span>
                  {extractDetails(user.dn).cn} ({extractDetails(user.dn).ou})
                </span>
                <span className="hidden hs-combo-box-selected:block">
                  <svg
                    className="shrink-0 w-5 h-5 text-blue-600"
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
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LdapSearch;
