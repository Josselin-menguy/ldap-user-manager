import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-lime-700 dark:border-lime-500 border-t-transparent"></div>
        <p className="mt-4 text-lg text-lime-700 dark:text-lime-500">Chargement...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;