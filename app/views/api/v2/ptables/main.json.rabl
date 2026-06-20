object @ptable

extends "api/v2/ptables/base"

attributes :description, :os_family, :snippet, :locked, :created_at, :updated_at

node(:operatingsystem_names) { |ptable| ptable.operatingsystems.map(&:to_label).join(', ') }
