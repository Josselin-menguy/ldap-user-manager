import React, { useState, useEffect } from "react";

const ChangeSite = ({ selectedUserDn, setNewOus }) => {
  const [changeSite, setChangeSite] = useState(false);
  const [userOu, setUserOu] = useState("");
  const [selectedSite, setSelectedSite] = useState("");
  const [sites, setSites] = useState([
    { value: "SITE_A", label: "Site A" },
    { value: "SITE_B", label: "Site B" },
    { value: "SITE_C", label: "Site C" },
  ]);

  useEffect(() => {
    if (!changeSite && selectedUserDn) {
      fetchUserOu(selectedUserDn);
    }
  }, [changeSite, selectedUserDn]);

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
    setSelectedSite(event.target.value);
    loadOffice365OUsForSite(event.target.value);
  };

  return (
    <div className="mt-4">
      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          L'utilisateur change-t-il de service&nbsp;?
        </legend>
        <div className="flex gap-4 mt-2">
          <div>
            <input
              type="radio"
              id="changeSiteYes"
              name="changeSite"
              className="border rounded scale-150 dark:border-gray-600"
              checked={changeSite === true}
              onChange={() => setChangeSite(true)}
            />
            <label
              className="pl-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              htmlFor="changeSiteYes"
            >
              Oui
            </label>
          </div>
          <div>
            <input
              type="radio"
              id="changeSiteNo"
              name="changeSite"
              className="border rounded scale-150 dark:border-gray-600"
              checked={changeSite === false}
              onChange={() => setChangeSite(false)}
            />
            <label
              className="pl-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              htmlFor="changeSiteNo"
            >
              Non
            </label>
          </div>
        </div>
        {changeSite && (
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
        )}
        {!changeSite && userOu && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              OU de l'utilisateur : {userOu}
            </p>
          </div>
        )}
      </fieldset>
    </div>
  );
};

export default ChangeSite;
