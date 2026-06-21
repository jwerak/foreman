class RealmsController < ApplicationController
  include Foreman::Controller::AutoCompleteSearch
  include Foreman::Controller::Parameters::Realm

  before_action :find_resource, :only => [:edit, :update, :destroy]

  def index
    @realms = resource_base_search_and_page
  end

  def new
    @realm = Realm.new
    set_form_fields
  end

  def create
    @realm = Realm.new(realm_params)
    if @realm.save
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
    if @realm.update(realm_params)
      process_success
    else
      set_form_fields
      process_error
    end
  end

  def destroy
    if @realm.destroy
      process_success
    else
      process_error
    end
  end

  private

  def set_form_fields
    proxy_options = SmartProxy.with_features('Realm').map { |p| { value: p.id, label: p.name } }
    type_options = Realm::TYPES.map { |t| { value: t, label: t } }
    @form_fields = [
      { name: 'name', label: _('Name'), required: true, helpText: _('Realm name, e.g. EXAMPLE.COM') },
      { name: 'realm_type', label: _('Realm Type'), type: 'select', required: true, options: type_options, helpText: _('Type of realm, e.g. FreeIPA') },
      { name: 'realm_proxy_id', label: _('Realm Proxy'), type: 'select', required: true, options: proxy_options },
    ]
  end
end
