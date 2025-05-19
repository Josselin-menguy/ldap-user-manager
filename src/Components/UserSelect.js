import React from "react";

const UserSelect = ({ userSelect }) => (
  <div
    id="results"
    className={`relative mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4 ${
      userSelect.length === 1 ? "hidden" : ""
    }`}
  >
    {userSelect.map((user, index) => {
      const details = extractDetails(user.dn);
      return (
        <div
          key={index}
          className="border border-gray-300 p-4 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-300"
        >
          {details.cn} ({details.ou})
        </div>
      );
    })}
  </div>
);

const extractDetails = (dn) => {
  try {
    const cnMatch = dn.match(/CN=([^,]+)/);
    const ouMatch = dn.match(/OU=([^,]+)/);

    if (!cnMatch || !ouMatch) {
      throw new Error("DN format incorrect: " + dn);
    }

    return {
      cn: cnMatch ? cnMatch[1] : "",
      ou: ouMatch ? ouMatch[1] : "",
    };
  } catch (error) {
    console.error("Erreur dans extractDetails:", error);
    return {
      cn: "",
      ou: "",
    };
  }
};

export default UserSelect;
