import React, { useState, useEffect } from "react";

const NewDescription = ({ setFinalDescription, userStatus }) => {
  // États pour la fonction (département) et le type de contrat
  const [department, setDepartment] = useState("");
  const [contractType, setContractType] = useState("");

  const contractTypes = [
    "CDI",
    "CDD",
    "CDDU",
    "ALTERNANT / APPRENTI",
    "INTERIMAIRE",
    "STAGIAIRE",
  ];

  // Mapping du statut de l'utilisateur vers le rôle souhaité
  const roleMapping = {
    administratifs: "ADMINISTRATIF",
    enseignants: "ENSEIGNANT",
    vacataires: "VACATAIRE",
    honorariat: "HONORAIRE",
  };

  // On convertit userStatus en minuscules, puis on cherche dans le mapping
  const role = userStatus ? roleMapping[userStatus.toLowerCase()] || "" : "";

  // À chaque changement, on reconstruit la description
  useEffect(() => {
    const description = `${role} / ${department.toUpperCase()} / ${contractType}`;
    setFinalDescription(description);
  }, [role, department, contractType, setFinalDescription]);

  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Description :
      </label>
      <div className="grid grid-cols-1 gap-4">

        {/* Affichage du rôle sélectionné - même style que "Statut de l'utilisateur" */}
        <div className="grid grid-cols-1 gap-1">
          <label
            htmlFor="roleSelected"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Rôle :
          </label>
          <input
            type="text"
            id="roleSelected"
            readOnly
            value={role || "Aucun"}
            className="h-[40px] mt-2 rounded-[7px] border border-gray-300 dark:border-gray-600
                       text-gray-900 dark:text-white text-left text-sm focus:ring-blue-500
                       focus:border-blue-500 block w-full p-2.5 bg-gray-50 dark:bg-gray-700"
          />
        </div>

        {/* Champ pour la fonction / département */}
        <div className="grid grid-cols-1 gap-1">
          <label
            htmlFor="fonction"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Fonction :
          </label>
          <input
            type="text"
            id="fonction"
            placeholder="Fonction"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="h-[40px] mt-2 rounded-[7px] border border-gray-300 dark:border-gray-600
                       text-gray-900 dark:text-white text-sm focus:ring-blue-500 focus:border-blue-500
                       block w-full p-2.5 bg-gray-50 dark:bg-gray-700"
          />
        </div>

        {/* Sélection du type de contrat */}
        <div className="grid grid-cols-1 gap-1">
          <label
            htmlFor="contract"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Type de contrat :
          </label>
          <select
            id="contract"
            value={contractType}
            onChange={(e) => setContractType(e.target.value)}
            className="h-[40px] mt-2 rounded-[7px] border border-gray-300 dark:border-gray-600
                       text-gray-900 dark:text-white text-sm focus:ring-blue-500 focus:border-blue-500
                       block w-full p-2.5 bg-gray-50 dark:bg-gray-700"
          >
            <option value="" disabled>
              Choisir un type de contrat
            </option>
            {contractTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

      </div>
    </div>
  );
};

export default NewDescription;
