object @usergroup

extends "api/v2/usergroups/base"

attributes :admin, :created_at, :updated_at

node(:user_names) { |ug| ug.users.except_hidden.map(&:login).join(', ') }
node(:usergroup_names) { |ug| ug.usergroups.map(&:name).join(', ') }
