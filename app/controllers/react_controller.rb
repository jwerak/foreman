class ReactController < ApplicationController
  layout :react_resolve_layout
  skip_before_action :authorize, :only => :index

  def index
    response.headers['X-Request-Path'] = request.path
    render("react/index", formats: [:html])
  end

  private

  def react_resolve_layout
    return 'spa_content' if spa_fetch_request?
    'layouts/react_application'
  end
end
