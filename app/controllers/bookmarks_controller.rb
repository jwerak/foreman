class BookmarksController < ApplicationController
  include Foreman::Controller::AutoCompleteSearch
  include Foreman::Controller::BookmarkCommon
  include Foreman::Controller::Parameters::Bookmark

  before_action :find_resource, :only => [:edit, :update, :destroy]

  def index
    @bookmarks = resource_base_search_and_page
  end

  def edit
    set_form_fields
  end

  def update
    if @bookmark.update(bookmark_params)
      redirect_to(bookmarks_path, :success => _('Bookmark was successfully updated'))
    else
      set_form_fields
      render :action => "edit"
    end
  end

  def destroy
    @bookmark.destroy
    redirect_to(bookmarks_url)
  end

  private

  def set_form_fields
    @form_fields = [
      { name: 'name', label: _('Name'), required: true },
      { name: 'query', label: _('Query'), type: 'textarea', rows: 3 },
      { name: 'public', label: _('Public'), type: 'checkbox', checkboxLabel: _('Public bookmark') },
      { name: 'controller', type: 'hidden' },
    ]
  end
end
