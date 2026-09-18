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
        // resolve display settings by exact mapping or rules (e.g. chairs)
        function resolveSettings(rel, abs) {
          const p = positionMap[rel] || positionMap[abs];
          if (p) return { pos: p, fit: null };
          if ((rel && rel.includes('Cadeiras_Poltronas')) || (abs && abs.includes('Cadeiras_Poltronas'))) {
            // chairs: show the full piece without cropping (contain), centered lower
            return { pos: 'center 60%', fit: 'contain' };
          }
          return { pos: null, fit: null };
        }
        // cache for processed (cropped) dataURLs
        const cropCache = new Map();

        // load image helper
        function loadImage(url) {
          return new Promise((resolve, reject) => {
            const im = new Image();
            im.crossOrigin = 'anonymous';
            im.onload = () => resolve(im);
            im.onerror = reject;
            im.src = url;
          });
        }

        // compute cropped dataURL focusing on non-background content
        async function generateCroppedDataUrl(url, targetW, targetH) {
          if (cropCache.has(url)) return cropCache.get(url);
          try {
            const img = await loadImage(url);
            const w = img.naturalWidth;
            const h = img.naturalHeight;
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = w;
            canvas.height = h;
            ctx.drawImage(img, 0, 0);
            const data = ctx.getImageData(0, 0, w, h).data;

            // sample background from corners (10x10 blocks)
            const sampleSize = 8;
            function sampleCorner(x0, y0) {
              let r = 0, g = 0, b = 0, n = 0;
              for (let y = y0; y < Math.min(h, y0 + sampleSize); y++) {
                for (let x = x0; x < Math.min(w, x0 + sampleSize); x++) {
                  const i = (y * w + x) * 4;
                  r += data[i]; g += data[i+1]; b += data[i+2]; n++;
                }
              }
              return [r / n, g / n, b / n];
            }
            const c1 = sampleCorner(0,0);
            const c2 = sampleCorner(w - sampleSize, 0);
            const c3 = sampleCorner(0, h - sampleSize);
            const c4 = sampleCorner(w - sampleSize, h - sampleSize);
            const bg = [(c1[0]+c2[0]+c3[0]+c4[0])/4, (c1[1]+c2[1]+c3[1]+c4[1])/4, (c1[2]+c2[2]+c3[2]+c4[2])/4];

            // detect bbox where pixel differs from bg by threshold
            const thresh = 28; // sensitivity
            let minX = w, minY = h, maxX = 0, maxY = 0;
            const step = 2; // speed up by sampling every 2px
            for (let y = 0; y < h; y += step) {
              for (let x = 0; x < w; x += step) {
                const i = (y * w + x) * 4;
                const dr = Math.abs(data[i]   - bg[0]);
                const dg = Math.abs(data[i+1] - bg[1]);
                const db = Math.abs(data[i+2] - bg[2]);
                const dist = Math.sqrt(dr*dr + dg*dg + db*db);
                if (dist > thresh) {
                  if (x < minX) minX = x;
                  if (x > maxX) maxX = x;
                  if (y < minY) minY = y;
                  if (y > maxY) maxY = y;
                }
              }
            }
            // fallback to full image if nothing detected
            if (minX > maxX || minY > maxY) {
              minX = 0; minY = 0; maxX = w; maxY = h;
            }
            // add padding
            const pad = 0.06; // 6%
            const boxW = maxX - minX;
            const boxH = maxY - minY;
            const padX = Math.floor(boxW * pad);
            const padY = Math.floor(boxH * pad);
            minX = Math.max(0, minX - padX);
            minY = Math.max(0, minY - padY);
            maxX = Math.min(w, maxX + padX);
            maxY = Math.min(h, maxY + padY);

            // draw cropped area into target canvas with requested aspect
            const targetAspect = (targetW && targetH) ? (targetW / targetH) : (canvas.width / canvas.height);
            // compute draw dimensions preserving aspect
            let cropW = maxX - minX;
            let cropH = maxY - minY;
            const cropAspect = cropW / cropH;
            let outW = cropW, outH = cropH;
            if (cropAspect > targetAspect) {
              // crop wider -> reduce width
              outW = Math.floor(cropH * targetAspect);
              const extra = cropW - outW;
              minX += Math.floor(extra / 2);
              maxX = minX + outW;
              cropW = outW;
            } else if (cropAspect < targetAspect) {
              // crop taller -> reduce height
              outH = Math.floor(cropW / targetAspect);
              const extra = cropH - outH;
              minY += Math.floor(extra / 2);
              maxY = minY + outH;
              cropH = outH;
            }

            // final canvas sized to display dimensions (or limit)
            const finalW = Math.min(1400, cropW);
            const finalH = Math.round(finalW / targetAspect);
            const outCanvas = document.createElement('canvas');
            outCanvas.width = finalW;
            outCanvas.height = finalH;
            const outCtx = outCanvas.getContext('2d');
            outCtx.drawImage(img, minX, minY, cropW, cropH, 0, 0, outCanvas.width, outCanvas.height);
            const dataUrl = outCanvas.toDataURL('image/jpeg', 0.92);
            cropCache.set(url, dataUrl);
            return dataUrl;
          } catch (err) {
            console.warn('generateCroppedDataUrl failed for', url, err);
            return url; // fallback to original
          }
        }
        // featured: first image of each product (helps guarantee visibility)
        const featured = [];
        Object.keys(collections).forEach((cat) => {
          Object.keys(collections[cat]).forEach((key) => {
            const item = collections[cat][key] || {};
            const imgs = item.imagens || [];
            imgs.forEach((u) => {
              const abs = new URL(u, location.href).href;
              pool.push({ url: abs, rel: u, name: item.nome || '', id: item.id || null });
            });
            if (imgs.length) {
              const abs0 = new URL(imgs[0], location.href).href;
              featured.push({ url: abs0, rel: imgs[0], name: item.nome || '', id: item.id || null });
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
          // do not force portrait or contain globally; per-entry rules apply in setSrcSafe
          // helper to set src with fallbacks and per-item adjustments
          const setSrcSafe = (entry) => {
            if (!entry) return;
            // show original immediately for responsiveness
            imgEl.onerror = () => {
              console.warn('Imagem falhou a carregar, a tentar alternativa:', entry.url);
              const alt = pool.find((p) => p.url !== entry.url && !Array.from(icons).some(i => i.src === p.url));
              if (alt) setSrcSafe(alt);
              else imgEl.style.display = 'none';
            };
            imgEl.src = entry.url;
            const settings = resolveSettings(entry.rel, entry.url) || { pos: null, fit: null };
            imgEl.style.objectPosition = settings.pos || 'center center';
            // if explicit fit is requested (e.g., chairs), apply and ensure portrait container
            const mediaWrap = imgEl.closest('.icon-media');
            if (settings.fit) {
              imgEl.style.objectFit = settings.fit;
              if (mediaWrap) mediaWrap.classList.add('icon-media--portrait');
            } else {
              imgEl.style.objectFit = 'cover';
              if (mediaWrap) mediaWrap.classList.remove('icon-media--portrait');
            }
            const titleEl = imgEl.closest('.icon-item') && imgEl.closest('.icon-item').querySelector('h3');
            if (titleEl && entry.name) titleEl.textContent = entry.name;
            // update link overlay to point to product page
            const linkEl = imgEl.closest('.icon-item') && imgEl.closest('.icon-item').querySelector('.icon-link');
            if (linkEl) {
              if (entry.id) linkEl.href = 'colecoes.html?prod=' + encodeURIComponent(entry.id);
              else linkEl.href = 'colecoes.html';
            }
            imgEl.style.display = '';
            // start async crop generation and swap the src when ready (non-blocking)
            try {
              const rect = mediaWrap ? mediaWrap.getBoundingClientRect() : { width: 600, height: 800 };
              generateCroppedDataUrl(entry.url, Math.max(120, Math.floor(rect.width)), Math.max(160, Math.floor(rect.height))).then((dataUrl) => {
                if (dataUrl && dataUrl !== entry.url) {
                  // only replace if the image element still expects this entry
                  if (imgEl.src === entry.url || imgEl.src.endsWith(entry.url)) {
                    imgEl.src = dataUrl;
                  }
                }
              }).catch((e) => {/* ignore */});
            } catch (e) { /* ignore */ }
          };
          // set initial random image and title (map image -> product name)
          // initial pick: prefer unique images across the icon set
          const pick = pickUniqueFrom(pool, usedInitial);
          if (pick) setSrcSafe(pick);
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
              setSrcSafe(entry);
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
