document.addEventListener('DOMContentLoaded', () => {
  initReveal();

  let piecesData = [];

  const catLabels = {
    Sofas: 'Sofás',
    Cadeiras_Poltronas: 'Cadeiras & Poltronas',
    Camas_Quartos: 'Camas & Quartos',
    Outros_Moveis: 'Outros Móveis',
  };

  const woodPal = {
    nogueira: ['#c89040', '#6a4518'], carvalho: ['#e0a850', '#8a6220'],
    castanho: ['#c07838', '#6a3d18'], freixo: ['#c8a878', '#6f5c3e'],
    cerejeira: ['#c87848', '#6e381e'], pinho: ['#d4b868', '#7a642c'],
    lacado: ['#c8a878', '#8a6220'],
  };
  function woodGradient(woodLabel) {
    const key = Object.keys(woodPal).find((k) => (woodLabel || '').toLowerCase().includes(k));
    const pal = woodPal[key] || ['#8a6220', '#3a2810'];
    return `linear-gradient(145deg, ${pal[0]}, ${pal[1]})`;
  }

  const grid = document.getElementById('colgrid');
  const pills = document.querySelectorAll('.fpill');

  function renderGrid(list) {
    grid.innerHTML = '';
    grid.classList.toggle('grid-fewcols', list.length > 0 && list.length <= 3);
    if (!list.length) {
      grid.innerHTML = '<div class="col-empty">Não há peças nesta categoria.</div>';
      return;
    }
    list.forEach((p, i) => {
      const card = document.createElement('div');
      card.className = 'pcard reveal';
      card.dataset.pieceId = p.id;
      const firstImg = p.images && p.images.length > 0 ? p.images[0] : '';
      const dots = p.images.map(() => '<span></span>').join('');
      card.innerHTML =
        '<div class="pc-ov"></div>' +
        '<div class="pc-angles">' + dots + '</div>' +
        '<div class="pc-meta">' +
          '<div class="pc-badge">' + (catLabels[p.category] || '') + '</div>' +
          '<div class="pc-name">' + p.name + '</div>' +
          '<div class="pc-wood">' + p.wood + '</div>' +
        '</div>';
      const img = document.createElement('img');
      img.className = 'pc-img';
      img.loading = 'lazy';
      img.alt = p.name || '';
      img.src = firstImg;
      img.onerror = function () {
        this.style.display = 'none';
        card.style.background = woodGradient(p.wood);
        card.style.aspectRatio = p.aspectRatio || '4/3';
      };
      card.insertBefore(img, card.firstChild);
      card.addEventListener('click', () => openLbx(p));
      grid.appendChild(card);
      setTimeout(() => card.classList.add('vis'), (i % 6) * 70 + 40);
    });
  }

  fetch('dados.json')
    .then((res) => res.json())
    .then((data) => {
      const col = data.colecoes || {};
      piecesData = [];
      Object.keys(col).forEach((collKey) => {
        Object.keys(col[collKey]).forEach((prodKey) => {
          const p = col[collKey][prodKey];
          piecesData.push({
            id: p.id,
            name: p.nome,
            category: collKey,
            wood: '',
            description: p.descricao || '',
            aspectRatio: '4/3',
            images: p.imagens || [],
          });
        });
      });
      renderGrid(piecesData);
      const activePill = document.querySelector('.fpill.active') || pills[0];
      if (activePill) {
        const c = activePill.querySelector('.fcount');
        if (c) c.textContent = ' (' + piecesData.length + ')';
      }
    })
    .catch((err) => {
      console.error('Erro ao carregar dados.json:', err);
      renderGrid([]);
    });

  // ===== Lightbox =====
  const lbx = document.getElementById('lbx');
  const lbxBg = document.getElementById('lbx-bg');
  const lbxImg = document.getElementById('lbx-img');
  const lbxVideo = document.getElementById('lbx-video');
  const isVideo = (u) => /\.(mp4|webm|ogg|mov|m4v)$/i.test(u || '');
  const lbxPrev = document.getElementById('lbx-prev');
  const lbxNext = document.getElementById('lbx-next');
  const lbxClose = document.getElementById('lbx-close');
  const lbxDots = document.getElementById('lbx-dots');
  const lbxThumbs = document.getElementById('lbx-thumbs');
  const lbxBadge = document.getElementById('lbx-badge');
  const lbxName = document.getElementById('lbx-name');
  const lbxWood = document.getElementById('lbx-wood');
  const lbxDesc = document.getElementById('lbx-desc');
  const lbxInfo = document.getElementById('lbx-info');

  let piece = null;
  let angle = 0;
  let swipeX = 0;

  function applyAngle(idx) {
    if (!piece) return;
    angle = ((idx % piece.images.length) + piece.images.length) % piece.images.length;
    const a = piece.images[angle];
    lbxImg.classList.add('lbx-fade');
    lbxVideo.pause();
    setTimeout(() => {
      if (isVideo(a)) {
        lbxImg.style.display = 'none';
        lbxVideo.src = a;
        lbxVideo.style.display = 'block';
        lbxVideo.load();
      } else {
        lbxVideo.removeAttribute('src');
        lbxVideo.style.display = 'none';
        lbxImg.style.display = 'block';
        lbxImg.src = a;
      }
      lbxImg.classList.remove('lbx-fade');
      lbxThumbs.querySelectorAll('.lbx-thumb').forEach((t, i) => t.classList.toggle('lbx-thumb-active', i === angle));
      const activeTh = lbxThumbs.querySelector('.lbx-thumb-active');
      if (activeTh) {
        const thLeft = activeTh.offsetLeft;
        const thWidth = activeTh.offsetWidth;
        const wrapWidth = lbxThumbs.parentElement.offsetWidth;
        const target = thLeft + thWidth / 2 - wrapWidth / 2;
        lbxThumbs.parentElement.scrollTo({ left: target, behavior: 'smooth' });
      }
      lbxDots.querySelectorAll('.lbx-dot').forEach((d, i) => d.classList.toggle('lbx-dot-on', i === angle));
    }, 200);
  }

  function openLbx(p) {
    piece = p;
    angle = 0;

    const first = p.images[0];
    if (isVideo(first)) {
      lbxImg.style.display = 'none';
      lbxVideo.src = first;
      lbxVideo.style.display = 'block';
      lbxVideo.load();
    } else {
      lbxVideo.removeAttribute('src');
      lbxVideo.style.display = 'none';
      lbxImg.style.display = 'block';
      lbxImg.src = first;
    }
    lbxImg.alt = p.name || '';
    lbxImg.style.opacity = '1';
    lbxImg.style.transform = 'scale(1)';

    lbxBadge.textContent = catLabels[p.category] || '';
    lbxName.textContent = p.name;
    lbxWood.textContent = p.wood;
    if (p.description && p.description.trim()) {
      lbxDesc.textContent = p.description;
      lbxDesc.style.display = '';
    } else {
      lbxDesc.textContent = '';
      lbxDesc.style.display = 'none';
    }

    lbxThumbs.innerHTML = '';
    p.images.forEach((img, i) => {
      const th = document.createElement('button');
      th.className = 'lbx-thumb' + (i === 0 ? ' lbx-thumb-active' : '');
      if (isVideo(img)) {
        th.style.background = 'linear-gradient(145deg,#2a2016,#0e0a06)';
        th.innerHTML = '<span style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;"><svg width="18" height="18" viewBox="0 0 24 24" fill="#e1c299"><path d="M8 5v14l11-7z"></path></svg></span>';
      } else {
        th.style.backgroundImage = `url('${img}')`;
      }
      th.setAttribute('aria-label', isVideo(img) ? `Vídeo ${i + 1}` : `Ângulo ${i + 1}`);
      th.addEventListener('click', () => applyAngle(i));
      lbxThumbs.appendChild(th);
    });

    lbxDots.innerHTML = '';
    p.images.forEach((_, i) => {
      const d = document.createElement('button');
      d.className = 'lbx-dot' + (i === 0 ? ' lbx-dot-on' : '');
      d.setAttribute('aria-label', `Ângulo ${i + 1}`);
      d.addEventListener('click', () => applyAngle(i));
      lbxDots.appendChild(d);
    });

    document.body.style.overflow = 'hidden';
    lbx.classList.add('lbx-open');
    lbxInfo.classList.remove('lbx-info-vis');
    setTimeout(() => lbxInfo.classList.add('lbx-info-vis'), 520);
    setTimeout(() => lbxClose && lbxClose.focus(), 50);
  }

  function closeLbx() {
    lbxVideo.pause();
    lbxInfo.classList.remove('lbx-info-vis');
    lbx.classList.remove('lbx-open');
    document.body.style.overflow = '';
  }

  lbxClose.addEventListener('click', closeLbx);
  lbxBg.addEventListener('click', closeLbx);
  lbxPrev.addEventListener('click', (e) => { e.stopPropagation(); applyAngle(angle - 1); });
  lbxNext.addEventListener('click', (e) => { e.stopPropagation(); applyAngle(angle + 1); });

  document.addEventListener('keydown', (e) => {
    if (!lbx.classList.contains('lbx-open')) return;
    if (e.key === 'Escape') closeLbx();
    if (e.key === 'ArrowLeft') applyAngle(angle - 1);
    if (e.key === 'ArrowRight') applyAngle(angle + 1);
  });

  lbxImg.addEventListener('touchstart', (e) => { swipeX = e.touches[0].clientX; }, { passive: true });
  lbxImg.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - swipeX;
    if (Math.abs(dx) > 40) applyAngle(angle + (dx < 0 ? 1 : -1));
  });

  lbx.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || !lbx.classList.contains('lbx-open')) return;
    const focusable = Array.from(lbx.querySelectorAll('button'));
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
      e.preventDefault();
      (e.shiftKey ? last : first).focus();
    }
  });

  // ===== Filters =====
  function applyFilter(pill) {
    pills.forEach((x) => x.classList.remove('active'));
    pill.classList.add('active');
    const f = pill.dataset.filter;
    grid.classList.add('grid-fading');
    setTimeout(() => {
      const list = f === 'todos' ? piecesData : piecesData.filter((p) => p.category === f);
      renderGrid(list);
      pills.forEach((x) => { const c = x.querySelector('.fcount'); if (c) c.textContent = ''; });
      const c = pill.querySelector('.fcount'); if (c) c.textContent = ' (' + list.length + ')';
      grid.classList.remove('grid-fading');
    }, 200);
  }
  pills.forEach((p) => p.addEventListener('click', () => applyFilter(p)));
});
