import React, { useState } from "react";

// Fonction pour obtenir le label mappé à partir d’un DN
const getLabelFromDN = (dn) => {
  const dnNormalized = dn.trim().toLowerCase();
  for (const label in GROUP_LABEL_MAP) {
    const mappedValues = GROUP_LABEL_MAP[label];
    if (mappedValues.some((val) => val.trim().toLowerCase() === dnNormalized)) {
      return label;
    }
  }
  return dn;
};

// Composant pour les Groupes d'Applications
const ApplicationGroups = ({ setSelectedGroups }) => {
  const applicationList = {
    "Application A": [
      "CN=_APP_A,OU=APPLICATIONS,OU=GROUPS,DC=example,DC=com",
    ],
    "Application B": [
      "CN=_APP_B,OU=APPLICATIONS,OU=GROUPS,DC=example,DC=com",
    ],
    "Application C": [
      "CN=_APP_C,OU=APPLICATIONS,OU=GROUPS,DC=example,DC=com",
    ],
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroupsState, setSelectedGroupsState] = useState([]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredOptions = Object.keys(applicationList).filter((key) =>
    key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectChange = (event) => {
    const selectedKey = event.target.value;
    const selectedDN = applicationList[selectedKey][0];
    if (!selectedGroupsState.some((group) => group.dn === selectedDN)) {
      const newGroup = { dn: selectedDN, label: selectedKey };
      const updated = [...selectedGroupsState, newGroup];
      setSelectedGroupsState(updated);
      setSelectedGroups(updated);
    }
  };

  const handleDeselect = (groupToRemove) => {
    const updated = selectedGroupsState.filter((item) => item.dn !== groupToRemove.dn);
    setSelectedGroupsState(updated);
    setSelectedGroups(updated);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Sélectionnez une application :
      </label>
      <input
        type="text"
        placeholder="Rechercher..."
        value={searchTerm}
        onChange={handleSearch}
        className="h-[40px] mt-2 rounded-[7px] border border-gray-300 dark:bg-gray-700 
                   dark:border-gray-600 dark:text-white pl-3 w-full bg-white text-black"
      />
      <select
        onChange={handleSelectChange}
        className="bg-white dark:bg-gray-700 dark:text-white border border-gray-300 
                   dark:border-gray-600 text-black text-sm rounded-lg focus:ring-blue-500 
                   focus:border-blue-500 block w-full p-2.5 mt-2"
        value=""
      >
        <option value="" disabled>
          Choisir une application
        </option>
        {filteredOptions.map((key) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </select>
      <div className="mt-4">
        <h3 className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Applications sélectionnées
        </h3>
        <ul>
          {selectedGroupsState.map((group, index) => (
            <li
              key={index}
              className="mt-2 cursor-pointer text-red-500 dark:text-red-300"
              onClick={() => handleDeselect(group)}
            >
              {group.label} (cliquer pour désélectionner)
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// Composant pour les Listes de Diffusion
const DiffusionGroups = ({ setSelectedGroups }) => {
  const diffusionList = {
    "Diffusion RH": [
      "CN=RH,OU=DIFFUSION,OU=GROUPS,DC=example,DC=com",
    ],
    "Diffusion IT": [
      "CN=IT,OU=DIFFUSION,OU=GROUPS,DC=example,DC=com",
    ],
    "Diffusion Communication": [
      "CN=COMM,OU=DIFFUSION,OU=GROUPS,DC=example,DC=com",
    ],
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDiffusionGroups, setSelectedDiffusionGroups] = useState([]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const filteredOptions = Object.keys(diffusionList).filter((key) =>
    key.toLowerCase().includes(searchTerm)
  );

  const handleSelectChange = (event) => {
    const selectedKey = event.target.value;
    const dn = diffusionList[selectedKey][0];
    if (!selectedDiffusionGroups.some((group) => group.dn === dn)) {
      const newGroup = { dn, label: selectedKey };
      const updated = [...selectedDiffusionGroups, newGroup];
      setSelectedDiffusionGroups(updated);
      setSelectedGroups(updated);
    }
  };

  const handleDeselect = (groupToRemove) => {
    const updated = selectedDiffusionGroups.filter((item) => item.dn !== groupToRemove.dn);
    setSelectedDiffusionGroups(updated);
    setSelectedGroups(updated);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Sélectionnez une liste de diffusion :
      </label>
      <input
        type="text"
        placeholder="Rechercher..."
        value={searchTerm}
        onChange={handleSearch}
        className="h-[40px] mt-2 rounded-[7px] border border-gray-300 
                   dark:bg-gray-700 dark:border-gray-600 dark:text-white pl-3 w-full bg-white text-black"
      />
      <select
        onChange={handleSelectChange}
        className="bg-white dark:bg-gray-700 dark:text-white border border-gray-300 
                   dark:border-gray-600 text-black text-sm rounded-lg focus:ring-blue-500 
                   focus:border-blue-500 block w-full p-2.5 mt-2"
        value=""
      >
        <option value="" disabled>
          Choisir une liste de diffusion
        </option>
        {filteredOptions.map((key) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </select>
      <div className="mt-4">
        <h3 className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Listes de diffusion sélectionnées
        </h3>
        <ul>
          {selectedDiffusionGroups.map((group, index) => (
            <li
              key={index}
              className="mt-2 cursor-pointer text-red-500 dark:text-red-300"
              onClick={() => handleDeselect(group)}
            >
              {group.label} (cliquer pour désélectionner)
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// Composant GroupField combinant les deux types de groupes
export default function GroupField({
  setSelectedGroups,
  setApplicationGroups,
  setDiffusionGroups,
}) {
  return (
    <div className="space-y-4">
      <ApplicationGroups setSelectedGroups={setApplicationGroups} />
      <DiffusionGroups setSelectedGroups={setDiffusionGroups} />
    </div>
  );
}
