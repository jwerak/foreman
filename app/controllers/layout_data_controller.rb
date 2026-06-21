class LayoutDataController < ApplicationController
  include LayoutHelper
  include ActionView::Helpers::AssetUrlHelper

  def show
    render json: layout_data
  end
end
