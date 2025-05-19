// Fonction pour initialiser le mode sombre en fonction des préférences utilisateur
export const initDarkMode = () => {
  const html = document.querySelector("html");
  const isLightOrAuto =
    localStorage.getItem("hs_theme") === "light" ||
    (localStorage.getItem("hs_theme") === "auto" &&
      !window.matchMedia("(prefers-color-scheme: dark)").matches);
  const isDarkOrAuto =
    localStorage.getItem("hs_theme") === "dark" ||
    (localStorage.getItem("hs_theme") === "auto" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  if (isLightOrAuto && html.classList.contains("dark")) {
    html.classList.remove("dark");
  } else if (isDarkOrAuto && html.classList.contains("light")) {
    html.classList.remove("light");
  } else if (isDarkOrAuto && !html.classList.contains("dark")) {
    html.classList.add("dark");
  } else if (isLightOrAuto && !html.classList.contains("light")) {
    html.classList.add("light");
  }
};

// Fonction pour basculer le mode sombre/clair et enregistrer la préférence dans localStorage
export const toggleDarkMode = () => {
  const html = document.querySelector("html");
  const currentTheme = localStorage.getItem("hs_theme") || "light";
  const newTheme = currentTheme === "light" ? "dark" : "light";

  // Appliquer la nouvelle classe 'dark' ou 'light'
  if (newTheme === "dark") {
    html.classList.add("dark");
  } else {
    html.classList.remove("dark");
  }

  // Stocker la préférence de l'utilisateur dans localStorage
  localStorage.setItem("hs_theme", newTheme);
};
