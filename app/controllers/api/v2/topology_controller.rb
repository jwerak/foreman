module Api
  module V2
    class TopologyController < V2::BaseController
      include Api::Version2

      api :GET, "/topology/infrastructure", N_("Infrastructure topology graph data")
      param :show_hosts, :bool, :desc => N_("Include individual host nodes"), :required => false
      param :errors_only, :bool, :desc => N_("Show only nodes/groups with error status"), :required => false

      def infrastructure
        compute_resources = ComputeResource.authorized(:view_compute_resources)
        host_counts = host_counter(:compute_resource)
        error_counts = error_counter(:compute_resource_id)

        nodes = []
        edges = []

        compute_resources.each do |cr|
          cr_node_id = "cr-#{cr.id}"
          total = host_counts[cr]
          errors = error_counts[cr.id] || 0

          next if foreman_param_to_bool(:errors_only) && errors == 0

          nodes << {
            id: cr_node_id,
            type: 'compute-resource',
            label: cr.name,
            data: {
              provider: cr.provider_friendly_name,
              hosts_count: total,
              error_count: errors,
              url: "/compute_resources/#{cr.id}",
            },
          }

          if foreman_param_to_bool(:show_hosts)
            hosts_scope = Host::Managed.authorized(:view_hosts).where(compute_resource_id: cr.id)
            hosts_scope = hosts_scope.where(global_status: HostStatus::Global::ERROR) if foreman_param_to_bool(:errors_only)
            hosts_scope.select(:id, :name, :global_status, :compute_resource_id, :hostgroup_id).each do |host|
              host_node_id = "host-#{host.id}"
              nodes << build_host_node(host, host_node_id)
              edges << { id: "edge-#{cr_node_id}-#{host_node_id}", source: cr_node_id, target: host_node_id }
            end
          end
        end

        bare_hosts = Host::Managed.authorized(:view_hosts).where(compute_resource_id: nil)
        bare_count = bare_hosts.count
        bare_errors = bare_hosts.where(global_status: HostStatus::Global::ERROR).count

        unless bare_count == 0 || (foreman_param_to_bool(:errors_only) && bare_errors == 0)
          nodes << {
            id: 'bare-metal',
            type: 'bare-metal',
            label: N_('Bare Metal'),
            data: { hosts_count: bare_count, error_count: bare_errors },
          }

          if foreman_param_to_bool(:show_hosts)
            scope = bare_hosts
            scope = scope.where(global_status: HostStatus::Global::ERROR) if foreman_param_to_bool(:errors_only)
            scope.select(:id, :name, :global_status, :compute_resource_id, :hostgroup_id).each do |host|
              host_node_id = "host-#{host.id}"
              nodes << build_host_node(host, host_node_id)
              edges << { id: "edge-bare-metal-#{host_node_id}", source: 'bare-metal', target: host_node_id }
            end
          end
        end

        render json: {
          nodes: nodes,
          edges: edges,
          meta: {
            total_compute_resources: compute_resources.count,
            total_hosts: Host::Managed.authorized(:view_hosts).count,
          },
        }
      end

      api :GET, "/topology/configuration", N_("Configuration management topology graph data")
      param :show_hosts, :bool, :desc => N_("Include individual host nodes"), :required => false
      param :errors_only, :bool, :desc => N_("Show only nodes/groups with error status"), :required => false

      def configuration
        hostgroups = Hostgroup.authorized(:view_hostgroups)
        host_counts = host_counter(:hostgroup)
        error_counts = error_counter(:hostgroup_id)

        nodes = []
        edges = []

        Hostgroup.sort_by_ancestry(hostgroups.to_a).each do |hg|
          hg_node_id = "hg-#{hg.id}"
          total = host_counts[hg]
          errors = error_counts[hg.id] || 0

          next if foreman_param_to_bool(:errors_only) && errors == 0 && total == 0

          nodes << {
            id: hg_node_id,
            type: 'hostgroup',
            label: hg.name,
            data: {
              title: hg.title,
              hosts_count: total,
              error_count: errors,
              parent_id: hg.parent_id,
              url: "/hostgroups/#{hg.id}",
            },
          }

          if hg.parent_id
            parent_node_id = "hg-#{hg.parent_id}"
            edges << { id: "edge-#{parent_node_id}-#{hg_node_id}", source: parent_node_id, target: hg_node_id }
          end

          next unless foreman_param_to_bool(:show_hosts)

          hosts_scope = Host::Managed.authorized(:view_hosts).where(hostgroup_id: hg.id)
          hosts_scope = hosts_scope.where(global_status: HostStatus::Global::ERROR) if foreman_param_to_bool(:errors_only)
          hosts_scope.select(:id, :name, :global_status, :compute_resource_id, :hostgroup_id).each do |host|
            host_node_id = "host-#{host.id}"
            nodes << build_host_node(host, host_node_id)
            edges << { id: "edge-#{hg_node_id}-#{host_node_id}", source: hg_node_id, target: host_node_id }
          end
        end

        render json: {
          nodes: nodes,
          edges: edges,
          meta: {
            total_hostgroups: hostgroups.count,
            total_hosts: Host::Managed.authorized(:view_hosts).count,
          },
        }
      end

      private

      def controller_permission
        'hosts'
      end

      def action_permission
        'view'
      end

      def foreman_param_to_bool(name)
        Foreman::Cast.to_bool(params[name])
      end

      def host_counter(association)
        HostCounter.new(association)
      end

      def error_counter(group_column)
        Host::Managed.authorized(:view_hosts)
                      .where(global_status: HostStatus::Global::ERROR)
                      .group(group_column)
                      .count
      end

      def build_host_node(host, node_id)
        {
          id: node_id,
          type: 'host',
          label: host.name,
          data: {
            global_status: host.global_status,
            compute_resource_id: host.compute_resource_id,
            hostgroup_id: host.hostgroup_id,
            url: "/new/hosts/#{host.name}",
          },
        }
      end
    end
  end
end
