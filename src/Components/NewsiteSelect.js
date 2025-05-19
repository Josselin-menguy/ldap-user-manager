import React, { useEffect } from "react";

const NewSiteSelect = ({
  selectedSite,
  setSelectedSite,
  loadOffice365OUsForSite,
}) => {
  useEffect(() => {
    if (selectedSite) {
      loadOffice365OUsForSite(selectedSite);
    }
  }, [selectedSite]);

  // Liste générique de sites
  const sites = ["Site A", "Site B", "Site C"];

  return (
    <div className="mt-4">
      <label
        htmlFor="newSiteSelect"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-left"
      >
        Nouveau site :
      </label>
      <select
        id="newSiteSelect"
        value={selectedSite}
        onChange={(e) => {
          setSelectedSite(e.target.value);
          loadOffice365OUsForSite(e.target.value);
        }}
        className="h-[40px] mt-2 rounded-[7px] border border-gray-300 dark:border-gray-600
                   text-gray-900 dark:text-white text-left text-sm focus:ring-blue-500
                   focus:border-blue-500 block w-full p-2.5 bg-gray-50 dark:bg-gray-700"
      >
        <option value="">Sélectionnez un site</option>
        {sites.map((site) => (
          <option key={site} value={site}>
            {site}
          </option>
        ))}
      </select>
    </div>
  );
};

export default NewSiteSelect;
