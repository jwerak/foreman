export function autofillSshKeyName() {
  const name = document.getElementById('ssh_key_name');
  const keyField = document.getElementById('ssh_key_key');
  if (!name || !keyField) return true;

  const comment = keyField.value.match(/^\S+ \S+ (.+)\n?$/);

  if (name.value === '' && comment && comment.length >= 1) {
    name.value = comment[1];
    name.dispatchEvent(new Event('change', { bubbles: true }));
    return name;
  }

  return true;
}
