import React from "react";

const NewOuSelect = ({
  newOu,
  setNewOu,
  newOus,
  setNewOus,
  selectedSite,
  loadOffice365OUsForSite,
}) => {
  // Gestion du changement de sélection
  const handleSelectChange = (e) => {
    setNewOu(e.target.value);
  };

  return (
    <div className="mt-4">
      <label
        htmlFor="newOuSelect"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-left"
      >
        Statut de l'utilisateur :
      </label>
      <select
        id="newOuSelect"
        value={newOu}
        onChange={handleSelectChange}
        className="h-[40px] mt-2 rounded-[7px] border border-gray-300 dark:border-gray-600
                   text-gray-900 dark:text-white text-left text-sm focus:ring-blue-500
                   focus:border-blue-500 block w-full p-2.5 bg-gray-50 dark:bg-gray-700"
      >
        <option value="administratifs">Administratifs</option>
        <option value="enseignants">Enseignants</option>
        <option value="vacataires">Vacataires</option>
        <option value="honorariat">Honorariat</option>
      </select>
    </div>
  );
};

export default NewOuSelect;
