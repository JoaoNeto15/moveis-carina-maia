// Mobile nav toggle — shared by every page.
document.addEventListener('DOMContentLoaded', () => {
  const root = document.body;
  const openMenu = () => root.classList.add('menu-open');
  const closeMenu = () => root.classList.remove('menu-open');
  const burger = document.querySelector('.nav-burger');
  const closeBtn = document.querySelector('.mnav-close');
  if (burger) burger.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  document.querySelectorAll('.mnav-link, .mnav-cta').forEach((a) => a.addEventListener('click', closeMenu));

  // Icon images rotator: carrega as imagens de `dados.json` e alterna aleatoriamente
  (function initIconRotator() {
    const icons = Array.from(document.querySelectorAll('.icon-media img'));
    if (!icons.length) return;

    fetch('dados.json')
      .then((res) => res.json())
      .then((data) => {
        const collections = data.colecoes || {};
        // pool holds objects { url, name }
        const pool = [];
        // map specific images to object-position adjustments when needed
        const positionMap = {
          'uploads/Outros_Moveis/aparador_amber.jpg': 'center 20%',
          'uploads/Outros_Moveis/aparador_amber_1.jpg': 'center 20%',
          'uploads/Sofas/sofa_porto.jpg': 'center 30%',
          // TVs
          'uploads/Outros_Moveis/movel_tv_eclipse.jpg': 'center 30%',
          'uploads/Outros_Moveis/movel_tv_eclipse_1.jpg': 'center 30%',
          'uploads/Outros_Moveis/movel_tv_helios.jpg': 'center 30%',
          // Aparadores
          'uploads/Outros_Moveis/aparador_zircon.jpg': 'center 20%',
          // Sofás (ajuste vertical para enquadrar melhor)
          'uploads/Sofas/sofa_monaco.jpg': 'center 32%',
          'uploads/Sofas/sofa_valencia.jpg': 'center 45%',
          'uploads/Sofas/sofa_oxford.jpg': 'center 45%',
          'uploads/Sofas/sofa_london.jpg': 'center 32%'
          ,
          // Mesas
          'uploads/Outros_Moveis/Mesas/mesa_nova.jpg': 'center 38%'
        };
        // resolve object-position by exact mapping or by rules (e.g. chairs)
        function resolvePosition(rel, abs) {
          const p = positionMap[rel] || positionMap[abs];
          if (p) return p;
          if ((rel && rel.includes('Cadeiras_Poltronas')) || (abs && abs.includes('Cadeiras_Poltronas'))) {
            return 'center 60%';
          }
          return null;
        }
        // featured: first image of each product (helps guarantee visibility)
        const featured = [];
        Object.keys(collections).forEach((cat) => {
          Object.keys(collections[cat]).forEach((key) => {
            const item = collections[cat][key] || {};
            const imgs = item.imagens || [];
            imgs.forEach((u) => {
              const abs = new URL(u, location.href).href;
              pool.push({ url: abs, rel: u, name: item.nome || '' });
            });
            if (imgs.length) {
              const abs0 = new URL(imgs[0], location.href).href;
              featured.push({ url: abs0, rel: imgs[0], name: item.nome || '' });
            }
          });
        });
        if (!pool.length) return;

          // helper: pick an entry not present in `used` when possible
          function pickUniqueFrom(array, used) {
            if (!array || !array.length) return null;
            let attempts = 0;
            while (attempts < 40) {
              const candidate = array[Math.floor(Math.random() * array.length)];
              if (!used.has(candidate.url)) {
                used.add(candidate.url);
                return candidate;
              }
              attempts += 1;
            }
            // fallback: return random and add to used
            const fallback = array[Math.floor(Math.random() * array.length)];
            used.add(fallback.url);
            return fallback;
          }

          const usedInitial = new Set();
          icons.forEach((imgEl, idx) => {
          imgEl.style.transition = 'opacity 400ms ease';
          // set initial random image and title (map image -> product name)
            // initial pick: prefer unique images across the icon set
            const pick = pickUniqueFrom(pool, usedInitial);
          if (pick) {
            const setSrcSafe = (entry) => {
              if (!entry) return;
              imgEl.onerror = () => {
                console.warn('Imagem falhou a carregar, a tentar alternativa:', entry.url);
                // try to pick another different image
                const alt = pool.find((p) => p.url !== entry.url && !Array.from(icons).some(i => i.src === p.url));
                if (alt) setSrcSafe(alt);
                else imgEl.style.display = 'none';
              };
              imgEl.src = entry.url;
              const pos = resolvePosition(entry.rel, entry.url) || 'center center';
              imgEl.style.objectPosition = pos;
              const titleEl = imgEl.closest('.icon-item') && imgEl.closest('.icon-item').querySelector('h3');
              if (titleEl && entry.name) titleEl.textContent = entry.name;
              imgEl.style.display = '';
            };
            setSrcSafe(pick);
          }
          // determine base duration by size class (lg: longer, md: medium, sm: shorter)
          let baseDuration = 20000;
          const mediaWrap = imgEl.closest('.icon-media');
          if (mediaWrap && mediaWrap.classList.contains('icon-media--md')) baseDuration = 15000;
          if (mediaWrap && mediaWrap.classList.contains('icon-media--sm')) baseDuration = 10000;
          // small per-item offset and jitter to avoid synchronized swaps
          const offsetPerIndex = idx * 500;
          const jitter = Math.floor(Math.random() * 2000) - 1000; // +/-1s
          const interval = Math.max(4000, baseDuration + offsetPerIndex + jitter);
          // rotate with occasional featured picks to ensure coverage
          let featuredIdx = idx % (featured.length || 1);
          // desynchronize start: random initial delay up to `interval`
          const initialDelay = Math.floor(Math.random() * interval);
          const doSwap = () => {
            if (!pool.length) return;
              // compute other icons' current srcs to avoid duplicates
              const otherSrcs = new Set(icons.map((i) => i.src).filter(Boolean));
              otherSrcs.delete(imgEl.src); // allow keeping same image for this element

              let entry = null;
              // try several times to pick a non-duplicate entry
              let attempts = 0;
              while (attempts < 20) {
                // 30% chance pick from featured list
                if (featured.length && Math.random() < 0.3) {
                  const cand = featured[featuredIdx % featured.length];
                  featuredIdx += 1;
                  if (!otherSrcs.has(cand.url)) { entry = cand; break; }
                }
                const cand = pool[Math.floor(Math.random() * pool.length)];
                if (!otherSrcs.has(cand.url)) { entry = cand; break; }
                attempts += 1;
              }
              // fallback: if couldn't find non-duplicate, pick random (avoids infinite loop)
              if (!entry) entry = pool[Math.floor(Math.random() * pool.length)];
            const titleEl = imgEl.closest('.icon-item') && imgEl.closest('.icon-item').querySelector('h3');
            imgEl.style.opacity = '0';
            setTimeout(() => {
              // set with onerror fallback
              imgEl.onerror = () => {
                console.warn('Swap image failed to load:', entry.url);
                const alt = pool.find((p) => p.url !== entry.url && !Array.from(icons).some(i => i.src === p.url));
                if (alt) {
                  imgEl.src = alt.url;
                  const altPos = positionMap[alt.rel] || positionMap[alt.url];
                  if (altPos) imgEl.style.objectPosition = altPos;
                  if (titleEl && alt.name) titleEl.textContent = alt.name;
                } else {
                  imgEl.style.display = 'none';
                }
              };
              imgEl.src = entry.url;
              const pos = resolvePosition(entry.rel, entry.url) || 'center center';
              imgEl.style.objectPosition = pos;
              if (titleEl && entry.name) titleEl.textContent = entry.name;
              imgEl.style.opacity = '1';
            }, 260);
          };
          // start first swap after a randomized delay, then repeat on interval
          setTimeout(() => {
            doSwap();
            setInterval(doSwap, interval);
          }, initialDelay);
        });
        
      })
      .catch((err) => console.error('Erro no rotator de ícones:', err));
  })();
});
