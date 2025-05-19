import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import LdapSearch from "./LdapSearch";
import UserSelect from "./UserSelect";
import OuResult from "./Ouresult";
import ChangeSite from "./ChangeSite";
import NewSiteSelect from "./NewsiteSelect";
import NewOuSelect from "./NewOuSelect";
import NewDescription from "./NewDescription";
import PhoneNumber from "./PhoneNumber";
import LoginField from "./LoginField";
import ManagerField from "./ManagerField";
import GroupField from "./GroupField";
import ApplyClearButtons from "./ApplyClearButtons";

const MouvementInterneEnseignant = () => {
  // États principaux
  const [query, setQuery] = useState("");
  const [ouResult, setOuResult] = useState("");
  const [userSelect, setUserSelect] = useState([]);
  const [selectedUserDn, setSelectedUserDn] = useState("");

  const [changeSite, setChangeSite] = useState(false);
  const [newOu, setNewOu] = useState("enseignants");
  const [newOus, setNewOus] = useState([]);
  const [currentSite, setCurrentSite] = useState("");
  const [mainOu, setMainOu] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [newDescription, setNewDescription] = useState("");
  const [newOffice, setNewOffice] = useState("");

  const [hasPhone, setHasPhone] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  const [loginName, setLoginName] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("@example.com");

  const [managerDn, setManagerDn] = useState("");

  const [selectedGroups, setSelectedGroups] = useState([]);
  const [applicationGroups, setApplicationGroups] = useState([]);
  const [diffusionGroups, setDiffusionGroups] = useState([]);

  // Effets pour récupérer les utilisateurs et extraire les détails
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

  useEffect(() => {
    if (!changeSite && selectedUserDn) {
      fetch(`/api/get_user_site_ous?dn=${encodeURIComponent(selectedUserDn)}`)
        .then((response) => response.json())
        .then((data) => {
          setNewOus(data.office365_ous || []);
        })
        .catch((error) =>
          console.error("Erreur récupération des sous-OUs :", error)
        );
    }
  }, [changeSite, selectedUserDn]);

  useEffect(() => {
    if (currentSite && !changeSite) {
      loadOffice365OUsForSite(currentSite);
    }
  }, [currentSite, changeSite]);

  // Fonction pour appliquer les changements
  const handleApply = () => {
    if (!selectedUserDn || !newOu || !mainOu) {
      alert("Veuillez sélectionner un utilisateur, une nouvelle OU et un OU principal.");
      return;
    }

    const allSelectedGroups = [
      ...selectedGroups,
      ...applicationGroups,
      ...diffusionGroups,
    ];

    const data = {
      dn: selectedUserDn,
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((resData) => {
        if (resData.message) {
          alert(resData.message);
        }
      })
      .catch((error) =>
        console.error("Erreur modification OU :", error)
      );
  };

  // Fonction pour réinitialiser le formulaire
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
    setNewOu("enseignants");
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

  // Fonction pour récupérer les utilisateurs en fonction de la requête
  const fetchUsers = (searchQuery) => {
    fetch(`/api/search_user?query=${searchQuery}`)
      .then((response) => response.json())
      .then((data) => {
        setUserSelect(data);
        if (data.length > 0) {
          const firstUserDetails = extractDetails(data[0].dn);
          setMainOu(firstUserDetails.ou);
        }
      })
      .catch((error) =>
        console.error("Erreur récupération utilisateurs :", error)
      );
  };

  // Fonction pour extraire les détails de l'utilisateur
  const extractDetails = (dn) => {
    try {
      const cnMatch = dn.match(/CN=([^,]+)/);
      const ouMatch = dn.match(/OU=([^,]+)/g);
      const ouList = ouMatch ? ouMatch.map((match) => match.replace("OU=", "")) : [];
      const siteMatch = dn.match(/OU=\\#([^,]+)/);
      return {
        firstName: cnMatch ? cnMatch[1].split(" ")[0] : "",
        lastName: cnMatch ? cnMatch[1].split(" ").slice(1).join(" ") : "",
        ou: ouList.join(", "),
        site: siteMatch ? siteMatch[1] : "UNKNOWN",
      };
    } catch (error) {
      return { firstName: "", lastName: "", ou: "", site: "UNKNOWN" };
    }
  };

  // Fonction pour charger les Office365 OUs pour un site donné
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
        return response.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.office365_ous)) {
          setNewOus(data.office365_ous);
        } else {
          setNewOus([]);
        }
      })
      .catch((error) => {
        setNewOus([]);
      });
  };

  return (
    <div className="bg-white dark:bg-gray-900 text-black dark:text-white min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex justify-center p-12">
        <div className="w-full max-w-4xl space-y-6">
          <h1 className="text-3xl text-lime-600 italic mb-4 text-left">
            Mouvement Interne Enseignant
          </h1>
          <div className="space-y-6 w-full max-w-4xl">
            {/* Bloc Recherche LDAP */}
            <div id="ldap-search" className="shadow-md bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mx-auto text-center">
              <LdapSearch setOuResult={setOuResult} setSelectedUserDn={setSelectedUserDn} />
              <UserSelect userSelect={userSelect} />
              <OuResult ouResult={ouResult} />
            </div>
          </div>
          {/* Bloc Site et OU */}
          <div id="ou-section" className="shadow-md bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mx-auto">
            <ChangeSite setNewOus={setNewOus} setChangeSite={setChangeSite} />
            {changeSite && (
              <NewSiteSelect
                selectedSite={currentSite}
                setSelectedSite={setCurrentSite}
                loadOffice365OUsForSite={loadOffice365OUsForSite}
              />
            )}
            <NewOuSelect newOu={newOu} setNewOu={setNewOu} newOus={newOus} />
          </div>
          {/* Bloc Description, Téléphone, Login, Manager */}
          <div id="new-ou-section" className="shadow-md bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mx-auto">
            <NewDescription 
              userStatus={newOu}
              setFinalDescription={setNewDescription}
            />
            <PhoneNumber
              hasPhone={hasPhone}
              setHasPhone={setHasPhone}
              phoneNumber={phoneNumber}
              setPhoneNumber={setPhoneNumber}
            />
            <LoginField
              firstName={firstName}
              lastName={lastName}
              currentOu={mainOu}  
              newOu={newOu}
              setLoginName={setLoginName}
              setSelectedDomain={setSelectedDomain}
            />
            <ManagerField setManagerDn={setManagerDn} />
          </div>
          {/* Bloc Groupes */}
          <div id="groups-section" className="shadow-md bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mx-auto">
            <GroupField
              setSelectedGroups={setSelectedGroups}
              setApplicationGroups={setApplicationGroups}
              setDiffusionGroups={setDiffusionGroups}
            />
          </div>
          <ApplyClearButtons onApply={handleApply} onClear={handleClear} />
        </div>
      </div>
    </div>
  );
};

export default MouvementInterneEnseignant;
