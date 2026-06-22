class HttpProxiesController < ApplicationController
  include Foreman::Controller::Parameters::HttpProxy
  include Foreman::Controller::AutoCompleteSearch
  include Foreman::Controller::FormFieldsApi
  include Foreman::Controller::TaxonomyFormFields
  before_action :find_resource, :only => [:edit, :update, :destroy]

  def index
    @http_proxies = resource_base_search_and_page
  end

  def new
    @http_proxy = HttpProxy.new
    set_form_fields
  end

  def create
    @http_proxy = HttpProxy.new(http_proxy_params)
    if @http_proxy.save
      process_success
    else
      set_form_fields
      process_error
    end
  end

  def edit
    set_form_fields
  end

  def test_connection
    if params[:http_proxy_id].present?
      @http_proxy = HttpProxy.authorized(:edit_http_proxies).find(params[:http_proxy_id])
      # Update attributes except password - preserve existing password
      form_params = http_proxy_params.except(:password)
      @http_proxy.attributes = form_params
    else
      @http_proxy = HttpProxy.new(http_proxy_params)
    end
    @http_proxy.name = 'dummy' # Required for validation

    unless @http_proxy.valid?
      raise Foreman::Exception, @http_proxy.errors.full_messages.join(', ')
    end

    @http_proxy.test_connection(params[:test_url])

    render :json => {:status => 'success', :message => _("HTTP Proxy connection successful.")}, :status => :ok
  rescue => e
    render :json => {:status => 'failure', :message => e.message}, :status => :unprocessable_entity
  end

  def update
    if @http_proxy.update(http_proxy_params)
      process_success
    else
      set_form_fields
      process_error
    end
  end

  def destroy
    if @http_proxy.destroy
      process_success
    else
      process_error
    end
  end

  private

  def set_form_fields
    @form_fields = [
      { name: 'name', label: _('Name'), required: true },
      { name: 'url', label: _('URL'), required: true, helpText: _('URL of the proxy including schema (https://proxy.example.com:8080)') },
      { name: 'username', label: _('Username'), helpText: _('Username to use if authentication is required.') },
      { name: 'password', label: _('Password'), type: 'password', helpText: _('Password to use if authentication is required.') },
      { name: 'cacert', label: _('SSL CA Certificate'), type: 'textarea', rows: 5, helpText: _('SSL CA Certificate to use if authentication is required.') },
    ]
    append_taxonomy_form_fields
  end
end
