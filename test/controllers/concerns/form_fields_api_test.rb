require 'test_helper'

class FormFieldsApiTest < ActionController::TestCase
  tests DomainsController

  test "form_fields returns JSON with fields array" do
    get :form_fields, session: set_session_user
    assert_response :success
    json = JSON.parse(response.body)
    assert json.key?('fields'), "Response should have 'fields' key"
    assert_kind_of Array, json['fields']
    assert json['fields'].length > 0, "Fields array should not be empty"
  end

  test "form_fields includes expected field attributes" do
    get :form_fields, session: set_session_user
    json = JSON.parse(response.body)
    field = json['fields'].first
    assert field.key?('name'), "Field should have 'name'"
    assert field.key?('label'), "Field should have 'label'"
  end

  test "form_fields requires authentication" do
    get :form_fields
    assert_response :unauthorized
  end
end

class ArchitecturesFormFieldsTest < ActionController::TestCase
  tests ArchitecturesController

  test "form_fields returns fields for architectures" do
    get :form_fields, session: set_session_user
    assert_response :success
    json = JSON.parse(response.body)
    assert_kind_of Array, json['fields']
    names = json['fields'].map { |f| f['name'] }
    assert_includes names, 'name'
  end
end

class HostgroupsFormFieldsTest < ActionController::TestCase
  tests HostgroupsController

  test "form_fields returns fields for hostgroups" do
    get :form_fields, session: set_session_user
    assert_response :success
    json = JSON.parse(response.body)
    assert_kind_of Array, json['fields']
    assert json['fields'].length > 0
  end
end

class LocationsFormFieldsTest < ActionController::TestCase
  tests LocationsController

  test "form_fields returns fields for locations" do
    get :form_fields, session: set_session_user
    assert_response :success
    json = JSON.parse(response.body)
    assert_kind_of Array, json['fields']
    names = json['fields'].map { |f| f['name'] }
    assert_includes names, 'name'
  end
end
