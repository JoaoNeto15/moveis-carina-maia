document.addEventListener('DOMContentLoaded', () => {
  initReveal();

  const icons = {
    sofa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" width="48" height="48"><path d="M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3"/><path d="M2 13a2 2 0 0 1 2-2 2 2 0 0 1 2 2v3h12v-3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v5H2z"/><path d="M6 18v2M18 18v2"/></svg>',
    bed: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" width="48" height="48"><path d="M3 7v12M3 13h18M21 13v6"/><path d="M3 13v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"/></svg>',
    desk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" width="48" height="48"><path d="M3 8h18M4 8v12M20 8v12"/><path d="M4 14h7v-6M11 11h0"/></svg>',
  };

  const specialties = [
    { title: 'Mobiliário de Sala', sub: 'Mesas, aparadores, estantes', icon: 'sofa' },
    { title: 'Mobiliário de Quarto', sub: 'Camas, cómodas, roupeiros', icon: 'bed' },
    { title: 'Mobiliário de Escritório', sub: 'Secretárias, livrarias', icon: 'desk' },
  ];

  const specialtiesEl = document.getElementById('specialties');
  specialties.forEach((s) => {
    const row = document.createElement('div');
    row.style.cssText = 'background:#261e18;border-radius:2rem;padding:32px 34px;display:flex;align-items:center;gap:24px;';
    row.innerHTML =
      '<div style="flex-shrink:0;width:48px;height:48px;color:#e1c299;">' + icons[s.icon] + '</div>' +
      '<div>' +
        '<div style="font-family:\'Newsreader\',serif;font-size:22px;color:#f0dfd6;margin-bottom:4px;">' + s.title + '</div>' +
        '<div style="font-size:13px;font-weight:400;letter-spacing:0.02em;color:rgba(240,223,214,0.55);">' + s.sub + '</div>' +
      '</div>';
    specialtiesEl.appendChild(row);
  });

  const defaultTeam = [
    { name: 'Carina Maia', role: 'Designer', foto: 'uploads/perfil3.jpg', bio: 'Quarenta anos de banco. É das mãos dele que saem as juntas que se sentem mas não se veem.', grad: 'radial-gradient(circle at 35% 30%,#5a4632,#241c16)' },
    { name: 'Luís Maia', role: 'Coordenador de Operação',foto: 'uploads/perfil3.jpg', bio: 'Traduz a conversa em desenho. Cada peça passa pela sua prancheta antes de chegar à madeira.', grad: 'radial-gradient(circle at 35% 30%,#6a523a,#2a1f15)' },
    { name: 'Rafael Maia', role: 'Operador',foto: 'uploads/perfil3.jpg', bio: 'Coordena a oficina e o tempo da madeira. Garante que nada sai antes de estar pronto.', grad: 'radial-gradient(circle at 35% 30%,#4a3a28,#19120c)' },
  ];

  const teamGrid = document.getElementById('team-grid');
  function renderTeam(team) {
    teamGrid.innerHTML = '';
    team.forEach((m) => {
      const avatarBg = m.foto ? `url('${m.foto}')` : m.grad;
      const card = document.createElement('div');
      card.className = 'reveal';
      card.style.cssText = 'background:#221a14;border-radius:3rem;padding:48px 40px;display:flex;flex-direction:column;align-items:flex-start;';
      card.innerHTML =
        '<div style="height:84px;width:84px;border-radius:50%;background-color:#241c16;background-image:' + avatarBg + ';background-size:cover;background-position:center;margin-bottom:30px;flex-shrink:0;"></div>' +
        '<div style="font-family:\'Newsreader\',serif;font-size:26px;color:#f0dfd6;margin-bottom:8px;">' + m.name + '</div>' +
        '<div style="font-size:11px;font-weight:600;letter-spacing:0.16em;color:#e1c299;text-transform:uppercase;margin-bottom:20px;">' + m.role + '</div>' +
        '<p style="font-size:14.5px;line-height:1.7;font-weight:300;color:rgba(240,223,214,0.6);">' + m.bio + '</p>';
      teamGrid.appendChild(card);
    });
    initReveal();
  }

  renderTeam(defaultTeam);
  fetch('dados.json')
    .then((res) => res.json())
    .then((data) => {
      if (Array.isArray(data.team) && data.team.length) renderTeam(data.team);
    })
    .catch((err) => console.error('Erro ao carregar dados.json:', err));
});
