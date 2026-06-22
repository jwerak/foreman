class DomainsController < ApplicationController
  include Foreman::Controller::AutoCompleteSearch
  include Foreman::Controller::Parameters::Domain
  include Foreman::Controller::FormFieldsApi
  include Foreman::Controller::TaxonomyFormFields
  before_action :find_resource, :only => [:edit, :update, :destroy]

  def index
    @domains = resource_base_search_and_page
  end

  def new
    @domain = Domain.new
    set_form_fields
  end

  def create
    @domain = Domain.new(domain_params)
    if @domain.save
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
    if @domain.update(domain_params)
      process_success
    else
      set_form_fields
      process_error
    end
  end

  def destroy
    if @domain.destroy
      process_success
    else
      process_error
    end
  end

  private

  def set_form_fields
    dns_proxy_options = SmartProxy.authorized(:view_smart_proxies).with_features('DNS').map { |p| { value: p.id, label: p.name } }
    @form_fields = [
      { name: 'name', label: _('DNS Domain'), required: true, helpText: _('The full DNS domain name') },
      { name: 'fullname', label: _('Full name'), helpText: _('Full name describing the domain') },
      { name: 'dns_id', label: _('DNS Proxy'), type: 'select', options: dns_proxy_options,
        labelHelp: _('DNS proxy to use within this domain for managing A records, note that PTR records are managed via Subnet DNS proxy') },
    ]
    append_taxonomy_form_fields
  end
end
