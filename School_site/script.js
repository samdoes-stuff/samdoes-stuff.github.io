// Mobile menu toggle
document.addEventListener("DOMContentLoaded", function() {
  const btn = document.getElementById("mobile-menu-btn");
  const menu = document.getElementById("mobile-menu");
  btn.addEventListener("click", function() {
    menu.style.display = (menu.style.display === "none" || menu.style.display === "") ? "block" : "none";
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function(e) {
      const targetId = this.getAttribute("href").substring(1);
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        window.scrollTo({
          top: target.offsetTop - 70,
          behavior: "smooth"
        });
        menu.style.display = "none";
      }
    });
  });

  // Simple contact form message
  const form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function(e) {
      e.preventDefault();
      document.getElementById("form-message").classList.remove("hidden");
      form.reset();
      setTimeout(() => {
        document.getElementById("form-message").classList.add("hidden");
      }, 5000);
    });
  }
});
