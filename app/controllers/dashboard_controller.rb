class DashboardController < ApplicationController
  include Foreman::Controller::AutoCompleteSearch

  skip_before_action :welcome

  def index
    origin = params[:origin]
    settings = origin.present? ? { origin: origin } : {}
    @data = Dashboard::Data.new(params[:search], settings)
    @dashboard_props = build_dashboard_props(@data, origin)

    respond_to do |format|
      format.html
      format.yaml { render :plain => @data.report.to_yaml }
      format.json { render :json => @dashboard_props }
    end
  end

  private

  def build_dashboard_props(data, origin)
    h = helpers
    {
      status: data.report,
      overview: h.get_overview(data.report, origin: origin),
      runDistribution: h.get_run_distribution_data(data.hosts, origin: origin),
      latestEvents: serialize_latest_events(data),
      newHosts: serialize_new_hosts(data),
      hostsInBuildMode: serialize_build_hosts(data),
      reportOrigins: available_report_origins,
      searchUrl: h.current_hosts_path(search: '~VAL~'),
    }
  end

  def serialize_latest_events(data)
    h = helpers
    data.latest_events.map do |report|
      {
        id: report.id,
        hostName: report.host.try(:name) || 'N/A',
        reportsUrl: report.host ? host_config_reports_path(report.host) : '#',
        applied: report.applied,
        restarted: report.restarted,
        failed: report.failed,
        failedRestarts: report.failed_restarts,
        skipped: report.skipped,
        pending: report.pending,
      }
    end
  end

  def serialize_new_hosts(data)
    h = helpers
    data.hosts.includes(:operatingsystem).preload(:owner).order(created_at: :desc).limit(9).map do |host|
      {
        id: host.id,
        name: host.name,
        hostUrl: h.current_host_details_path(host),
        operatingSystem: host.operatingsystem.present? ? host.operatingsystem.to_label : nil,
        owner: host.owner.try(:to_s),
        createdAt: host.created_at&.iso8601,
        installedAt: host.installed_at&.iso8601,
      }
    end
  end

  def serialize_build_hosts(data)
    h = helpers
    hosts = data.hosts.in_build_mode.or(data.hosts.with_build_errors)
               .includes(:token).preload(:owner)
               .order(created_at: :desc).limit(9)
    hosts.map do |host|
      {
        id: host.id,
        name: host.name,
        hostUrl: h.current_host_details_path(host),
        owner: host.owner.try(:to_s),
        buildDuration: h.build_duration(host),
        tokenExpiry: host.token&.expires&.iso8601,
        buildStatus: host_build_status(host),
      }
    end
  end

  def host_build_status(host)
    if host.token_expired?
      'token_expired'
    elsif host.build_errors.present?
      'build_error'
    else
      'in_progress'
    end
  end

  def available_report_origins
    origins = Foreman::Plugin.report_origin_registry.all_origins || []
    ['All'] + origins.sort
  end
end
