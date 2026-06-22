module Foreman::Controller::FormFieldsApi
  extend ActiveSupport::Concern

  def form_fields
    resource_name = controller_name.singularize
    ivar = "@#{resource_name}"
    unless instance_variable_get(ivar)
      klass = resource_name.classify.constantize rescue nil
      instance_variable_set(ivar, klass.new) if klass
    end
    set_form_fields
    render json: { fields: @form_fields || [], metadata: @form_metadata || {} }
  end
end
