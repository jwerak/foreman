class HostgroupsController < ApplicationController
  include Foreman::Controller::AutoCompleteSearch
  include Foreman::Controller::HostDetails
  include Foreman::Controller::Parameters::Hostgroup
  include Foreman::Controller::CsvResponder
  include Foreman::Controller::SetRedirectionPath
  include Foreman::Controller::FormFieldsApi
  include Foreman::Controller::TaxonomyFormFields

  before_action :find_resource,  :only => [:nest, :clone, :edit, :update, :destroy]
  before_action :ajax_request,   :only => [:process_hostgroup]
  before_action :taxonomy_scope, :only => [:new, :edit, :process_hostgroup]

  def index
    respond_to do |format|
      format.html do
        @hostgroups = resource_base_search_and_page
        render :index
      end
      format.csv do
        csv_response(resource_base_with_search)
      end
    end
  end

  def new
    @hostgroup = Hostgroup.new
    set_form_fields
  end

  def nest
    @parent = @hostgroup
    @hostgroup = Hostgroup.new(:parent_id => @parent.id)

    load_vars_for_ajax
    @hostgroup.compute_resource_id = @parent.compute_resource_id
    @hostgroup.locations = @parent.locations
    @hostgroup.organizations = @parent.organizations
    @hostgroup.group_parameters.each { |param| @parent.group_parameters << param.dup }
    set_form_fields
    render :action => :new
  end

  def clone
    new = @hostgroup.clone
    load_vars_for_ajax
    new.valid?
    @hostgroup = new
    info _("The following fields would need reviewing")
    set_form_fields
    render :action => :new
  end

  def create
    @hostgroup = Hostgroup.new(hostgroup_params)
    if @hostgroup.save
      process_success :success_redirect => session.fetch(:redirect_path, hostgroups_path)
    else
      load_vars_for_ajax
      set_form_fields
      process_error :object => @hostgroup
    end
  end

  def edit
    load_vars_for_ajax
    set_form_fields
  end

  def update
    if @hostgroup.update(hostgroup_params)
      process_success :success_redirect => session.fetch(:redirect_path, hostgroups_path)
    else
      taxonomy_scope
      load_vars_for_ajax
      set_form_fields
      process_error :object => @hostgroup
    end
  end

  def destroy
    if @hostgroup.destroy
      process_success :success_redirect => session.fetch(:redirect_path, hostgroups_path)
    else
      load_vars_for_ajax
      process_error
    end
  rescue Ancestry::AncestryException
    process_error(:error_msg => _("Cannot delete group %{current} because it has nested groups.") % { :current => @hostgroup.title })
  end

  def process_hostgroup
    define_parent
    refresh_hostgroup
    inherit_parent_attributes
    load_vars_for_ajax
    reset_explicit_attributes

    render :partial => "form"
  end

  def csv_columns
    [:title, :hosts_count, :children_hosts_count]
  end

  private

  def load_vars_for_ajax
    return unless @hostgroup.present?

    @compute_resource_id = @hostgroup.compute_resource_id
    @architecture        = @hostgroup.architecture
    @operatingsystem     = @hostgroup.operatingsystem
    @domain              = @hostgroup.domain
    @subnet              = @hostgroup.subnet
    @realm               = @hostgroup.realm
  end

  def users_in_ancestors
    @hostgroup.ancestors.map do |ancestor|
      ancestor.users.reject { |u| @hostgroup.users.include?(u) }
    end.flatten.uniq
  end

  def action_permission
    case params[:action]
      when 'nest', 'clone'
        'view'
      else
        super
    end
  end

  def define_parent
    if params[:hostgroup][:parent_id].present?
      @parent = Hostgroup.authorized(:view_hostgroups).find(params[:hostgroup][:parent_id])
    end
  end

  def refresh_hostgroup
    if params[:hostgroup][:id].present?
      @hostgroup = Hostgroup.authorized(:view_hostgroups).find(params[:hostgroup][:id])
      @hostgroup.attributes = hostgroup_params
    else
      @hostgroup = Hostgroup.new(hostgroup_params)
    end

    @hostgroup.lookup_values.each(&:validate_value)
    @hostgroup
  end

  def inherit_parent_attributes
    return unless @parent.present?

    @hostgroup.compute_resource_id ||= @parent.compute_resource_id
    @hostgroup.architecture        ||= @parent.architecture
    @hostgroup.operatingsystem     ||= @parent.operatingsystem
    @hostgroup.domain              ||= @parent.domain
    @hostgroup.subnet              ||= @parent.subnet
    @hostgroup.realm               ||= @parent.realm
  end

  def reset_explicit_attributes
    @hostgroup.pxe_loader = nil if @parent.present?
  end

  def set_form_fields
    parent_options = helpers.parent_hostgroups.map { |hg| { value: hg.id, label: hg.to_label } }
    domain_options = Domain.authorized(:view_domains).order(:name).map { |d| { value: d.id, label: d.name } }
    realm_options = Realm.authorized(:view_realms).order(:name).map { |r| { value: r.id, label: r.name } }
    subnet_v4_options = Subnet::Ipv4.authorized(:view_subnets).order(:name).map { |s| { value: s.id, label: s.to_label } }
    subnet_v6_options = Subnet::Ipv6.authorized(:view_subnets).order(:name).map { |s| { value: s.id, label: s.to_label } }
    compute_resource_options = ComputeResource.authorized(:view_compute_resources).order(:name).map { |cr| { value: cr.id, label: cr.to_label } }
    compute_profile_options = ComputeProfile.authorized(:view_compute_profiles).order(:name).map { |cp| { value: cp.id, label: cp.name } }

    @form_fields = [
      { name: 'parent_id', label: _('Parent'), type: 'select', tab: _('Host Group'),
        options: parent_options },
      { name: 'name', label: _('Name'), required: true, tab: _('Host Group') },
      { name: 'description', label: _('Description'), type: 'textarea', tab: _('Host Group') },
      { name: 'compute_resource_id', label: _('Deploy on'), type: 'select', tab: _('Host Group'),
        options: compute_resource_options },
      { name: 'compute_profile_id', label: _('Compute Profile'), type: 'select', tab: _('Host Group'),
        options: compute_profile_options },
      { name: 'domain_id', label: _('Domain'), type: 'select', tab: _('Network'),
        options: domain_options },
      { name: 'subnet_id', label: _('IPv4 Subnet'), type: 'select', tab: _('Network'),
        options: subnet_v4_options },
      { name: 'subnet6_id', label: _('IPv6 Subnet'), type: 'select', tab: _('Network'),
        options: subnet_v6_options },
      { name: 'realm_id', label: _('Realm'), type: 'select', tab: _('Network'),
        options: realm_options },
    ]
    append_taxonomy_form_fields
  end
end
