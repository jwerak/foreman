class ImagesController < ApplicationController
  include Foreman::Controller::Parameters::Image
  include Foreman::Controller::FormFieldsApi

  before_action :find_compute_resource
  before_action :find_resource, :only => [:edit, :update, :destroy]

  def index
    # Listing images in /hosts/new consumes this method as JSON
    @images = resource_base.where(:compute_resource_id => @compute_resource.id).includes(:operatingsystem)
    respond_to do |format|
      format.html { params[:partial] ? render(:partial => 'images/list') : render(:index) }
      format.json { render :json => @images.where(:operatingsystem_id => params[:operatingsystem_id], :architecture_id => params[:architecture_id]).order(:name) }
    end
  end

  def new
    @image = Image.new
    set_form_fields
  end

  def create
    @image = Image.new(image_params)
    if @image.save
      process_success :success_redirect => compute_resource_path(@compute_resource)
    else
      set_form_fields
      process_error
    end
  end

  def edit
    set_form_fields
  end

  def update
    if @image.update(image_params.reject { |k, v| k == :password && v.blank? })
      process_success :success_redirect => compute_resource_path(@compute_resource)
    else
      set_form_fields
      process_error
    end
  end

  def destroy
    if @image.destroy
      process_success :success_redirect => compute_resource_path(@compute_resource)
    else
      process_error
    end
  end

  private

  def set_form_fields
    os_options = Operatingsystem.authorized(:view_operatingsystems).all.map { |os| { value: os.id, label: os.to_label } }
    arch_options = Architecture.authorized(:view_architectures).all.map { |a| { value: a.id, label: a.to_label } }
    @form_fields = [
      { name: 'name', label: _('Name'), required: true },
      { name: 'operatingsystem_id', label: _('Operating System'), type: 'select', required: true, options: os_options },
      { name: 'architecture_id', label: _('Architecture'), type: 'select', required: true, options: arch_options },
      { name: 'compute_resource_id', type: 'hidden', initialValue: @compute_resource&.id },
    ]
  end

  def find_compute_resource
    @compute_resource = ComputeResource.authorized(:view_compute_resources).find(params.delete(:compute_resource_id))
  end
end
