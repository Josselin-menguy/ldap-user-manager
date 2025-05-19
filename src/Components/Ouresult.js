import React from "react";

const OuResult = ({ ouResult }) => (
  <div className="mt-4 grid grid-cols-1 gap-4">
    <div>
      <label
        htmlFor="ouResult"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-left"
      >
        Statut de l'utilisateur :
      </label>
      <input
        type="text"
        id="ouResult"
        value={ouResult}
        readOnly
        className="h-[40px] mt-2 rounded-[7px] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-50 dark:bg-gray-700"
      />
    </div>
  </div>
);

export default OuResult;
