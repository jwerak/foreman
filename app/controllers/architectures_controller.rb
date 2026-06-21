class ArchitecturesController < ApplicationController
  include Foreman::Controller::AutoCompleteSearch
  include Foreman::Controller::Parameters::Architecture
  include Foreman::Controller::FormFieldsApi

  before_action :find_resource, :only => [:edit, :update, :destroy]

  def index
    @architectures = resource_base_search_and_page.includes(:operatingsystems)
  end

  def new
    @architecture = Architecture.new
    set_form_fields
  end

  def create
    @architecture = Architecture.new(architecture_params)
    if @architecture.save
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
    if @architecture.update(architecture_params)
      process_success
    else
      set_form_fields
      process_error
    end
  end

  def destroy
    if @architecture.destroy
      process_success
    else
      process_error
    end
  end

  private

  def set_form_fields
    @form_fields = [
      { name: 'name', label: _('Name'), required: true },
    ]
  end
end
