class OperatingsystemsController < ApplicationController
  include Foreman::Controller::AutoCompleteSearch
  include Foreman::Controller::Parameters::Operatingsystem
  include Foreman::Controller::FormFieldsApi

  before_action :find_resource, :only => [:edit, :update, :destroy, :clone]

  def index
    @operatingsystems = resource_base_search_and_page
  end

  def new
    @operatingsystem = Operatingsystem.new
    set_form_fields
  end

  def create
    @operatingsystem = Operatingsystem.new(operatingsystem_params)
    if @operatingsystem.save
      process_success
    else
      set_form_fields
      process_error
    end
  end

  def edit
    set_form_fields
  end

  def update
    if @operatingsystem.update(operatingsystem_params)
      process_success
    else
      set_form_fields
      process_error
    end
  end

  def destroy
    if @operatingsystem.destroy
      process_success
    else
      process_error
    end
  end

  def clone
    @operatingsystem = @operatingsystem.deep_clone include: [:media, :ptables, :architectures, :os_parameters], except: [:title]
    set_form_fields
  end

  private

  def action_permission
    case params[:action]
      when 'clone'
        :create
      else
        super
    end
  end

  def set_form_fields
    family_options = Operatingsystem.families_as_collection.map { |f| { value: f.value, label: f.name } }
    hash_options = PasswordCrypt::ALGORITHMS.keys.map { |k| { value: k, label: k } }
    arch_options = Architecture.authorized(:view_architectures).order(:name).map { |a| { value: a.id, label: a.name } }
    ptable_options = Ptable.authorized(:view_ptables).order(:name).map { |p| { value: p.id, label: p.name } }
    medium_options = Medium.authorized(:view_media).order(:name).map { |m| { value: m.id, label: m.name } }

    @form_fields = [
      { name: 'name', label: _('Name'), required: true, tab: _('Operating System'),
        helpText: _('OS name from facter, e.g. RedHat') },
      { name: 'major', label: _('Major Version'), required: true, tab: _('Operating System'),
        helpText: _('OS major version from facter') },
      { name: 'minor', label: _('Minor Version'), tab: _('Operating System'),
        helpText: _('OS minor version from facter') },
      { name: 'description', label: _('Description'), tab: _('Operating System'),
        helpText: _('OS friendly name, e.g. RHEL 6.5') },
      { name: 'family', label: _('Family'), type: 'select', tab: _('Operating System'),
        options: family_options },
      { name: 'release_name', label: _('Release Name'), tab: _('Operating System') },
      { name: 'password_hash', label: _('Root Password Hash'), type: 'select', tab: _('Operating System'),
        options: hash_options,
        helpText: _('Hash function to use. Change takes effect for new or updated hosts.') },
      { name: 'architecture_ids', label: _('Architectures'), type: 'checkboxGroup',
        tab: _('Architectures'), options: arch_options, loadKey: 'architectures' },
      { name: 'ptable_ids', label: _('Partition Tables'), type: 'checkboxGroup',
        tab: _('Partition Tables'), options: ptable_options, loadKey: 'ptables' },
      { name: 'medium_ids', label: _('Installation Media'), type: 'checkboxGroup',
        tab: _('Installation Media'), options: medium_options, loadKey: 'media' },
    ]
  end
end
