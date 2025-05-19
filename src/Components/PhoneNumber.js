import React from "react";

const PhoneNumber = ({
  hasPhone,
  setHasPhone,
  phoneNumber,
  setPhoneNumber,
}) => (
  <>
    <div className="mt-4">
      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          La personne a-t-elle un numéro de téléphone ?
        </legend>
        <div className="flex gap-4 mt-2">
          <div>
            <input
              type="radio"
              id="hasPhoneYes"
              name="hasPhone"
              value="yes"
              className="border rounded scale-150 dark:border-gray-600"
              onChange={() => setHasPhone(true)}
              checked={hasPhone === true}
            />
            <label
              className="pl-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              htmlFor="hasPhoneYes"
            >
              Oui
            </label>
          </div>
          <div>
            <input
              type="radio"
              id="hasPhoneNo"
              name="hasPhone"
              value="no"
              className="border rounded scale-150 dark:border-gray-600"
              onChange={() => setHasPhone(false)}
              checked={hasPhone === false}
            />
            <label
              className="pl-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              htmlFor="hasPhoneNo"
            >
              Non
            </label>
          </div>
        </div>
      </fieldset>
    </div>
    {hasPhone && (
      <div className="mt-4 grid grid-cols-1 gap-4">
        <div>
          <label
            htmlFor="phoneNumber"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Numéro de téléphone :
          </label>
          <input
            type="text"
            id="phoneNumber"
            placeholder="Entrez le numéro de téléphone..."
            className="h-[40px] mt-2 rounded-[7px] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-50 dark:bg-gray-700"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>
      </div>
    )}
  </>
);

export default PhoneNumber;
