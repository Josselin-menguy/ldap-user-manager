import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("isAuthenticated") === "true";
  });
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/check_auth", {
          method: "GET",
          credentials: "include",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          setIsAuthenticated(false);
          localStorage.removeItem("isAuthenticated");
          return;
        }

        const data = await response.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
          localStorage.setItem("isAuthenticated", "true");
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem("isAuthenticated");
        }
      } catch (error) {
        console.error("Erreur de vérification de session :", error);
        setIsAuthenticated(false);
        localStorage.removeItem("isAuthenticated");
      } finally {
        setIsAuthChecked(true);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        credentials: "include",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Échec de la connexion");
      }

      if (data.message === "Connexion réussie") {
        setIsAuthenticated(true);
        localStorage.setItem("isAuthenticated", "true");
        return true;
      } else {
        throw new Error("Réponse serveur invalide");
      }
    } catch (error) {
      console.error("Erreur de connexion:", error);
      setIsAuthenticated(false);
      localStorage.removeItem("isAuthenticated");
      throw error;
    }
  };

  const logout = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error("Échec de la déconnexion");
      }

      await response.json();
    } catch (error) {
      console.error("Erreur de déconnexion :", error);
    } finally {
      setIsAuthenticated(false);
      localStorage.removeItem("isAuthenticated");
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isAuthChecked, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;