class TemplatesController < ApplicationController
  include Foreman::Controller::ProvisioningTemplates
  include Foreman::Controller::AutoCompleteSearch
  include AuditsHelper

  before_action :handle_template_upload, :only => [:create, :update]
  before_action :find_resource, :only => [:edit, :update, :destroy, :clone_template, :lock, :unlock, :export]
  before_action :load_history, :only => :edit
  before_action :type_name_plural, :type_name_singular, :resource_class

  include TemplatePathsHelper

  def index
    @templates = resource_base_search_and_page
    @templates = @templates.includes(resource_base.template_includes)
  end

  def new
    @template = resource_class.new
    @dsl_cache = ApipieDSL.docs
    set_template_form_data
  end

  # we can't use `clone` here, ActionController disables public method that are inherited and present in Base
  # parent classes (so all controllers don't have actions like id, clone, dup, ...), unfortunatelly they don't
  # detect method definitions in controller ancestors, only methods defined directly in child controller
  def clone_template
    original = @template
    @template = @template.dup
    @template.cloned_from = original
    @template.name += ' clone'
    @template.locked = false
    load_vars_from_template
    @template.valid?
    @dsl_cache = ApipieDSL.docs
    set_template_form_data
    render :action => :new
  end

  def lock
    set_locked true
  end

  def unlock
    set_locked false
  end

  def create
    @template = resource_class.new(resource_params)
    if @template.save
      process_success :object => @template
    else
      load_vars_from_template
      @dsl_cache = ApipieDSL.docs
      set_template_form_data
      process_error :object => @template
    end
  end

  def edit
    load_vars_from_template
    @dsl_cache = ApipieDSL.docs
    set_template_form_data
  end

  def update
    if @template.update(resource_params)
      process_success :object => @template
    else
      load_history
      load_vars_from_template
      @dsl_cache = ApipieDSL.docs
      set_template_form_data
      process_error :object => @template
    end
  end

  def revision
    audit = Audit.find(params[:version])
    render :json => audit.revision.template
  end

  def destroy
    if @template.destroy
      process_success :object => @template
    else
      process_error :object => @template
    end
  end

  def auto_complete_controller_name
    type_name_plural
  end

  def preview
    # Not using before_action :find_resource method because we have enabled preview to work for unsaved templates hence no resource could be found in those cases
    if params[:id]
      find_resource
    else
      @template = resource_class.new(params[type_name_plural])
    end

    template_kind = TemplateKind.find_by(id: params[:template_kind_id]) if params[:template_kind_id]

    unless template_kind&.name == 'registration'
      scope = template_kind&.name == 'host_init_config' ? Template : @template.class
      base  = scope.preview_host_collection
      @host = params[:preview_host_id].present? ? base.find(params[:preview_host_id]) : base.first

      if @host.nil?
        render :plain => _('No host could be found for rendering the template'), :status => :not_found
        return
      end
    end
    @template.template = params[:template]

    renderer = params.delete('force_safemode') ? Foreman::Renderer::SafeModeRenderer : Foreman::Renderer
    safe_render(@template, Foreman::Renderer::PREVIEW_MODE, renderer, escape_json: true)
  end

  def export
    send_data @template.to_erb, :type => 'text/plain', :disposition => 'attachment', :filename => @template.filename
  end

  def resource_class
    @resource_class ||= controller_name.singularize.classify.constantize
  end

  def resource_name
    'template'
  end

  private

  def safe_render(template, mode = Foreman::Renderer::REAL_MODE, renderer = Foreman::Renderer, render_on_error: :plain, **params)
    escape = params.delete :escape_json

    rendered_text = template.render(renderer: renderer, host: @host, params: params, mode: mode, **params)
    rendered_text = rendered_text.to_json if escape
    render :plain => rendered_text
  rescue => error
    Foreman::Logging.exception("Error rendering the #{template.name} template", error)
    if error.is_a?(Foreman::Renderer::Errors::RenderingError)
      text = error.message
    else
      text = _("There was an error rendering the %{name} template: %{error}") % {:name => template.name, :error => error.message}
    end

    if render_on_error == :plain
      render :plain => text, :status => :internal_server_error
    else
      error error.message, :now => true
      render render_on_error, :status => :internal_server_error
    end
  end

  def set_template_form_data
    load_vars_from_template if @template&.persisted?
    @dsl_cache ||= ApipieDSL.docs

    is_new = !@template.persisted?
    type_singular = type_name_singular

    template_attrs = {
      id: @template.id,
      name: @template.name,
      template: @template.template,
      snippet: @template.snippet,
      locked: @template.locked,
      default: @template.try(:default) || false,
      description: @template.description,
      audit_comment: '',
      cloned_from_id: @template.cloned_from_id,
      cloned_from_name: @template.cloned_from&.name,
      template_inputs_attributes: @template.template_inputs.map { |ti|
        {
          id: ti.id, name: ti.name, required: ti.required,
          input_type: ti.input_type, value_type: ti.value_type,
          resource_type: ti.resource_type, fact_name: ti.fact_name,
          variable_name: ti.variable_name, description: ti.description,
          options: ti.options, default: ti.default,
          advanced: ti.advanced, hidden_value: ti.hidden_value,
        }
      },
      location_ids: @template.location_ids,
      organization_ids: @template.organization_ids,
    }

    if @template.respond_to?(:template_kind_id)
      template_attrs[:template_kind_id] = @template.template_kind_id
    end

    if @template.is_a?(Ptable)
      template_attrs[:os_family] = @template.os_family
    end

    input_types = helpers.template_input_types_options(@template.available_input_types)
      .map { |label, value| { value: value.to_s, label: label } }

    form_options = {
      locations: Location.my_locations.map { |l| { value: l.id, label: l.title } },
      organizations: Organization.my_organizations.map { |o| { value: o.id, label: o.title } },
      inputTypes: input_types,
      valueTypes: helpers.template_input_value_type_options.map { |label, value| { value: value, label: label } },
      resourceTypes: Permission.resources_with_translations.map { |label, value| { value: value, label: label } },
    }

    if @template.respond_to?(:template_kind_id)
      form_options[:templateKinds] = TemplateKind.order(:name).map { |k| { value: k.id, label: k.to_s } }
    end

    render_path = @template.persisted? ? url_for(template_hash_for_member(@template, 'preview')) : ''
    safemode_render_path = @template.persisted? ? url_for(template_hash_for_member(@template, 'preview').merge(params: { force_safemode: true })) : ''

    editor_props = {
      dslCache: @dsl_cache.to_json,
      templateFieldName: helpers.template_name_attribute(@template.class),
      templateClass: helpers.template_class_name(@template),
      showPreview: @template.support_preview?,
      showHostSelector: @template.support_single_host_render?,
      isSafemodeEnabled: Setting[:safemode_render],
      renderPath: render_path,
      safemodeRenderPath: safemode_render_path,
    }

    os_families = Operatingsystem.families_as_collection.map { |f| { value: f.value, label: f.name } }

    @template_form_data = {
      template: template_attrs,
      options: form_options,
      editor: editor_props,
      meta: {
        isNew: is_new,
        cancelUrl: template_path_for(@template.class),
        templateType: type_singular,
        apiUrl: "/api/v2/#{type_name_plural}",
        resourceName: type_singular,
        showDefault: helpers.show_default?,
        showLocationTab: helpers.show_location_tab?,
        showOrganizationTab: helpers.show_organization_tab?,
        osFamilies: os_families,
      },
    }
  end

  def set_locked(locked)
    @template.locked = locked
    if @template.save
      process_success :success_msg => (locked ? _('Template locked') : _('Template unlocked')), :success_redirect => :back, :object => @template
    else
      process_error :object => @template
    end
  end

  def load_history
    return unless @template
    @history = Audit.descending
                    .where(:auditable_id => @template.id,
                      :auditable_type => @template.class.base_class.name,
                      :action => %w(update create))
                    .select { |audit| audit_template? audit }
  end

  def action_permission
    case params[:action]
      when 'lock', 'unlock'
        :lock
      when 'clone_template', 'preview', 'export'
        :view
      else
        super
    end
  end

  def type_name_plural
    @type_name_plural ||= type_name_singular.pluralize
  end

  def resource_params
    public_send "#{type_name_singular}_params".to_sym
  end
end
