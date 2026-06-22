module Foreman::Controller::TaxonomiesController
  extend ActiveSupport::Concern

  included do
    include Foreman::Controller::FormFieldsApi

    before_action :find_resource, :only => %w{edit update destroy clone_taxonomy assign_hosts
                                              assign_selected_hosts assign_all_hosts step2 select
                                              parent_taxonomy_selected}
    before_action :count_nil_hosts, :only => %w{index create step2}
    before_action :new_taxonomy, :only => %w{create}
    skip_before_action :authorize, :set_taxonomy, :only => %w{select clear}
  end

  def index
    begin
      values = taxonomy_class.send("my_#{taxonomies_plural}").search_for(params[:search], :order => params[:order])
    rescue => e
      error e.to_s
      values = taxonomy_class.send("my_#{taxonomies_plural}")
    end

    respond_to do |format|
      format.html do
        @taxonomies = values.paginate(:page => params[:page], :per_page => params[:per_page])
        render 'taxonomies/index'
      end
      format.json
    end
  end

  def new
    @taxonomy = taxonomy_class.new
    Taxonomy.no_taxonomy_scope do
      set_form_fields
      render 'taxonomies/new'
    end
  end

  def nest
    @taxonomy           = taxonomy_class.new
    @taxonomy.parent_id = params[:id].to_i if resource_scope.find_by_id(params[:id])
    set_form_fields
    render 'taxonomies/new'
  end

  def clone_taxonomy
    @old_name = @taxonomy.name
    @taxonomy = @taxonomy.dup
    set_form_fields
    render 'taxonomies/clone'
  end

  def create
    if @taxonomy.save
      switch_taxonomy
      if @count_nil_hosts > 0
        redirect_to send("step2_#{taxonomy_single}_path", @taxonomy)
      else
        process_success(:object => @taxonomy, :success_redirect => send("edit_#{taxonomy_single}_path", @taxonomy))
      end
    else
      set_form_fields
      process_error(:render => "taxonomies/new", :object => @taxonomy)
    end
  end

  def edit
    Taxonomy.no_taxonomy_scope do
      set_form_fields
      render 'taxonomies/edit'
    end
  end

  def step2
    Taxonomy.no_taxonomy_scope do
      render 'taxonomies/step2'
    end
  end

  def update
    result = Taxonomy.no_taxonomy_scope do
      @taxonomy.update(resource_params)
    end
    if result
      process_success(:object => @taxonomy)
    else
      set_form_fields
      process_error(:render => "taxonomies/edit", :object => @taxonomy)
    end
  end

  def destroy
    if @taxonomy.destroy
      clear_current_taxonomy_from_session if session[taxonomy_id] == @taxonomy.id
      process_success
    else
      process_error
    end
  rescue Ancestry::AncestryException
    process_error(:error_msg => _('Cannot delete %{current} because it has nested %{sti_name}.') % { :current => @taxonomy.title, :sti_name => @taxonomy.sti_name })
  end

  def select
    switch_taxonomy
    redirect_back_or_to root_url
  end

  def clear
    clear_current_taxonomy_from_session
    redirect_back_or_to root_url
  end

  def clear_current_taxonomy_from_session
    taxonomy_class.current = nil
    # session can't store nil, so we use empty string to represent any context
    session[taxonomy_id] = ''
    TopbarSweeper.expire_cache
  end

  def mismatches
    Taxonomy.no_taxonomy_scope do
      @mismatches = Taxonomy.all_mismatcheds
    end
    render 'taxonomies/mismatches'
  end

  def import_mismatches
    @taxonomy = Taxonomy.find_by_id(params[:id])
    if @taxonomy
      @mismatches = @taxonomy.import_missing_ids
      redirect_to send("edit_#{taxonomy_single}_path", @taxonomy), :success => _("All mismatches between hosts and %s have been fixed") % CGI.escapeHTML(@taxonomy.name)
    else
      Taxonomy.all_import_missing_ids
      redirect_to send("#{taxonomies_plural}_path"), :success => _("All mismatches between hosts and locations/organizations have been fixed")
    end
  end

  def assign_hosts
    @taxonomy_type = taxonomy_single.classify
    @hosts = hosts_scope_without_taxonomy.includes(included_associations).search_for(params[:search], :order => params[:order]).paginate(:page => params[:page], :per_page => params[:per_page])
    render "hosts/assign_hosts"
  end

  def assign_all_hosts
    hosts_scope_without_taxonomy.update_all(taxonomy_id => @taxonomy.id)
    @taxonomy.import_missing_ids
    redirect_to send("#{taxonomies_plural}_path"), :success => _("All hosts previously with no %{single} are now assigned to %{name}") % { :single => taxonomy_single, :name => CGI.escapeHTML(@taxonomy.name) }
  end

  def assign_selected_hosts
    host_ids = params[taxonomy_single.to_sym][:host_ids] - ["0"]
    @hosts = hosts_scope_without_taxonomy.where(:id => host_ids).update_all(taxonomy_id => @taxonomy.id)
    @taxonomy.import_missing_ids
    redirect_to send("#{taxonomies_plural}_path"), :success => _("Selected hosts are now assigned to %s") % CGI.escapeHTML(@taxonomy.name)
  end

  def parent_taxonomy_selected
    return head(:not_found) unless @taxonomy
    @taxonomy.parent_id = params[:parent_id]
    render :partial => "taxonomies/form", :locals => {:taxonomy => @taxonomy}
  end

  private

  def taxonomy_id
    case controller_name
      when 'organizations'
        :organization_id
      when 'locations'
        :location_id
    end
  end

  def taxonomy_single
    controller_name.singularize
  end

  def taxonomies_plural
    controller_name
  end

  def taxonomy_class
    controller_name.classify.constantize
  end

  # overwrite application_controller
  def find_resource
    if params[:id].blank?
      not_found
      return
    end

    case controller_name
      when 'organizations'
        @taxonomy = @organization = resource_scope.find(params[:id])
      when 'locations'
        @taxonomy = @location = resource_scope.find(params[:id])
    end
  end

  def resource_scope(...)
    taxonomy_class.send("my_#{taxonomies_plural}")
  end

  def count_nil_hosts
    return @count_nil_hosts if @count_nil_hosts
    @count_nil_hosts = hosts_scope_without_taxonomy.count
  end

  def hosts_scope
    Host.authorized(:view_hosts, Host)
  end

  def hosts_scope_without_taxonomy
    hosts_scope.send("no_#{taxonomy_single}")
  end

  def resource_params
    public_send("#{taxonomy_single}_params".to_sym)
  end

  def new_taxonomy
    @taxonomy = taxonomy_class.new(resource_params)
  end

  def switch_taxonomy
    taxonomy_class.current = @taxonomy
    session[taxonomy_id] = @taxonomy ? @taxonomy.id : nil

    TopbarSweeper.expire_cache
  end

  def set_form_fields
    parent_scope = taxonomy_class.completer_scope(nil).authorized("edit_#{taxonomies_plural}").order(:title)
    parent_scope = parent_scope.where.not(id: @taxonomy.subtree_ids) if @taxonomy&.persisted?
    parent_options = parent_scope.map { |t| { value: t.id, label: t.title } }

    @form_fields = [
      { name: 'parent_id', label: _('Parent'), type: 'select', tab: taxonomy_class.model_name.human,
        options: parent_options },
      { name: 'name', label: _('Name'), required: true, tab: taxonomy_class.model_name.human },
      { name: 'description', label: _('Description'), type: 'textarea', tab: taxonomy_class.model_name.human },
    ]

    if User.current.can?(:view_users)
      @form_fields += [{ name: 'user_ids', label: _('Users'), type: 'checkboxGroup', tab: _('Users'),
        options: User.except_hidden.authorized(:view_users).order(:login).map { |u| { value: u.id, label: u.select_title } },
        loadKey: 'users' }]
    end
    if User.current.can?(:view_smart_proxies)
      @form_fields += [{ name: 'smart_proxy_ids', label: _('Smart Proxies'), type: 'checkboxGroup', tab: _('Smart Proxies'),
        options: SmartProxy.authorized(:view_smart_proxies).order(:name).map { |p| { value: p.id, label: p.name } },
        loadKey: 'smart_proxies' }]
    end
    if User.current.can?(:view_subnets)
      @form_fields += [{ name: 'subnet_ids', label: _('Subnets'), type: 'checkboxGroup', tab: _('Subnets'),
        options: Subnet.authorized(:view_subnets).order(:name).map { |s| { value: s.id, label: s.to_label } },
        loadKey: 'subnets' }]
    end
    if User.current.can?(:view_compute_resources)
      @form_fields += [{ name: 'compute_resource_ids', label: _('Compute Resources'), type: 'checkboxGroup', tab: _('Compute Resources'),
        options: ComputeResource.authorized(:view_compute_resources).order(:name).map { |cr| { value: cr.id, label: cr.to_label } },
        loadKey: 'compute_resources' }]
    end
    if User.current.can?(:view_media)
      @form_fields += [{ name: 'medium_ids', label: _('Installation Media'), type: 'checkboxGroup', tab: _('Installation Media'),
        options: Medium.authorized(:view_media).order(:name).map { |m| { value: m.id, label: m.name } },
        loadKey: 'media' }]
    end
    if User.current.can?(:view_provisioning_templates)
      @form_fields += [{ name: 'provisioning_template_ids', label: _('Provisioning Templates'), type: 'checkboxGroup', tab: _('Provisioning Templates'),
        options: ProvisioningTemplate.authorized(:view_provisioning_templates).order(:name).map { |t| { value: t.id, label: t.name } },
        loadKey: 'provisioning_templates' }]
    end
    if User.current.can?(:view_ptables)
      @form_fields += [{ name: 'ptable_ids', label: _('Partition Tables'), type: 'checkboxGroup', tab: _('Partition Tables'),
        options: Ptable.authorized(:view_ptables).order(:name).map { |pt| { value: pt.id, label: pt.name } },
        loadKey: 'ptables' }]
    end
    if User.current.can?(:view_domains)
      @form_fields += [{ name: 'domain_ids', label: _('Domains'), type: 'checkboxGroup', tab: _('Domains'),
        options: Domain.authorized(:view_domains).order(:name).map { |d| { value: d.id, label: d.name } },
        loadKey: 'domains' }]
    end
    if User.current.can?(:view_realms)
      @form_fields += [{ name: 'realm_ids', label: _('Realms'), type: 'checkboxGroup', tab: _('Realms'),
        options: Realm.authorized(:view_realms).order(:name).map { |r| { value: r.id, label: r.name } },
        loadKey: 'realms' }]
    end
    if User.current.can?(:view_hostgroups)
      @form_fields += [{ name: 'hostgroup_ids', label: _('Host Groups'), type: 'checkboxGroup', tab: _('Host Groups'),
        options: Hostgroup.authorized(:view_hostgroups).order(:name).map { |hg| { value: hg.id, label: hg.to_label } },
        loadKey: 'hostgroups' }]
    end

    if taxonomy_class == Location && helpers.show_organization_tab?
      @form_fields += [{ name: 'organization_ids', label: _('Organizations'), type: 'checkboxGroup', tab: _('Organizations'),
        options: Organization.authorized(:view_organizations).order(:title).map { |o| { value: o.id, label: o.title } },
        loadKey: 'organizations' }]
    elsif taxonomy_class == Organization && helpers.show_location_tab?
      @form_fields += [{ name: 'location_ids', label: _('Locations'), type: 'checkboxGroup', tab: _('Locations'),
        options: Location.authorized(:view_locations).order(:title).map { |l| { value: l.id, label: l.title } },
        loadKey: 'locations' }]
    end
  end
end
