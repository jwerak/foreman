class UsergroupsController < ApplicationController
  include Foreman::Controller::AutoCompleteSearch
  include Foreman::Controller::Parameters::Usergroup
  include Foreman::Controller::ExternalUsergroupsErrors
  include Foreman::Controller::FormFieldsApi

  before_action :find_resource, :only => [:edit, :update, :destroy]
  before_action :get_external_usergroups_to_refresh, :only => [:update]

  def index
    @usergroups = resource_base_search_and_page(:usergroups)
  end

  def new
    @usergroup = Usergroup.new
    set_form_fields
  end

  def create
    @usergroup = Usergroup.new(usergroup_params)
    if @usergroup.save && refresh_external_usergroups
      process_success
    else
      set_form_fields
      process_error
    end
  rescue => e
    external_usergroups_error(@usergroup, e)
    set_form_fields
    process_error
  end

  def edit
    set_form_fields
  end

  def update
    if @usergroup.update(usergroup_params) &&
        refresh_external_usergroups
      process_success
    else
      set_form_fields
      process_error
    end
  rescue Foreman::CyclicGraphException => e
    @usergroup.errors.add(:usergroups, e.record.errors[:base].join(' '))
    set_form_fields
    process_error
  rescue => e
    external_usergroups_error(@usergroup, e)
    set_form_fields
    process_error
  end

  def destroy
    if @usergroup.destroy
      process_success
    else
      process_error
    end
  end

  private

  def find_by_id(permission = :view_usergroups)
    Usergroup.authorized(permission).find(params[:id])
  end

  def get_external_usergroups_to_refresh
    # we need to load current status, so we call all explicitly
    @external_usergroups = @usergroup.external_usergroups.to_a
  end

  def external_usergroups
    @external_usergroups || []
  end

  def refresh_external_usergroups
    (external_usergroups + @usergroup.external_usergroups).uniq.map(&:refresh)
  end

  def set_form_fields
    base_scope = @usergroup ? Usergroup.except_current(@usergroup) : Usergroup.all
    usergroup_options = base_scope.order(:name).map { |ug| { value: ug.id, label: ug.name } }
    user_options = User.except_hidden.order(:login).map { |u| { value: u.id, label: u.select_title } }
    role_options = Role.for_current_user.map { |r| { value: r.id, label: r.name } }

    @form_fields = [
      { name: 'name', label: _('Name'), required: true, tab: _('User Group') },
      { name: 'usergroup_ids', label: _('User Groups'), type: 'checkboxGroup', tab: _('User Group'),
        options: usergroup_options, loadKey: 'usergroups' },
      { name: 'user_ids', label: _('Users'), type: 'checkboxGroup', tab: _('User Group'),
        options: user_options, loadKey: 'users' },
      { name: 'admin', label: _('Admin'), type: 'checkbox', tab: _('Roles'),
        checkboxLabel: _('Administrator') },
      { name: 'role_ids', label: _('Roles'), type: 'checkboxGroup', tab: _('Roles'),
        options: role_options, loadKey: 'roles' },
    ]
    @form_metadata = { has_external_auth_sources: AuthSource.non_internal.exists? }
  end
end
