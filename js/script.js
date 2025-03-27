// Simulazione del caricamento di 2 secondi
document.addEventListener("DOMContentLoaded", () => {
    const loadingScreen = document.getElementById("loading-screen");
    const mainContent = document.getElementById("main-content");

    // Simulazione di un caricamento di 2 secondi
    setTimeout(() => {
        loadingScreen.style.display = "none"; // Nasconde la schermata di caricamento
        mainContent.style.display = "block"; // Mostra il contenuto principale
    }, 2800); // 2000 millisecondi = 2 secondi
});
document.addEventListener("DOMContentLoaded", () => {
    const navbar = document.querySelector(".navbar");

    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.section');

    const handleScroll = () => {
        sections.forEach((section) => {
            const container = section.querySelector('.container');
            const rect = section.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

            if (isVisible) {
                container.classList.add('active');
            } else {
                container.classList.remove('active');
            }
        });
    };

    window.addEventListener('scroll', handleScroll);
});
document.addEventListener('DOMContentLoaded', () => {
    const paragraphs = document.querySelectorAll('.content');

    const handleScroll = () => {
        const windowHeight = window.innerHeight;

        paragraphs.forEach((paragraph) => {
            const rect = paragraph.getBoundingClientRect();
            const triggerPoint = windowHeight * 0.75; // 20% dell'altezza del viewport

            if (rect.top <= triggerPoint) {
                // Attiva il paragrafo quando supera il 20% dell'altezza del viewport
                paragraph.style.opacity = 1;
                paragraph.style.transform = 'translateY(0)';
            } else {
                // Nasconde il paragrafo se è fuori dalla soglia
                paragraph.style.opacity = 0;
                paragraph.style.transform = 'translateY(50px)';
            }
        });
    };

    window.addEventListener('scroll', handleScroll);
});

document.addEventListener('DOMContentLoaded', () => {
    const banners = document.querySelectorAll('.banner');
    const section = document.getElementById('Navigazione');

    const handleScroll = () => {
        const threshold = window.innerHeight * 0.75; // 75% dell'altezza del viewport

        banners.forEach((banner) => {
            const rect = banner.getBoundingClientRect();

            // Verifica se il riquadro è visibile
            const isVisible = rect.top < threshold && rect.bottom > 0;

            if (isVisible) {
                banner.classList.add('visible'); // Aggiunge la classe per animare in entrata
            } else {
                banner.classList.remove('visible'); // Rimuove la classe per animare in uscita
            }
        });
    };

    // Cambia il colore dinamico dello sfondo in hover
    banners.forEach((banner) => {
        banner.addEventListener('mouseenter', () => {
            const hoverBg = banner.getAttribute('data-hover-bg');
            section.style.setProperty('--bg-color', hoverBg);
        });

        banner.addEventListener('mouseleave', () => {
            section.style.setProperty('--bg-color', 'rgba(0, 0, 0, 0.5)');
        });
    });

    // Aggiunge l'evento di scroll
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Controlla inizialmente
});

document.addEventListener('DOMContentLoaded', () => {
    const banners = document.querySelectorAll('.banner');
    const section = document.getElementById('Navigazione');

    banners.forEach((banner) => {
        banner.addEventListener('mouseenter', () => {
            // Ottiene il colore dinamico con trasparenza dal data-hover-bg
            const hoverBg = banner.getAttribute('data-hover-bg');
            section.style.setProperty('--bg-color', `${hoverBg}80`); // 80 indica trasparenza (~50%)
        });

        banner.addEventListener('mouseleave', () => {
            // Ripristina lo sfondo trasparente predefinito
            section.style.setProperty('--bg-color', 'rgba(0, 0, 0, 0.5)');
        });
    });
});

// Aggiunge la classe "active" al caricamento della pagina
document.addEventListener("DOMContentLoaded", () => {
    const lineContainers = document.querySelectorAll(".line-container");
    lineContainers.forEach((container) => container.classList.add("active"));
  });
  
  // Nasconde le linee dopo lo scrolling
  document.addEventListener("scroll", () => {
    const lineContainers = document.querySelectorAll(".line-container");
    const threshold = 10; // Soglia minima per rilevare lo scroll
  
    if (window.scrollY > threshold) {
      lineContainers.forEach((container) => {
        container.classList.remove("active");
        container.classList.add("hidden");
      });
    } else {
      lineContainers.forEach((container) => {
        container.classList.remove("hidden");
        container.classList.add("active");
      });
    }
  });
  
  // Alterna il tema tra chiaro e scuro
  const themeToggle = document.getElementById("theme-toggle");
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    themeToggle.textContent = document.body.classList.contains("light-mode")
      ? "Modalità Scuro"
      : "Modalità Chiaro";
  });
