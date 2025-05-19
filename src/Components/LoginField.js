import React, { useEffect, useState } from "react";

/**
 * Génère un loginName de base du type :
 *  - première lettre du prénom en minuscule
 *  - point
 *  - nom de famille en minuscule
 * Exemple : "Jean Dupont" => "j.dupont"
 */
const generateLoginName = (fName, lName) => {
  if (!fName || !lName) return "";
  return `${fName.charAt(0).toLowerCase()}.${lName.toLowerCase()}`;
};

/**
 * Vérifie côté serveur si le login complet (ex: "j.dupont@example.com")
 * existe déjà dans l'OU (ex: "administratifs").
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
 * Composant React pour la saisie du nom de session.
 *  - Reçoit firstName, lastName (qui peuvent parfois être inversés, ex. firstName=MENGUY, lastName=Josselin)
 *  - Force l'inversion s'il détecte un « faux » prénom en majuscules.
 *  - Génère un login : "j.dupont", "je.dupont", etc.
 */
export default function LoginField({
  firstName,
  lastName,
  newOu,
  setLoginName,
  setSelectedDomain,
}) {
  const [baseLoginName, setBaseLoginName] = useState("");
  const [selectedDomainLocal, setSelectedDomainLocal] = useState("@example.com");

  // Liste des domaines proposés
  const domains = ["@example.com", "@test.example.com"];

  useEffect(() => {
    const generateAndCheckLoginName = async () => {
      if (!firstName || !lastName || !newOu) {
        setBaseLoginName("");
        setLoginName("");
        return;
      }

      // Inversion si firstName semble être un nom (tout en majuscules)
      let actualFirstName = firstName;
      let actualLastName = lastName;

      if (
        firstName === firstName.toUpperCase() &&
        lastName.charAt(0) === lastName.charAt(0).toUpperCase() &&
        lastName.substring(1) !== lastName.substring(1).toUpperCase()
      ) {
        [actualFirstName, actualLastName] = [lastName, firstName];
      }

      let loginCandidate = generateLoginName(actualFirstName, actualLastName);

      let exists = await checkLoginNameExists(loginCandidate, selectedDomainLocal, newOu);

      let lettersToUse = 1;
      while (exists) {
        lettersToUse++;
        if (lettersToUse <= actualFirstName.length) {
          loginCandidate =
            actualFirstName.substring(0, lettersToUse).toLowerCase() +
            "." +
            actualLastName.toLowerCase();
        } else {
          const randomDigit = Math.floor(Math.random() * 10);
          loginCandidate =
            actualFirstName.toLowerCase() + "." + actualLastName.toLowerCase() + randomDigit;
        }
        exists = await checkLoginNameExists(loginCandidate, selectedDomainLocal, newOu);
      }

      setBaseLoginName(loginCandidate);
      setLoginName(loginCandidate);
    };

    generateAndCheckLoginName();
  }, [firstName, lastName, newOu, selectedDomainLocal, setLoginName]);

  const handleDomainChange = (e) => {
    const newDomain = e.target.value;
    setSelectedDomainLocal(newDomain);
    setSelectedDomain(newDomain);
  };

  return (
    <div className="relative grid grid-cols-1 mt-4">
      <label
        htmlFor="loginName"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Nom d&apos;ouverture de session :
      </label>
      <div className="flex items-center mt-2">
        <input
          type="text"
          id="loginName"
          value={baseLoginName}
          readOnly
          className="h-[40px] rounded-[7px] border border-gray-300 dark:border-gray-600 
                     dark:bg-gray-700 dark:text-white text-gray-900 text-sm pl-3 w-full bg-transparent"
        />
        <select
          value={selectedDomainLocal}
          onChange={handleDomainChange}
          className="h-[40px] rounded-[7px] border border-gray-300 dark:border-gray-600 
                     text-gray-900 dark:text-white text-sm pl-2 pr-2 ml-2 bg-white dark:bg-gray-700"
        >
          {domains.map((domainOption) => (
            <option key={domainOption} value={domainOption}>
              {domainOption}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
