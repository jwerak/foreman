export function nfsVisibility(osFamily, nfsRequired) {
  const section = document.getElementById('nfs-section');
  if (section) {
    section.style.display = nfsRequired.includes(osFamily.value) ? '' : 'none';
  }
}
