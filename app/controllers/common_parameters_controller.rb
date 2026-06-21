class CommonParametersController < ApplicationController
  include Foreman::Controller::AutoCompleteSearch
  include Foreman::Controller::Parameters::Parameter
  include Foreman::Controller::FormFieldsApi

  before_action :find_resource, :only => [:edit, :update, :destroy]

  def index
    @common_parameters = resource_base_search_and_page
  end

  def new
    @common_parameter = CommonParameter.new
    set_form_fields
  end

  def create
    @common_parameter = CommonParameter.new(parameter_params(::CommonParameter))
    if @common_parameter.save
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
    if @common_parameter.update(parameter_params(::CommonParameter))
      process_success
    else
      set_form_fields
      process_error
    end
  end

  def destroy
    if @common_parameter.destroy
      process_success
    else
      process_error
    end
  end

  private

  def controller_permission
    'params'
  end

  def resource_base
    model_of_controller.authorized(current_permission, Parameter).where(:type => 'CommonParameter')
  end

  def set_form_fields
    type_options = Parameter::KEY_TYPES.map { |t| { value: t, label: _(t) } }
    @form_fields = [
      { name: 'name', label: _('Name'), required: true },
      { name: 'parameter_type', label: _('Type'), type: 'select', required: true, options: type_options },
      { name: 'value', label: _('Value'), type: 'textarea' },
      { name: 'hidden_value', label: _('Hidden value'), type: 'checkbox', checkboxLabel: _('Hide value in listings and API responses') },
    ]
  end
end
