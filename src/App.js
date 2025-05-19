import React, { useEffect, useContext, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

// 📝 Composants de pages
import Login from "./login";
import Accueil from "./Components/Accueil";
import MouvementInterneAdmin from "./Components/MouvementInterneAdmin";
import MouvementInterneEnseignant from "./Components/MouvementInterneEnseignant";
import FormulaireEntreeCollaborateur from "./Components/FormulaireEntreeCollaborateur";
import FormulaireSortieEffectifs from "./Components/FormulaireSortieEffectifs";
import Navbar from "./Components/Navbar";
import LoadingSpinner from "./Components/LoadingSpinner";

// 🔐 Contexte d'authentification et route privée
import { AuthContext, AuthProvider } from "./AuthContext";
import PrivateRoute from "./Components/PrivateRoute";

// 🌓 Gestion du mode sombre
import { initDarkMode } from "./Darkmode";

// 📱 Composant principal de l'application
function App() {
  useEffect(() => {
    initDarkMode();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 text-black dark:text-white min-h-screen">
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </div>
  );
}

// 🔄 Nouveau composant pour gérer le chargement initial
function AppContent() {
  const { isAuthChecked } = useContext(AuthContext);

  if (!isAuthChecked) {
    return <LoadingSpinner />;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Content />
    </Suspense>
  );
}

// 📄 Composant de contenu principal
function Content() {
  const location = useLocation();
  const { isAuthenticated, isAuthChecked } = useContext(AuthContext);

  // ⏳ Attendre la vérification d'authentification
  if (!isAuthChecked) {
    return <LoadingSpinner />;
  }

  // 🎯 Masquer la navbar sur certaines pages
  const hideNavbar = location.pathname === "/login" || location.pathname === "/";

  return (
    <>
      {/* 📱 Affichage conditionnel de la navbar */}
      {!hideNavbar && isAuthenticated && <Navbar />}
      
      {/* 🛣️ Configuration des routes */}
      <Routes>
        {/* Page d'accueil - Redirection conditionnelle */}
        <Route 
          path="/" 
          element={isAuthenticated ? <Accueil /> : <Navigate to="/login" />} 
        />

        {/* Page de connexion */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/" /> : <Login />} 
        />

        {/* Routes protégées */}
        <Route
          path="/mouvement-interne-admin"
          element={
            <PrivateRoute>
              <MouvementInterneAdmin />
            </PrivateRoute>
          }
        />

        <Route
          path="/mouvement-interne-enseignant"
          element={
            <PrivateRoute>
              <MouvementInterneEnseignant />
            </PrivateRoute>
          }
        />

        <Route
          path="/formulaire-entree-collaborateur"
          element={
            <PrivateRoute>
              <FormulaireEntreeCollaborateur />
            </PrivateRoute>
          }
        />

        <Route
          path="/formulaire-sortie-effectifs"
          element={
            <PrivateRoute>
              <FormulaireSortieEffectifs />
            </PrivateRoute>
          }
        />

        {/* Route par défaut - Redirection vers l'accueil */}
        <Route 
          path="*" 
          element={<Navigate to="/" replace />} 
        />
      </Routes>
    </>
  );
}

export default App;