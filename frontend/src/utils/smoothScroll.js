// Smooth scroll utility function
export const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId);
  if (element) {
    const offsetTop = element.offsetTop - 80; // Account for fixed navbar
    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    });
  }
};

// Handle anchor link clicks
export const handleAnchorClick = (e, sectionId) => {
  e.preventDefault();
  scrollToSection(sectionId);
};
