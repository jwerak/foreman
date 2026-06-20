object @operatingsystem

extends "api/v2/operatingsystems/base"

attributes :description, :major, :minor, :family, :release_name, :password_hash, :created_at, :updated_at

node(:hosts_count) { |os| hosts_count[os] }
