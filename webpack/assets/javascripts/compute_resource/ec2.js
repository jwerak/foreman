export function vpcSelected({ value }) {
  const sgSelect = document.querySelector('select.security_group_ids');
  if (!sgSelect) return;

  const securityGroups = JSON.parse(sgSelect.getAttribute('data-security-groups'));
  const subnets = JSON.parse(sgSelect.getAttribute('data-subnets'));
  const vpc =
    value !== '' ? subnets[value] : { vpc_id: 'ec2', subnet_name: 'ec2' };

  sgSelect.innerHTML = '';

  securityGroups[vpc.vpc_id].forEach(
    ({ group_id: groupId, group_name: groupName }) => {
      const option = document.createElement('option');
      option.value = groupId;
      option.textContent = `${groupName} - ${vpc.subnet_name}`;
      sgSelect.appendChild(option);
    }
  );

  // multiSelect jQuery plugin — use global $ if available
  if (window.$ && window.$(sgSelect).multiSelect) {
    window.$(sgSelect).multiSelect('refresh');
  }
}
