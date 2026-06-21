require 'test_helper'

class Api::V2::TopologyControllerTest < ActionController::TestCase
  test "should get infrastructure topology" do
    FactoryBot.create(:compute_resource, :libvirt)
    get :infrastructure
    assert_response :success
    data = ActiveSupport::JSON.decode(@response.body)
    assert data.key?('nodes'), 'Response should have nodes'
    assert data.key?('edges'), 'Response should have edges'
    assert data.key?('meta'), 'Response should have meta'
    assert data['meta'].key?('total_compute_resources')
    assert data['meta'].key?('total_hosts')
  end

  test "infrastructure nodes include compute resources" do
    cr = FactoryBot.create(:compute_resource, :libvirt)
    get :infrastructure
    assert_response :success
    data = ActiveSupport::JSON.decode(@response.body)
    cr_nodes = data['nodes'].select { |n| n['type'] == 'compute-resource' }
    assert_operator cr_nodes.length, :>=, 1
    assert_equal cr.name, cr_nodes.first['label']
  end

  test "infrastructure with show_hosts includes host nodes" do
    host = FactoryBot.create(:host, :managed, :with_compute_resource)
    get :infrastructure, params: { show_hosts: true }
    assert_response :success
    data = ActiveSupport::JSON.decode(@response.body)
    host_nodes = data['nodes'].select { |n| n['type'] == 'host' }
    assert_operator host_nodes.length, :>=, 1
    assert_operator data['edges'].length, :>=, 1
  end

  test "infrastructure with errors_only filters healthy resources" do
    FactoryBot.create(:host, :managed, :with_compute_resource)
    get :infrastructure, params: { errors_only: true }
    assert_response :success
    data = ActiveSupport::JSON.decode(@response.body)
    data['nodes'].each do |node|
      next if node['type'] == 'host'
      assert(node['data']['error_count']&.positive?, "Node #{node['label']} should have errors") if node['data'].key?('error_count')
    end
  end

  test "should get configuration topology" do
    FactoryBot.create(:hostgroup)
    get :configuration
    assert_response :success
    data = ActiveSupport::JSON.decode(@response.body)
    assert data.key?('nodes'), 'Response should have nodes'
    assert data.key?('edges'), 'Response should have edges'
    assert data.key?('meta'), 'Response should have meta'
    assert data['meta'].key?('total_hostgroups')
    assert data['meta'].key?('total_hosts')
  end

  test "configuration nodes include hostgroups" do
    hg = FactoryBot.create(:hostgroup)
    get :configuration
    assert_response :success
    data = ActiveSupport::JSON.decode(@response.body)
    hg_nodes = data['nodes'].select { |n| n['type'] == 'hostgroup' }
    assert_operator hg_nodes.length, :>=, 1
    assert_equal hg.name, hg_nodes.first['label']
  end

  test "configuration edges reflect parent-child hierarchy" do
    parent = FactoryBot.create(:hostgroup, :name => 'parent')
    child = FactoryBot.create(:hostgroup, :name => 'child', :parent => parent)
    get :configuration
    assert_response :success
    data = ActiveSupport::JSON.decode(@response.body)
    edge = data['edges'].find { |e| e['source'] == "hg-#{parent.id}" && e['target'] == "hg-#{child.id}" }
    assert edge, "Should have edge from parent to child hostgroup"
  end

  test "configuration with show_hosts includes host nodes" do
    hg = FactoryBot.create(:hostgroup)
    FactoryBot.create(:host, :managed, :hostgroup => hg)
    get :configuration, params: { show_hosts: true }
    assert_response :success
    data = ActiveSupport::JSON.decode(@response.body)
    host_nodes = data['nodes'].select { |n| n['type'] == 'host' }
    assert_operator host_nodes.length, :>=, 1
  end

  test "should deny access without view_hosts permission" do
    setup_user('view', 'architectures')
    get :infrastructure, session: set_session_user(users(:one))
    assert_response :forbidden
  end
end
