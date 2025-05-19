import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import NewSiteSelect from "./NewsiteSelect";
import NewOuSelect from "./NewOuSelect";
import NewDescription from "./NewDescription";
import NewOffice from "./NewOffice";
import PhoneNumber from "./PhoneNumber";
import LoginFieldEntree from "./LoginFieldEntree";
import ManagerField from "./ManagerField";
import GroupField from "./GroupField";
import ApplyClearButtons from "./ApplyClearButtons";
import { initDarkMode } from "../Darkmode";

/**
 * Formulaire de création d'un collaborateur.
 * Le collaborateur est créé à partir des informations saisies manuellement.
 */
const FormulaireEntreeCollaborateur = () => {
  useEffect(() => {
    initDarkMode();
  }, []);

  // États pour les infos collaborateur
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // États pour la configuration du site/OU
  const [newOu, setNewOu] = useState("administratifs");
  const [newOus, setNewOus] = useState([]);
  const [currentSite, setCurrentSite] = useState("");

  // États pour la description et l’office
  const [newDescription, setNewDescription] = useState("");
  const [newOffice, setNewOffice] = useState("");

  // Gestion du téléphone
  const [hasPhone, setHasPhone] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  // États pour le login et le domaine
  const [loginName, setLoginName] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("@example.com");

  // Manager
  const [managerDn, setManagerDn] = useState("");

  // Groupes
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [applicationGroups, setApplicationGroups] = useState([]);
  const [diffusionGroups, setDiffusionGroups] = useState([]);

  // État pour afficher le mot de passe généré
  const [generatedPassword, setGeneratedPassword] = useState("");

  // Fonction pour charger les OUs Office365 pour un site donné
  const loadOffice365OUsForSite = (site) => {
    if (!site) {
      setNewOus([]);
      return;
    }
    fetch(`/api/get_office365_ous?site=${encodeURIComponent(site)}`)
      .then((response) => {
        if (!response.ok) throw new Error(`Erreur HTTP ! Statut : ${response.status}`);
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
      .catch(() => setNewOus([]));
  };

  useEffect(() => {
    if (currentSite) {
      loadOffice365OUsForSite(currentSite);
    }
  }, [currentSite]);

  // handleApply : Préparer, envoyer les données pour créer l'utilisateur et afficher le mot de passe généré
  const handleApply = () => {
    if (!firstName || !lastName || !newOu) {
      alert("Veuillez remplir les champs obligatoires : Prénom, Nom et OU de création.");
      return;
    }
    const fullName = `${firstName} ${lastName}`;
    const allSelectedGroups = [
      ...selectedGroups,
      ...applicationGroups,
      ...diffusionGroups,
    ];
    const data = {
      fullName,
      firstName,
      lastName,
      new_ou: newOu,
      newDescription,
      newOffice,
      newPhoneNumber: phoneNumber,
      loginName,
      domain: selectedDomain,
      managerDn,
      memberOf: allSelectedGroups,
      site: currentSite,
    };
    fetch("/api/create_user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.password) {
          setGeneratedPassword(result.password);
        } else if (result.error) {
          alert("Erreur lors de la création : " + result.error);
        }
      })
      .catch(() => {});
  };

  // handleClear : Réinitialiser tous les champs
  const handleClear = () => {
    setFirstName("");
    setLastName("");
    setNewOu("administratifs");
    setNewOus([]);
    setCurrentSite("");
    setNewDescription("");
    setNewOffice("");
    setHasPhone(false);
    setPhoneNumber("");
    setLoginName("");
    setSelectedDomain("@example.com");
    setManagerDn("");
    setSelectedGroups([]);
    setApplicationGroups([]);
    setDiffusionGroups([]);
    setGeneratedPassword("");
  };

  return (
    <div className="bg-white dark:bg-gray-900 text-black dark:text-white min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex justify-center p-12">
        <div className="w-full max-w-4xl space-y-6">
          <h1 className="text-3xl text-lime-600 italic mb-4 text-left">
            Formulaire Entrée Collaborateur
          </h1>
          <div className="space-y-6 w-full max-w-4xl">
            {/* Bloc 1 : Informations Collaborateur */}
            <div className="shadow-md bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium mb-1"
                  >
                    Prénom :
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full h-10 pl-3 border rounded-md bg-white dark:bg-gray-700 dark:text-white"
                    placeholder="Entrez le prénom"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium mb-1"
                  >
                    Nom :
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full h-10 pl-3 border rounded-md bg-white dark:bg-gray-700 dark:text-white"
                    placeholder="Entrez le nom"
                  />
                </div>
              </div>
            </div>

            {/* Bloc 2 : Site et OU */}
            <div className="shadow-md bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mx-auto">
              <NewSiteSelect
                selectedSite={currentSite}
                setSelectedSite={(site) => setCurrentSite(site)}
                loadOffice365OUsForSite={loadOffice365OUsForSite}
              />
              <NewOuSelect
                newOu={newOu}
                setNewOu={setNewOu}
                newOus={newOus}
                setNewOus={setNewOus}
                selectedSite={currentSite}
                loadOffice365OUsForSite={loadOffice365OUsForSite}
              />
            </div>

            {/* Bloc 3 : Description, Office, Téléphone, Login, Manager */}
            <div className="shadow-md bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mx-auto">
              <NewDescription
                setFinalDescription={setNewDescription}
                userStatus={newOu}
              />
              <NewOffice newOffice={newOffice} setNewOffice={setNewOffice} />
              <PhoneNumber
                hasPhone={hasPhone}
                setHasPhone={setHasPhone}
                phoneNumber={phoneNumber}
                setPhoneNumber={setPhoneNumber}
              />
              <LoginFieldEntree
                firstName={firstName}
                lastName={lastName}
                ou={newOu}
                setLoginName={setLoginName}
                setSelectedDomain={setSelectedDomain}
              />
              <ManagerField setManagerDn={setManagerDn} />
            </div>

            {/* Bloc 4 : Groupes et Boutons */}
            <div className="shadow-md bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mx-auto">
              <GroupField
                setSelectedGroups={setSelectedGroups}
                setApplicationGroups={setApplicationGroups}
                setDiffusionGroups={setDiffusionGroups}
              />
              <ApplyClearButtons
                onApply={handleApply}
                onClear={handleClear}
                disabled={!currentSite}
              />
            </div>
          </div>

          {/* Affichage du mot de passe généré */}
          {generatedPassword && (
            <div className="mt-4 p-4 border border-green-500 bg-green-100 dark:bg-green-800 text-center rounded">
              <strong>Mot de passe généré :</strong> {generatedPassword}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormulaireEntreeCollaborateur;
