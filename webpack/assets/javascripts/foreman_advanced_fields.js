export function initAdvancedFields() {
  document.querySelectorAll('a.advanced_fields_switch').forEach(field => {
    field.addEventListener('click', updateAdvancedFields);
  });
}

function updateAdvancedFields() {
  const switcher = document.querySelector('a.advanced_fields_switch');
  if (!switcher) return;

  const original = switcher.innerHTML;
  switcher.innerHTML = switcher.dataset.alternativeLabel;
  switcher.dataset.alternativeLabel = original;

  const icon = switcher.parentElement.querySelector('i.fa');
  if (icon) {
    icon.classList.toggle('fa-angle-right');
    icon.classList.toggle('fa-angle-down');
  }

  document.querySelectorAll('div.advanced').forEach(el => {
    el.style.display = el.style.display === 'none' ? '' : 'none';
  });
}
