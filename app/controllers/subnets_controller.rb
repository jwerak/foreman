class SubnetsController < ApplicationController
  include Foreman::Controller::AutoCompleteSearch
  include Foreman::Controller::Parameters::Subnet
  include Foreman::Controller::FormFieldsApi

  before_action :find_resource, :only => [:edit, :update, :destroy]

  def index
    @subnets = resource_base_search_and_page.preload(:domains, :dhcp)
    @subnets = @subnets.network_reorder(params[:order]) if params[:order].present? && params[:order] =~ /\Anetwork( ASC| DESC)?\Z/
  end

  def new
    @subnet = Subnet.new
    set_form_fields
  end

  def create
    @subnet = Subnet.new(subnet_params.except(:mask))
    if @subnet.save
      process_success success_hash
    else
      set_form_fields
      process_error
    end
  end

  def edit
    set_form_fields
  end

  def update
    if @subnet.update(subnet_params.except(:mask))
      process_success success_hash
    else
      set_form_fields
      process_error
    end
  end

  def destroy
    if @subnet.destroy
      process_success success_hash
    else
      process_error
    end
  end

  # query our subnet dhcp proxy for an unused IP
  def freeip
    unless (s = params[:subnet_id].to_i) > 0
      invalid_request
      return
    end
    organization = params[:organization_id].blank? ? nil : Organization.find(params[:organization_id])
    location = params[:location_id].blank? ? nil : Location.find(params[:location_id])
    Taxonomy.as_taxonomy organization, location do
      unless (subnet = Subnet.authorized(:view_subnets).find(s))
        not_found
        return
      end
      unless (ipam = subnet.unused_ip(params[:host_mac], params[:taken_ips])).present?
        not_found
        return
      end
      ip = ipam.suggest_ip
      render :json => {:ip => ip, :errors => ipam.errors}
    end
  rescue => e
    logger.warn "Failed to query subnet #{s} for free ip: #{e}"
    process_ajax_error(e, "get free ip")
  end

  def import
    proxy = SmartProxy.find(params[:smart_proxy_id])
    @subnets = Subnet::Ipv4.import(proxy)
    if @subnets.empty?
      warning _("No new IPv4 subnets found")
      redirect_to :subnets
    end
  end

  def create_multiple
    if params[:subnets].empty?
      return redirect_to subnets_path, :success => _("No IPv4 subnets selected")
    end

    params_filter = self.class.subnet_params_filter
    subnet_attrs = params[:subnets].map do |subnet_param|
      params_filter.filter_params(subnet_param, parameter_filter_context, :none)
    end
    @subnets = Subnet.create(subnet_attrs).reject { |s| s.errors.empty? }
    if @subnets.empty?
      process_success(:object => @subnets, :success_msg => _("Imported IPv4 Subnets"))
    else
      render :action => "import"
    end
  end

  private

  def success_hash
    { :success_redirect => params[:redirect].presence }
  end

  def set_form_fields
    boot_mode_options = Subnet::BOOT_MODES.map { |_, mode| { value: mode, label: _(mode) } }
    ipam_options = IPAM::MODES.map { |_, mode| { value: mode, label: _(mode) } }
    domain_options = Domain.authorized(:view_domains).order(:name).map { |d| { value: d.id, label: d.name } }
    proxy_options = ->(feature) { SmartProxy.authorized(:view_smart_proxies).with_features(feature).map { |p| { value: p.id, label: p.name } } }

    @form_fields = [
      { name: 'name', label: _('Name'), required: true, tab: _('Subnet') },
      { name: 'description', label: _('Description'), type: 'textarea', tab: _('Subnet') },
      { name: 'network', label: _('Network Address'), required: true, tab: _('Subnet') },
      { name: 'cidr', label: _('Network Prefix'), tab: _('Subnet'),
        helpText: _('Prefix length for this subnet, e.g. 24') },
      { name: 'gateway', label: _('Gateway Address'), tab: _('Subnet'),
        helpText: _('Gateway for this subnet') },
      { name: 'dns_primary', label: _('Primary DNS Server'), tab: _('Subnet') },
      { name: 'dns_secondary', label: _('Secondary DNS Server'), tab: _('Subnet') },
      { name: 'ipam', label: _('IPAM'), type: 'select', options: ipam_options, tab: _('Subnet') },
      { name: 'from', label: _('Start of IP Range'), tab: _('Subnet'),
        helpText: _('Starting IP Address for IP auto suggestion') },
      { name: 'to', label: _('End of IP Range'), tab: _('Subnet'),
        helpText: _('Ending IP Address for IP auto suggestion') },
      { name: 'vlanid', label: _('VLAN ID'), type: 'number', tab: _('Subnet'),
        helpText: _('VLAN ID for this subnet') },
      { name: 'mtu', label: _('MTU'), type: 'number', tab: _('Subnet'),
        helpText: _('MTU for this subnet') },
      { name: 'nic_delay', label: _('Link Delay'), type: 'number', tab: _('Subnet'),
        helpText: _('Delay network activity during install for X seconds') },
      { name: 'boot_mode', label: _('Boot Mode'), type: 'select', options: boot_mode_options, tab: _('Subnet'),
        helpText: _('Default boot mode for interfaces assigned to this subnet') },
      { name: 'domain_ids', label: _('Domains'), type: 'checkboxGroup', tab: _('Domains'),
        options: domain_options, loadKey: 'domains',
        helpText: _('Domains in which this subnet is part') },
      { name: 'dhcp_id', label: _('DHCP Proxy'), type: 'select', tab: _('Proxies'),
        options: proxy_options.call('DHCP'),
        labelHelp: _('DHCP Proxy to use within this subnet') },
      { name: 'tftp_id', label: _('TFTP Proxy'), type: 'select', tab: _('Proxies'),
        options: proxy_options.call('TFTP'),
        labelHelp: _('TFTP Proxy to use within this subnet') },
      { name: 'httpboot_id', label: _('HTTPBoot Proxy'), type: 'select', tab: _('Proxies'),
        options: proxy_options.call('HTTPBoot'),
        labelHelp: _('HTTPBoot Proxy to use within this subnet') },
      { name: 'dns_id', label: _('Reverse DNS Proxy'), type: 'select', tab: _('Proxies'),
        options: proxy_options.call('DNS'),
        labelHelp: _('DNS Proxy to use within this subnet for managing PTR records') },
      { name: 'template_id', label: _('Template Proxy'), type: 'select', tab: _('Proxies'),
        options: proxy_options.call('Templates'),
        labelHelp: _('Template HTTP(S) Proxy to use within this subnet') },
      { name: 'bmc_id', label: _('BMC Proxy'), type: 'select', tab: _('Proxies'),
        options: proxy_options.call('BMC'),
        labelHelp: _('BMC Proxy to use within this subnet for management access') },
    ]
  end
end
