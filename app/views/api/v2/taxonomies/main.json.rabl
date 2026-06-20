object @taxonomy

extends "api/v2/taxonomies/base"

attributes :ancestry, :parent_id, :parent_name, :created_at, :updated_at

node(:hosts_count) { |taxonomy| hosts_count[taxonomy] }
