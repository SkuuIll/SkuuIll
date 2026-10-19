(() => {
  'use strict';
  const cards = [...document.querySelectorAll('.portfolio-card')];
  const filters = [...document.querySelectorAll('[data-filter]')];
  const search = document.querySelector('#project-search');
  const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  let selected = 'featured';
  const update = () => {
    const query = normalize(search.value.trim());
    let count = 0;
    cards.forEach(card => {
      const matches = selected === 'all' || (selected === 'featured' ? card.dataset.featured === 'true' : card.dataset.category.split(' ').includes(selected));
      card.hidden = !(matches && normalize(card.textContent).includes(query));
      if (!card.hidden) count++;
    });
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === selected)));
    document.querySelector('#project-count').textContent = `${count} de ${cards.length} proyectos · ${selected === 'featured' ? 'Selección destacada' : 'Explorá las fichas para conocer el alcance'}`;
    document.querySelector('#no-projects').hidden = count !== 0;
  };
  filters.forEach(button => button.addEventListener('click', () => { selected = button.dataset.filter; update(); }));
  search.addEventListener('input', () => { if (search.value.trim()) selected = 'all'; update(); });
  document.querySelector('#reset-projects').addEventListener('click', () => { selected = 'all'; search.value = ''; update(); search.focus(); });
  document.querySelector('.catalog-controls').hidden = false;
  update();
  const dialog = document.querySelector('#case-dialog');
  const content = document.querySelector('#case-content');
  let opener;
  const openCase = (id, button) => {
    const template = document.getElementById(`case-${id}`);
    if (!(template instanceof HTMLTemplateElement)) return;
    opener = button;
    content.replaceChildren(template.content.cloneNode(true));
    dialog.showModal();
    document.body.classList.add('case-is-open');
    dialog.scrollTop = 0;
    document.querySelector('#close-case').focus();
  };
  document.querySelectorAll('[data-case]').forEach(button => {
    button.hidden = false;
    button.addEventListener('click', () => openCase(button.dataset.case, button));
  });
  document.querySelector('#close-case').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('case-is-open');
    if (opener && !opener.closest('[hidden]')) opener.focus();
  });
  content.addEventListener('click', event => {
    const button = event.target.closest('[data-inquire]');
    if (!button) return;
    const inquiry = document.querySelector('#inquiry-form');
    const service = inquiry.elements.namedItem('service');
    service.value = button.dataset.inquiryService;
    inquiry.elements.namedItem('reference').value = button.dataset.reference;
    inquiry.dispatchEvent(new Event('input', { bubbles: true }));
    dialog.close();
    location.hash = 'contacto';
    service.focus({ preventScroll: true });
  });
  const deepLink = new URL(location.href).searchParams.get('caso');
  if (deepLink) openCase(deepLink, null);
})();
