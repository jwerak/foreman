class SshKeysController < ApplicationController
  include Foreman::Controller::Parameters::SshKey
  include Foreman::Controller::UserAware
  include Foreman::Controller::FormFieldsApi

  before_action :find_resource, :only => [:destroy]

  def new
    @ssh_key = SshKey.new
    set_form_fields
  end

  def create
    @ssh_key = SshKey.new(ssh_key_params.merge(:user => @user))
    if @ssh_key.save
      process_success :success_redirect => edit_user_path(@user)
    else
      set_form_fields
      process_error
    end
  end

  def destroy
    if @ssh_key.destroy
      process_success :success_redirect => edit_user_path(@user)
    else
      process_error
    end
  end

  private

  def set_form_fields
    @form_fields = [
      { name: 'key', label: _('Key'), type: 'textarea', rows: 3, required: true },
      { name: 'name', label: _('Name'), required: true },
    ]
  end
end
