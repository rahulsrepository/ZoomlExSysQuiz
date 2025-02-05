// Theme handling
document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = document.getElementById("theme-icon");

  // Check for saved theme preference or default to 'light'
  const savedTheme = localStorage.getItem("theme") || "light";
  setTheme(savedTheme);

  // Theme toggle click handler
  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  });

  // Function to set theme
  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    // Update icon
    if (theme === "dark") {
      themeIcon.classList.remove("bi-moon-fill");
      themeIcon.classList.add("bi-sun-fill");
    } else {
      themeIcon.classList.remove("bi-sun-fill");
      themeIcon.classList.add("bi-moon-fill");
    }
  }
});

