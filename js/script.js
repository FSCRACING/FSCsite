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
    const desktop = window.matchMedia("(min-width: 769px)");
  
    function applyScrollState(){
      // solo desktop: su mobile rimuovi qualsiasi stato "scrolled"
      if (!desktop.matches){
        navbar.classList.remove("scrolled");
        return;
      }
      navbar.classList.toggle("scrolled", window.scrollY > 50);
    }
  
    applyScrollState();
    window.addEventListener("scroll", applyScrollState, { passive: true });
    desktop.addEventListener("change", applyScrollState);
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

/* ===== Linee decorative: SOLO desktop ===== */
(function () {
    const mql = window.matchMedia("(max-width: 900px)");
    const $lines = () => document.querySelectorAll(".line-container");
  
    function applyState() {
      if (mql.matches) {
        // Mobile: niente linee
        $lines().forEach((c) => {
          c.classList.remove("active");
          c.classList.add("hidden");
          c.style.display = "none";
        });
      } else {
        // Desktop: visibili e animate come prima
        $lines().forEach((c) => {
          c.classList.remove("hidden");
          c.style.display = "";
        });
        // Attivo l'animazione dopo il paint
        requestAnimationFrame(() => {
          $lines().forEach((c) => c.classList.add("active"));
        });
      }
    }
  
    // inizializza e reagisci ai cambi di viewport
    document.addEventListener("DOMContentLoaded", applyState);
    mql.addEventListener("change", applyState);
  
    // scroll handler: attivo solo su desktop
    function onScroll() {
      if (mql.matches) return; // mobile → niente
      const threshold = 10;
      if (window.scrollY > threshold) {
        $lines().forEach((c) => {
          c.classList.remove("active");
          c.classList.add("hidden");
        });
      } else {
        $lines().forEach((c) => {
          c.classList.remove("hidden");
          c.classList.add("active");
        });
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
  })();
  
  

  (function(){
    const imgA = document.getElementById('team-img-a');
    const imgB = document.getElementById('team-img-b');
    const cards = document.getElementById('team-cards');
    const rail  = document.getElementById('team-rail');
    const details = document.getElementById('team-details');
    const hotspot = document.getElementById('team-hotspot');
    const mql = window.matchMedia('(max-width: 860px)');

    function swapPreview(src){
      if(!src || imgA.getAttribute('src') === src) return;
      imgB.src = src; imgB.classList.add('show'); imgA.classList.remove('show');
      setTimeout(()=>{ imgA.src = src; imgA.classList.add('show'); imgB.classList.remove('show'); }, 180);
    }

    function setActiveById(id, src, kicker, title, excerpt, link){
      document.querySelectorAll('#team-cards .card').forEach(c=>{
        c.classList.toggle('active', c.dataset.id===id);
      });
      swapPreview(src);
      if(details){
        details.querySelector('.kicker').textContent = kicker;
        details.querySelector('.title').textContent  = title;
        details.querySelector('.excerpt').textContent= excerpt;
      }
      document.querySelectorAll('#team .thumb').forEach(t=>t.classList.toggle('active', t.dataset.id===id));
      if(hotspot) hotspot.href = link || '#';
    }

    if(cards){
      cards.addEventListener('mouseover', e=>{
        const card=e.target.closest('.card'); if(!card) return;
        swapPreview(card.dataset.preview);
      });
      cards.addEventListener('focusin', e=>{
        const card=e.target.closest('.card'); if(!card) return;
        swapPreview(card.dataset.preview);
      });
      cards.addEventListener('mouseleave', ()=>{
        const active=document.querySelector('#team-cards .card.active');
        if(active) swapPreview(active.dataset.preview);
      });
      cards.addEventListener('click', e=>{
        const card=e.target.closest('.card'); if(!card) return;
        setActiveById(
          card.dataset.id,
          card.dataset.preview,
          card.dataset.kicker,
          card.dataset.title,
          card.dataset.excerpt,
          card.dataset.link
        );
      });
    }

    if(rail){
      rail.addEventListener('click', e=>{
        const btn=e.target.closest('.thumb'); if(!btn) return;
        const card=document.querySelector(`#team-cards .card[data-id="${btn.dataset.id}"]`);
        if(card){
          setActiveById(
            card.dataset.id,
            card.dataset.preview,
            card.dataset.kicker,
            card.dataset.title,
            card.dataset.excerpt,
            card.dataset.link
          );
        }
      });
    }

    function applyMode(){
      const isMobile = mql.matches;
      const cardsBox = document.getElementById('team-cards');
      if(isMobile){
        rail.hidden    = false;
        details.hidden = false;
        cardsBox.style.display='none';
      }else{
        rail.hidden    = true;
        details.hidden = true;
        cardsBox.style.display='flex';
      }
    }
    mql.addEventListener('change', applyMode);
    applyMode();

    const first = document.querySelector('#team-cards .card.active');
    if(first){
      setActiveById(
        first.dataset.id,
        first.dataset.preview,
        first.dataset.kicker,
        first.dataset.title,
        first.dataset.excerpt,
        first.dataset.link
      );
    }
  })();

  (function(){
    const stack = document.getElementById('polaroidStack');
    if(!stack) return;

    const topCard = () => stack.lastElementChild;

    function goNext(){
      const card = topCard();
      if(!card) return;
      card.classList.add('go-next');
      const onEnd = () => {
        card.removeEventListener('transitionend', onEnd);
        stack.insertBefore(card, stack.firstElementChild);
        card.classList.remove('go-next');
      };
      card.addEventListener('transitionend', onEnd);
    }

    function goPrev(){
      const first = stack.firstElementChild;
      if(!first) return;
      first.classList.add('from-prev');
      stack.appendChild(first);
      requestAnimationFrame(()=>{ first.classList.add('go-in'); });
      const onEnd = () => {
        first.removeEventListener('transitionend', onEnd);
        first.classList.remove('from-prev','go-in');
      };
      first.addEventListener('transitionend', onEnd);
    }

    let startX = 0, startY = 0, dragging = false;
    const THRESH = 28;

    const onDown = (e) => {
      const t = e.touches ? e.touches[0] : e;
      startX = t.clientX; startY = t.clientY; dragging = true;
    };
    const onMove = (e) => {
      if(!dragging) return;
      const t = e.touches ? e.touches[0] : e;
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if(Math.abs(dx) < THRESH || Math.abs(dx) < Math.abs(dy)) return;
      dragging = false;
      dx < 0 ? goNext() : goPrev();
    };
    const onUp = () => { dragging = false; };

    stack.addEventListener('touchstart', onDown, {passive:true});
    stack.addEventListener('touchmove',  onMove, {passive:true});
    stack.addEventListener('touchend',   onUp,   {passive:true});
    stack.addEventListener('pointerdown', onDown);
    stack.addEventListener('pointermove', onMove);
    stack.addEventListener('pointerup',   onUp);

    stack.addEventListener('keydown', (e)=>{
      if(e.key === 'ArrowLeft'){ goPrev(); }
      if(e.key === 'ArrowRight'){ goNext(); }
    });
  })();
  // Auto-aspect: adatta il contenitore al rapporto dell’immagine
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.auto-aspect').forEach((box) => {
    const img = box.querySelector('img');
    if (!img) return;

    const apply = () => {
      const w = img.naturalWidth, h = img.naturalHeight;
      if (!w || !h) return;

      // setta il rapporto (width/height) del contenitore
      box.style.aspectRatio = (w / h).toString();

      // (opzionale) clamp ulteriore se l’immagine è molto verticale
      // puoi commentare queste due righe se non ti serve
      const maxH = Math.min(window.innerHeight * 0.7, box.clientWidth / (w / h));
      box.style.maxHeight = `${Math.max(200, maxH)}px`;
    };

    if (img.complete) apply(); else img.addEventListener('load', apply);
    window.addEventListener('resize', () => { if (img.complete) apply(); });
  });
});
/* Safety: assicurati che la pila polaroid compaia su mobile anche se qualche CSS la nasconde */
(function(){
  const wrap  = document.querySelector('#chi-siamo .polaroid-stack');
  const stack = document.getElementById('polaroidStack');
  if(!wrap || !stack) return;

  const mql = window.matchMedia('(max-width: 900px)');
  function ensureVisible(){
    wrap.style.display = mql.matches ? 'grid' : 'none';
  }
  ensureVisible();
  mql.addEventListener('change', ensureVisible);
})();
