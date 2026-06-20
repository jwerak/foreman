object @architecture

extends "api/v2/architectures/base"

attributes :created_at, :updated_at

node(:hosts_count) { |architecture| hosts_count[architecture] }
node(:operatingsystem_names) { |architecture| architecture.operatingsystems.map(&:to_label).join(', ') }
