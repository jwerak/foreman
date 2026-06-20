collection @config_reports

extends "api/v2/config_reports/main"

node(:applied) { |r| r.applied }
node(:restarted) { |r| r.restarted }
node(:failed) { |r| r.failed }
node(:failed_restarts) { |r| r.failed_restarts }
node(:skipped) { |r| r.skipped }
node(:pending) { |r| r.pending }
