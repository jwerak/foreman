collection @provisioning_templates

extends "api/v2/provisioning_templates/main"

node(:combination) { |t| t.template_combinations.map { |tc| tc.hostgroup&.to_label }.compact.join(', ') }
