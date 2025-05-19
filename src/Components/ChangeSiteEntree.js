import React, { useState, useEffect } from "react";

const ChangeSite = ({ selectedUserDn, setNewOus }) => {
  const [userOu, setUserOu] = useState("");
  const [selectedSite, setSelectedSite] = useState("");
  const [sites, setSites] = useState([
    { value: "SITE_A", label: "Site A" },
    { value: "SITE_B", label: "Site B" },
    { value: "SITE_C", label: "Site C" },
  ]);

  useEffect(() => {
    if (selectedUserDn) {
      fetchUserOu(selectedUserDn);
    }
  }, [selectedUserDn]);

  const fetchUserOu = (dn) => {
    fetch(`/api/get_user_ou?dn=${encodeURIComponent(dn)}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.ou) {
          setUserOu(data.ou);
          loadOffice365OUsForSite(data.ou);
        } else {
          setUserOu("");
        }
      })
      .catch((error) =>
        console.error("Erreur lors de la récupération de l'OU:", error)
      );
  };

  const loadOffice365OUsForSite = (site) => {
    fetch(`/api/get_office365_ous?site=${encodeURIComponent(site)}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.office365_ous && data.office365_ous.length > 0) {
          setNewOus(data.office365_ous);
        } else {
          setNewOus([]);
        }
      })
      .catch((error) =>
        console.error("Erreur lors du chargement des OUs :", error)
      );
  };

  const handleSiteChange = (event) => {
    const site = event.target.value;
    setSelectedSite(site);
    loadOffice365OUsForSite(site);
  };

  return (
    <div className="mt-4">
      <label
        htmlFor="siteSelect"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Sélectionnez un site :
      </label>
      <select
        id="siteSelect"
        className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mt-2"
        value={selectedSite}
        onChange={handleSiteChange}
      >
        <option value="" disabled>
          Choisir un site
        </option>
        {sites.map((site) => (
          <option key={site.value} value={site.value}>
            {site.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ChangeSite;
