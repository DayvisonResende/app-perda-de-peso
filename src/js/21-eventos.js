/* ===================== EVENTOS ===================== */
A.fold = (el) => {
  const open = Folds.toggle(el.dataset.id), box = el.closest('.fold');
  box.classList.toggle('open', open); el.setAttribute('aria-expanded', String(open));
};
document.addEventListener('click', (ev) => {
  if (ev.target.matches('[data-scrim]')) { Sheet.close(); return; }
  const el = ev.target.closest('[data-a]'); if (!el || el.disabled) return;
  const fn = A[el.dataset.a]; if (fn) { ev.preventDefault(); fn(el, ev); }
});
document.addEventListener('input', (ev) => { const el = ev.target.closest('[data-in]'); if (el && INPUTS[el.dataset.in]) INPUTS[el.dataset.in](el); });
document.addEventListener('change', (ev) => {
  const el = ev.target;
  if (el.dataset.in === 'date' && el.value) { ui.date = el.value > todayISO() ? todayISO() : el.value; App.render(); return; }
  if (el.dataset.in === 'tr-set' && el.value.trim() !== '') { try { navigator.vibrate && navigator.vibrate(12); } catch (e) {} }
  if (el.dataset.in === 'tr-set' && el.value.trim() !== '') TrRest.start(Tr.s().foco === 'forca' ? 150 : 120);
  if (el.dataset.pf) onProfileChange(el);
  if (el.id === 'import-file' && el.files && el.files[0]) { const r = new FileReader(); r.onload = () => doImport(String(r.result)); r.readAsText(el.files[0]); el.value = ''; }
});
document.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape' && Sheet.isOpen()) { Sheet.close(); return; }
  if (ev.key === 'Enter') {
    const id = ev.target.id;
    if (id === 'shop-extra') A['shop-add'](); else if (id === 'se-q' || id === 'se-n') A['se-save'](); else if (id === 'habit-new') A['habit-add']();
    else if (ev.target.dataset.in === 'fe-qty') A['fp-add']();
    else if (ev.target.dataset.in === 'fp-q') { const first = document.querySelector('#fp-results [data-a="fp-pick"]'); if (first && FP.q) first.click(); }
  }
});

