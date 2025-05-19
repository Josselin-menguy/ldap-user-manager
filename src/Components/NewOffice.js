import React, { useState, useEffect } from "react";

const NewOffice = ({ setNewOffice }) => {
  const [site, setSite] = useState("");
  const [building, setBuilding] = useState("");
  const [floor, setFloor] = useState("");
  const [officeNumber, setOfficeNumber] = useState("");

  // Listes génériques pour les sites, bâtiments et étages
  const sites = ["Site A", "Site B", "Site C"];
  const buildings = [
    "Bâtiment 1",
    "Bâtiment 2",
    "Bâtiment 3",
    "Bâtiment 4",
    "Bâtiment 5",
    "Bâtiment 6",
    "Bâtiment 7",
    "Bâtiment 8",
    "Bâtiment 9",
    "Bâtiment 10",
  ];
  const floors = [
    "RDC",
    "1er étage",
    "2ème étage",
    "3ème étage",
    "4ème étage",
    "5ème étage",
    "6ème étage",
  ];

  useEffect(() => {
    // Construire la chaîne pour le bureau
    const office = `${site} / ${building} / Étage ${floor} / Bureau ${officeNumber}`;
    setNewOffice(office);
  }, [site, building, floor, officeNumber, setNewOffice]);

  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Nouveau bureau :
      </label>
      <div className="grid grid-cols-1 gap-4">
        <select
          value={site}
          onChange={(e) => setSite(e.target.value)}
          className="h-[40px] rounded-[7px] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-50 dark:bg-gray-700"
        >
          <option value="" disabled>
            Choisir un site
          </option>
          {sites.map((site) => (
            <option key={site} value={site}>
              {site}
            </option>
          ))}
        </select>
        <select
          value={building}
          onChange={(e) => setBuilding(e.target.value)}
          className="h-[40px] rounded-[7px] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-50 dark:bg-gray-700"
        >
          <option value="" disabled>
            Choisir un bâtiment
          </option>
          {buildings.map((building) => (
            <option key={building} value={building}>
              {building}
            </option>
          ))}
        </select>
        <select
          value={floor}
          onChange={(e) => setFloor(e.target.value)}
          className="h-[40px] rounded-[7px] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-50 dark:bg-gray-700"
        >
          <option value="" disabled>
            Choisir un étage
          </option>
          {floors.map((floor) => (
            <option key={floor} value={floor}>
              {floor}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Numéro de bureau"
          className="h-[40px] rounded-[7px] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-50 dark:bg-gray-700"
          value={officeNumber}
          onChange={(e) => setOfficeNumber(e.target.value)}
        />
      </div>
    </div>
  );
};

export default NewOffice;
