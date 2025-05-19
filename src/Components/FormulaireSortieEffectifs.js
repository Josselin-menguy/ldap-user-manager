import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import LdapSearch from "./LdapSearch";
import UserSelect from "./UserSelect";
import OuResult from "./Ouresult";
import ApplyClearButtons from "./ApplyClearButtons";

const FormulaireSortieEffectifs = () => {
  const [query, setQuery] = useState("");
  const [ouResult, setOuResult] = useState("");
  const [userSelect, setUserSelect] = useState([]);
  const [selectedUserDn, setSelectedUserDn] = useState("");
  const [retentionDays, setRetentionDays] = useState("");
  const [retentionMinutes, setRetentionMinutes] = useState("");
  const [immediateDeletion, setImmediateDeletion] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    if (query.length > 1) {
      fetchUsers(query);
    }
  }, [query]);

  useEffect(() => {
    if (selectedUserDn) {
      const details = extractDetails(selectedUserDn);
      setFirstName(details.firstName);
      setLastName(details.lastName);
    }
  }, [selectedUserDn]);

  const fetchUsers = (searchQuery) => {
    const url = new URL("/api/search_user", window.location.href);
    url.searchParams.append("query", searchQuery);
    fetch(url)
      .then((response) => response.json())
      .then((data) => setUserSelect(data))
      .catch((error) =>
        console.error("Erreur lors de la récupération des utilisateurs :", error)
      );
  };

  const extractDetails = (dn) => {
    try {
      const cnMatch = dn.match(/CN=([^,]+)/);
      let firstNameVal = "";
      let lastNameVal = "";
      if (cnMatch) {
        const nameParts = cnMatch[1].split(" ");
        if (nameParts.length >= 2) {
          firstNameVal = nameParts[0];
          lastNameVal = nameParts.slice(1).join(" ");
        }
      }
      return { firstName: firstNameVal, lastName: lastNameVal };
    } catch (error) {
      console.error("Erreur lors de l'extraction du CN :", error);
      return { firstName: "", lastName: "" };
    }
  };

  const handleDelete = () => {
    if (!selectedUserDn) {
      alert("Veuillez sélectionner un utilisateur.");
      return;
    }

    const details = extractDetails(selectedUserDn);
    const fullName = details.firstName + " " + details.lastName;
    let data = { dn: selectedUserDn, fullName: fullName };

    if (immediateDeletion) {
      data.retention_days = 0;
      data.retention_minutes = 0;
    } else {
      if (retentionDays === "" && retentionMinutes === "") {
        alert("Veuillez saisir le nombre de jours ou de minutes de rétention.");
        return;
      }
      const retentionDaysInt = parseInt(retentionDays || "0", 10);
      const retentionMinutesInt = parseInt(retentionMinutes || "0", 10);
      if (isNaN(retentionDaysInt) || isNaN(retentionMinutesInt)) {
        alert("Le nombre de jours et de minutes doit être un entier.");
        return;
      }
      data.retention_days = retentionDaysInt;
      data.retention_minutes = retentionMinutesInt;
    }

    fetch("/api/delete_user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((resData) => {
        if (resData.message) {
          alert(resData.message);
        } else if (resData.error) {
          alert("Erreur : " + resData.error);
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la suppression de l'utilisateur :", error);
      });
  };

  const handleClear = () => {
    setQuery("");
    setUserSelect([]);
    setSelectedUserDn("");
    setRetentionDays("");
    setRetentionMinutes("");
    setImmediateDeletion(false);
    setFirstName("");
    setLastName("");
    setOuResult("");
  };

  return (
    <div className="bg-white dark:bg-gray-900 text-black dark:text-white min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex justify-center p-12">
        <div className="w-full max-w-4xl space-y-6">
          <h1 className="text-3xl text-lime-600 italic mb-4 text-left">
            Suppression de Collaborateur
          </h1>

          {/* Bloc 1 : Recherche LDAP */}
          <div
            id="ldap-search"
            className="shadow-md bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center"
          >
            <div className="space-y-4">
              <LdapSearch
                setOuResult={setOuResult}
                setSelectedUserDn={(dn) => setSelectedUserDn(dn)}
              />
              <UserSelect userSelect={userSelect} />
              <OuResult ouResult={ouResult} />
            </div>
          </div>

          {/* Bloc 2 : Infos utilisateur et choix de la suppression */}
          <div
            id="deletion-options"
            className="shadow-md bg-gray-50 dark:bg-gray-800 rounded-lg p-6"
          >
            <div className="mb-4">
              <p>
                Utilisateur sélectionné : {firstName} {lastName}
              </p>
            </div>
            <div className="space-y-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={immediateDeletion}
                  onChange={(e) => setImmediateDeletion(e.target.checked)}
                  className="mr-2"
                />
                Supprimer immédiatement
              </label>
              {!immediateDeletion && (
                <div className="flex gap-4">
                  <label className="block flex-1">
                    Nombre de jours de rétention :
                    <input
                      type="number"
                      value={retentionDays}
                      onChange={(e) => setRetentionDays(e.target.value)}
                      className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-black dark:text-white"
                    />
                  </label>
                  <label className="block flex-1">
                    Minutes :
                    <input
                      type="number"
                      value={retentionMinutes}
                      onChange={(e) => setRetentionMinutes(e.target.value)}
                      className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-black dark:text-white"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Bloc 3 : Boutons d'action */}
          <div
            id="buttons-section"
            className="shadow-md bg-gray-50 dark:bg-gray-800 rounded-lg p-6"
          >
            <ApplyClearButtons onApply={handleDelete} onClear={handleClear} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormulaireSortieEffectifs;
