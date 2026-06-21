class AuthSourceExternalsController < ApplicationController
  include Foreman::Controller::Parameters::AuthSourceExternal

  before_action :find_resource, :only => [:edit, :update]

  def edit
    set_form_fields
  end

  def update
    if @auth_source_external.update(auth_source_external_params)
      process_success :success_redirect => auth_sources_path
    else
      set_form_fields
      process_error :redirect => auth_sources_path
    end
  end

  private

  def set_form_fields
    @form_fields = [
      { name: 'name', label: _('Name'), disabled: true },
    ]
  end

  def controller_permission
    'authenticators'
  end
end
