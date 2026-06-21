class MediaController < ApplicationController
  include Foreman::Controller::AutoCompleteSearch
  include Foreman::Controller::Parameters::Medium
  include Foreman::Controller::FormFieldsApi

  before_action :find_resource, :only => [:edit, :update, :destroy, :clone]

  def index
    @media = resource_base_search_and_page.includes(:operatingsystems)
  end

  def new
    @medium = Medium.new
    set_form_fields
  end

  def create
    @medium = Medium.new(medium_params)
    if @medium.save
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
    if @medium.update(medium_params)
      process_success
    else
      set_form_fields
      process_error
    end
  end

  def destroy
    if @medium.destroy
      process_success
    else
      process_error
    end
  end

  def clone
    @medium = @medium.dup
    set_form_fields
    render('new')
  end

  private

  def set_form_fields
    os_family_options = Operatingsystem.families_as_collection.map { |f| { value: f.value, label: f.name } }
    @form_fields = [
      { name: 'name', label: _('Name'), required: true },
      { name: 'path', label: _('Path'), required: true, helpText: _('The path to the medium, can be a URL or a valid NFS server (exclusive of the architecture). For example http://mirror.centos.org/centos/$version/os/$arch where $arch will be substituted for the host\'s actual OS architecture and $version, $major and $minor will be substituted for the version of the operating system.') },
      { name: 'os_family', label: _('Operating System Family'), type: 'select', options: os_family_options },
    ]
  end

  def action_permission
    case params[:action]
      when 'clone'
        :create
      else
        super
    end
  end
end
