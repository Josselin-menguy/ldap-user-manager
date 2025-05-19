import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import LoadingSpinner from "./LoadingSpinner";

/**
 * Composant de route privée qui vérifie l'authentification
 * avant d'afficher le contenu protégé
 */
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isAuthChecked } = useContext(AuthContext);
  const location = useLocation();

  // ⏳ Afficher le spinner pendant la vérification
  if (!isAuthChecked) {
    return <LoadingSpinner />;
  }

  // 🔒 Rediriger vers la page de connexion si non authentifié
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // ✅ Rendre le composant protégé si authentifié
  return (
    <div className="container mx-auto px-4 py-8">
      {children}
    </div>
  );
};

export default PrivateRoute;