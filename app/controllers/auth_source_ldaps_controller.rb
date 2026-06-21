class AuthSourceLdapsController < ApplicationController
  include Foreman::Controller::Parameters::AuthSourceLdap

  before_action :find_resource, :only => [:edit, :update, :destroy]

  def new
    @auth_source_ldap = AuthSourceLdap.new
    set_form_fields
  end

  def create
    @auth_source_ldap = AuthSourceLdap.new(auth_source_ldap_params)
    if @auth_source_ldap.save
      process_success :success_redirect => auth_sources_path
    else
      set_form_fields
      process_error
    end
  end

  def edit
    set_form_fields
  end

  def update
    if @auth_source_ldap.update(auth_source_ldap_params)
      process_success :success_redirect => auth_sources_path
    else
      set_form_fields
      process_error
    end
  end

  def destroy
    if @auth_source_ldap.destroy
      process_success :success_redirect => auth_sources_path
    else
      process_error :redirect => auth_sources_path
    end
  end

  def test_connection
    temp_auth_source_ldap = AuthSourceLdap.new(auth_source_ldap_params)
    msg = temp_auth_source_ldap.test_connection
    render :json => msg, :status => :ok
  rescue Foreman::Exception => exception
    Foreman::Logging.exception("Failed to connect to LDAP server", exception)
    render :json => {:message => exception.message}, :status => :unprocessable_entity
  end

  private

  def set_form_fields
    server_type_options = AuthSourceLdap::SERVER_TYPES.map { |k, v| { value: k.to_s, label: v } }
    group_membership_options = AuthSourceLdap::GROUP_MEMBERSHIP_TYPES.map { |k, v| { value: k.to_s, label: v } }
    @form_fields = [
      { name: 'name', label: _('Name'), required: true, section: _('LDAP Server') },
      { name: 'host', label: _('Host'), required: true, section: _('LDAP Server') },
      { name: 'tls', label: _('LDAPS'), type: 'checkbox', section: _('LDAP Server') },
      { name: 'port', label: _('Port'), type: 'number', required: true, section: _('LDAP Server'), initialValue: 389 },
      { name: 'server_type', label: _('Server type'), type: 'select', required: true, options: server_type_options, section: _('LDAP Server') },
      { name: 'account', label: _('Account'), section: _('Account'), helpText: _('User to authenticate, optional') },
      { name: 'account_password', label: _('Account Password'), type: 'password', section: _('Account') },
      { name: 'base_dn', label: _('Base DN'), section: _('Account') },
      { name: 'groups_base', label: _('Groups base DN'), section: _('Account') },
      { name: 'ldap_group_membership', label: _('Group membership type'), type: 'select', options: group_membership_options, section: _('Account'),
        helpText: _('Controls which mechanism will be used for looking up users\' group membership in LDAP.') },
      { name: 'ldap_filter', label: _('LDAP filter'), type: 'textarea', section: _('Account'), helpText: _('Custom LDAP search filter, optional') },
      { name: 'onthefly_register', label: _('Automatically Create Accounts In Foreman'), type: 'checkbox', section: _('Account'),
        helpText: _('LDAP users will have their Foreman account automatically created the first time they log into Foreman') },
      { name: 'usergroup_sync', label: _('Usergroup sync'), type: 'checkbox', section: _('Account'),
        helpText: _('External user groups will be synced on login, else relies on periodic cronjob to check group membership') },
      { name: 'attr_login', label: _('Login name attribute'), section: _('Attribute Mappings'), helpText: _('e.g. uid') },
      { name: 'attr_firstname', label: _('First name attribute'), section: _('Attribute Mappings'), helpText: _('e.g. givenName') },
      { name: 'attr_lastname', label: _('Last name attribute'), section: _('Attribute Mappings'), helpText: _('e.g. sn') },
      { name: 'attr_mail', label: _('Email address attribute'), section: _('Attribute Mappings'), helpText: _('e.g. mail') },
      { name: 'attr_photo', label: _('Photo attribute'), section: _('Attribute Mappings'), helpText: _('e.g. jpegPhoto') },
    ]
  end

  def controller_permission
    'authenticators'
  end
end
