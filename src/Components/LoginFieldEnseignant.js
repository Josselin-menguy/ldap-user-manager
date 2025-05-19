import React, { useEffect, useState } from "react";

/**
 * Génère un loginName de base du type :
 * - première lettre du prénom en minuscule
 * - point
 * - nom de famille en minuscule
 * Exemple : "Jean Dupont" => "j.dupont"
 */
const generateLoginName = (firstName, lastName) => {
  if (!firstName || !lastName) return "";
  return `${firstName.charAt(0).toLowerCase()}.${lastName.toLowerCase()}`;
};

/**
 * Vérifie côté serveur si le login complet (ex: "j.dupont@example.com")
 * existe déjà dans l'OU concernée.
 * Retourne true s'il existe, false sinon.
 */
const checkLoginNameExists = async (loginName, domain, ou) => {
  const fullLogin = loginName + domain;

  try {
    const response = await fetch(
      `/api/check_login_name?loginName=${encodeURIComponent(fullLogin)}&ou=${encodeURIComponent(ou)}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
      }
    );

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.exists;
  } catch (error) {
    return false;
  }
};

/**
 * Composant React pour la génération du login lors de la création d'un compte enseignant.
 * Le login est construit de la manière suivante :
 * - Commence par "première lettre du prénom"."nom" (ex: "j.dupont")
 * - En cas de conflit, on ajoute progressivement plus de lettres du prénom (ex: "je.dupont", "jea.dupont", etc.)
 * - Si le prénom est entièrement utilisé, on ajoute un chiffre aléatoire.
 */
const LoginFieldEnseignant = ({
  firstName,
  lastName,
  ou, // OU dans lequel le compte sera créé
  setLoginName,
  setSelectedDomain,
}) => {
  const [baseLoginName, setBaseLoginName] = useState("");
  const [selectedDomainLocal, setLocalSelectedDomain] = useState("@example.com");

  // Liste des domaines proposés
  const domains = ["@example.com", "@test.example.com"];

  useEffect(() => {
    const generateAndCheckLoginName = async () => {
      if (!firstName || !lastName || !ou) {
        setBaseLoginName("");
        setLoginName("");
        return;
      }
      // Démarre avec 1 lettre du prénom + "." + nom
      let loginCandidate = generateLoginName(firstName, lastName);
      let exists = await checkLoginNameExists(loginCandidate, selectedDomainLocal, ou);
      let lettersToUse = 1;
      
      // Tant que le login existe, on augmente le nombre de lettres du prénom à utiliser
      while (exists) {
        lettersToUse++;
        if (lettersToUse <= firstName.length) {
          loginCandidate = firstName.substring(0, lettersToUse).toLowerCase() + "." + lastName.toLowerCase();
        } else {
          // Si le prénom est épuisé, ajoute un chiffre aléatoire
          loginCandidate = firstName.toLowerCase() + "." + lastName.toLowerCase() + Math.floor(Math.random() * 10);
        }
        exists = await checkLoginNameExists(loginCandidate, selectedDomainLocal, ou);
      }

      setBaseLoginName(loginCandidate);
      setLoginName(loginCandidate);
    };

    generateAndCheckLoginName();
  }, [firstName, lastName, ou, selectedDomainLocal, setLoginName]);

  const handleDomainChange = (e) => {
    const newDomain = e.target.value;
    setLocalSelectedDomain(newDomain);
    setSelectedDomain(newDomain);
  };

  return (
    <div className="relative grid grid-cols-1">
      <label htmlFor="loginFieldEnseignant" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Nom d'ouverture de compte :
      </label>
      <div className="flex items-center mt-2">
        <input
          type="text"
          id="loginFieldEnseignant"
          value={baseLoginName}
          readOnly
          className="h-10 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-gray-900 text-sm pl-3 w-full bg-transparent"
        />
        <select
          value={selectedDomainLocal}
          onChange={handleDomainChange}
          className="h-10 rounded-md border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm pl-2 pr-2 ml-2 bg-white dark:bg-gray-700"
        >
          {domains.map((domainOption, index) => (
            <option key={index} value={domainOption}>
              {domainOption}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default LoginFieldEnseignant;
