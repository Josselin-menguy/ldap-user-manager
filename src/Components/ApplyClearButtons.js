import React from "react";

const ApplyClearButtons = ({ onApply, onClear }) => (
  <div className="flex gap-4 mt-4">
    <button
      id="applyButton"
      className="w-fit px-5 py-3 rounded-[7px] bg-lime-700 text-white hover:bg-lime-600 dark:bg-lime-500 dark:hover:bg-lime-400"
      onClick={onApply}
    >
      Appliquer
    </button>
    <button
      id="clearButton"
      className="w-fit px-5 py-3 rounded-[7px] bg-red-600 text-white hover:bg-red-500 dark:bg-red-500 dark:hover:bg-red-400"
      onClick={onClear}
    >
      Effacer
    </button>
  </div>
);

export default ApplyClearButtons;
