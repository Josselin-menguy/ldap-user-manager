import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import LdapSearch from "./LdapSearch";
import UserSelect from "./UserSelect";
import OuResult from "./Ouresult";
import ChangeSite from "./ChangeSite";
import NewSiteSelect from "./NewsiteSelect";
import NewOuSelect from "./NewOuSelect";
import NewDescription from "./NewDescription";
import NewOffice from "./NewOffice";
import PhoneNumber from "./PhoneNumber";
import LoginField from "./LoginField";
import ManagerField from "./ManagerField";
import GroupField from "./GroupField";
import ApplyClearButtons from "./ApplyClearButtons";

/**
 * Composant principal gérant toute la logique pour Home
 */
const Home = () => {
  // 1. États pour la recherche / affichage LDAP
  const [query, setQuery] = useState("");
  const [ouResult, setOuResult] = useState("");
  const [userSelect, setUserSelect] = useState([]);
  const [selectedUserDn, setSelectedUserDn] = useState("");

  // 2. États pour la configuration du site/OU
  const [changeSite, setChangeSite] = useState(false);
  const [newOu, setNewOu] = useState("administratifs");
  const [newOus, setNewOus] = useState([]);
  const [currentSite, setCurrentSite] = useState("");
  const [mainOu, setMainOu] = useState("");

  // 3. États pour les infos utilisateurs
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // 4. États pour la description et l’office
  const [newDescription, setNewDescription] = useState("");
  const [newOffice, setNewOffice] = useState("");

  // 5. Gestion du téléphone
  const [hasPhone, setHasPhone] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  // 6. États pour l’authentification (loginName + domaine)
  const [loginName, setLoginName] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("@example.com");

  // 7. Manager
  const [managerDn, setManagerDn] = useState("");

  // 8. Groupes
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [applicationGroups, setApplicationGroups] = useState([]);
  const [diffusionGroups, setDiffusionGroups] = useState([]);

  // A. Recherche LDAP quand la variable query change
  useEffect(() => {
    if (query.length > 1) {
      fetchUsers(query);
    }
  }, [query]);

  // B. Récupérer les détails quand selectedUserDn change
  useEffect(() => {
    if (selectedUserDn) {
      const details = extractDetails(selectedUserDn);
      setFirstName(details.firstName);
      setLastName(details.lastName);
    }
  }, [selectedUserDn]);

  // C. handleApply : Envoi des données au backend
  const handleApply = () => {
    if (!selectedUserDn || !newOu || !mainOu) {
      alert("Veuillez sélectionner un utilisateur, une nouvelle OU et un OU principal.");
      return;
    }

    const fullName = firstName + " " + lastName;

    const allSelectedGroups = [
      ...selectedGroups,
      ...applicationGroups,
      ...diffusionGroups,
    ];

    const data = {
      dn: selectedUserDn,
      fullName: fullName,
      new_ou: newOu,
      main_ou: mainOu,
      newDescription,
      newOffice,
      newPhoneNumber: phoneNumber,
      loginName,
      domain: selectedDomain,
      managerDn,
      memberOf: allSelectedGroups,
    };

    fetch("/api/apply_changes", {
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
        }
      })
      .catch((error) =>
        console.error("Erreur lors de la modification de l'OU :", error)
      );
  };

  // D. handleClear : Réinitialiser tous les champs
  const handleClear = () => {
    setQuery("");
    setUserSelect([]);
    setSelectedGroups([]);
    setApplicationGroups([]);
    setDiffusionGroups([]);
    setLoginName("");
    setSelectedDomain("@example.com");
    setManagerDn("");
    setNewDescription("");
    setNewOffice("");
    setNewOu("administratifs");
    setNewOus([]);
    setHasPhone(false);
    setPhoneNumber("");
    setSelectedUserDn("");
    setCurrentSite("");
    setChangeSite(false);
    setMainOu("");
    setFirstName("");
    setLastName("");
    setOuResult("");
  };

  // E. fetchUsers : Appel à /api/search_user
  const fetchUsers = (searchQuery) => {
    const url = new URL("/api/search_user", window.location.href);
    url.searchParams.append("query", searchQuery);

    fetch(url)
      .then(async (response) => {
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          setUserSelect(data);

          // Initialise mainOu avec le premier résultat
          if (data.length > 0) {
            const firstUserDetails = extractDetails(data[0].dn);
            setMainOu(firstUserDetails.ou);
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des utilisateurs :", error);
          console.error("Response text:", text);
        }
      })
      .catch((error) =>
        console.error("Erreur lors de la récupération des utilisateurs :", error)
      );
  };

  // F. extractDetails : Récupère firstName, lastName, ou, site depuis le DN
  const extractDetails = (dn) => {
    try {
      const cnMatch = dn.match(/CN=([^,]+)/);
      const ouMatch = dn.match(/OU=([^,]+)/g);
      const ouList = ouMatch ? ouMatch.map((match) => match.replace("OU=", "")) : [];
      const siteMatch = dn.match(/OU=\\#([^,]+)/);
      const site = siteMatch ? siteMatch[1] : "UNKNOWN";

      let firstNameVal = "";
      let lastNameVal = "";

      if (cnMatch) {
        const nameParts = cnMatch[1].split(" ");
        if (nameParts.length >= 2) {
          firstNameVal = nameParts[0];
          lastNameVal = nameParts.slice(1).join(" ");
        }
      }

      return {
        firstName: firstNameVal,
        lastName: lastNameVal,
        ou: ouList.join(", "),
        site,
      };
    } catch (error) {
      console.error("Erreur lors de l'extraction des détails :", error);
      return {
        firstName: "",
        lastName: "",
        ou: "",
        site: "UNKNOWN",
      };
    }
  };

  // G. loadOffice365OUsForSite : Récupère la liste des OUs pour un site donné
  const loadOffice365OUsForSite = (site) => {
    if (!site) {
      setNewOus([]);
      return;
    }
    fetch(`/api/get_office365_ous?site=${encodeURIComponent(site)}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Erreur HTTP ! Statut : ${response.status}`);
        }
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Réponse non-JSON reçue !");
        }
        return response.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.office365_ous)) {
          setNewOus(data.office365_ous);
        } else {
          setNewOus([]);
        }
      })
      .catch(() => {
        setNewOus([]);
      });
  };

  // H. useEffect : Récupère les sous-OUs quand on a un selectedUserDn et qu'on ne change pas de site
  useEffect(() => {
    if (!changeSite && selectedUserDn) {
      fetch(`/api/get_user_site_ous?dn=${encodeURIComponent(selectedUserDn)}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          if (data.office365_ous) {
            setNewOus(data.office365_ous);
          } else {
            setNewOus([]);
          }
        })
        .catch(() =>
          setNewOus([])
        );
    }
  }, [changeSite, selectedUserDn]);

  // I. useEffect : charger OUs pour le site actuel si on ne change pas de site
  useEffect(() => {
    if (currentSite && !changeSite) {
      loadOffice365OUsForSite(currentSite);
    }
  }, [currentSite, changeSite]);

  // J. Rendu principal
  return (
    <div className="bg-white dark:bg-gray-900 text-black dark:text-white min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex justify-center p-12">
        <div className="w-full max-w-4xl space-y-6">
          <h1 className="text-3xl text-lime-600 italic mb-4 text-left">
            Mouvement de Personnel
          </h1>
          <div className="space-y-6 w-full max-w-4xl">
            {/* Bloc Recherche LDAP */}
            <div
              id="ldap-search"
              className="shadow-md bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mx-auto text-center"
            >
              <div className="space-y-4">
                <LdapSearch
                  setOuResult={setOuResult}
                  setSelectedUserDn={(dn) => {
                    setSelectedUserDn(dn);
                    // Récupérer l’OU de l’utilisateur choisi
                    fetch(`/api/get_user_ou?dn=${encodeURIComponent(dn)}`)
                      .then((response) => {
                        if (!response.ok) {
                          throw new Error(
                            `HTTP error! Status: ${response.status}`
                          );
                        }
                        return response.json();
                      })
                      .then((data) => {
                        if (data.ou) {
                          setCurrentSite(data.ou);
                          setMainOu(data.ou);
                        }
                      })
                      .catch(() =>
                        setCurrentSite("")
                      );
                  }}
                />
                <UserSelect userSelect={userSelect} />
                <OuResult ouResult={ouResult} />
              </div>
            </div>

            {/* Bloc Site et OU */}
            <div
              id="ou-section"
              className="shadow-md bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mx-auto"
            >
              <ChangeSite
                selectedUserDn={selectedUserDn}
                setNewOus={setNewOus}
                setChangeSite={setChangeSite}
              />
              {changeSite && (
                <NewSiteSelect
                  selectedSite={currentSite}
                  setSelectedSite={setCurrentSite}
                  loadOffice365OUsForSite={loadOffice365OUsForSite}
                />
              )}
              <NewOuSelect
                newOu={newOu}
                setNewOu={setNewOu}
                newOus={newOus}
                setNewOus={setNewOus}
                selectedSite={changeSite ? currentSite : ""}
                loadOffice365OUsForSite={loadOffice365OUsForSite}
              />
            </div>

            {/* Bloc Description, Office, Phone, Login, Manager */}
            <div
              id="new-ou-section"
              className="shadow-md bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mx-auto"
            >
              <NewDescription setFinalDescription={setNewDescription} userStatus={newOu} />
              <NewOffice newOffice={newOffice} setNewOffice={setNewOffice} />
              <PhoneNumber
                hasPhone={hasPhone}
                setHasPhone={setHasPhone}
                phoneNumber={phoneNumber}
                setPhoneNumber={setPhoneNumber}
              />
              <LoginField
                firstName={firstName}
                lastName={lastName}
                setLoginName={setLoginName}
                setSelectedDomain={setSelectedDomain}
                currentOu={mainOu}
                newOu={newOu}
              />
              <ManagerField setManagerDn={setManagerDn} />
            </div>

            {/* Bloc Groupes et Boutons */}
            <div
              id="groups-section"
              className="shadow-md bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mx-auto"
            >
              <GroupField
                setSelectedGroups={setSelectedGroups}
                setApplicationGroups={setApplicationGroups}
                setDiffusionGroups={setDiffusionGroups}
              />
              <ApplyClearButtons onApply={handleApply} onClear={handleClear} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
