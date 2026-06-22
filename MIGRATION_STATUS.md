# Foreman ERB → React Migration Status

> Last updated: 2026-06-22

## Summary

| Category | Migrated | Total | % |
|----------|----------|-------|---|
| SPA Index Pages | 22 | ~35 | 63% |
| SPA Detail Pages | 21 | ~30 | 70% |
| SPA Form Pages | 22 | ~40 | 55% |
| Overall Page Migration | ~65 | ~105 | 62% |

## Legend

- **SPA** — Fully React SPA page (React Router, no ERB)
- **React** — ERB page that mounts React component(s), not yet SPA-routed
- **ERB** — Pure ERB template with Bootstrap/PF3/jQuery
- **N/A** — Not a user-facing page (mailers, API, unattended, etc.)

---

## Index Pages

| Resource | Status | SPA Route | Component |
|----------|--------|-----------|-----------|
| Architectures | SPA | `/architectures` | `ArchitecturesIndex` |
| Bookmarks | SPA | `/bookmarks` | `BookmarksIndex` |
| Compute Profiles | SPA | `/compute_profiles` | `ComputeProfilesIndex` |
| Compute Resources | SPA | `/compute_resources` | `ComputeResourcesIndex` |
| Config Reports | SPA | `/config_reports` | `ConfigReportsIndex` |
| Domains | SPA | `/domains` | `DomainsIndex` |
| Fact Values | SPA | `/fact_values` | `FactValuesIndex` |
| Host Groups | SPA | `/hostgroups` | `HostgroupsIndex` |
| HTTP Proxies | SPA | `/http_proxies` | `HttpProxiesIndex` |
| Installation Media | SPA | `/media` | `MediaIndex` |
| Locations | SPA | `/locations` | `TaxonomiesIndex` |
| Operating Systems | SPA | `/operatingsystems` | `OperatingsystemsIndex` |
| Organizations | SPA | `/organizations` | `TaxonomiesIndex` |
| Partition Tables | SPA | `/templates/ptables` | `PtablesIndex` |
| Provisioning Templates | SPA | `/templates/provisioning_templates` | `ProvisioningTemplatesIndex` |
| Realms | SPA | `/realms` | `RealmsIndex` |
| Report Templates | SPA | `/templates/report_templates` | `ReportTemplatesIndex` |
| Roles | SPA | `/roles` | `RolesIndex` |
| Smart Proxies | SPA | `/smart_proxies` | `SmartProxiesIndex` |
| Subnets | SPA | `/subnets` | `SubnetsIndex` |
| User Groups | SPA | `/usergroups` | `UserGroupsIndex` |
| Users | SPA | `/users` | `UsersIndex` |
| Hosts | SPA | `/new/hosts` | `HostsIndex` |
| Dashboard | SPA | `/` | `Dashboard` |
| Audits | React | — | `AuditsList` |
| Settings | React | — | `SettingsTable` |
| Filters | ERB | — | — |
| Images | ERB | — | — |
| Key Pairs | React | — | `KeyPairsIndex` |
| Models | ERB | — | — |
| Auth Sources | ERB | — | — |
| Autosign | ERB | — | — |
| Puppetca | ERB | — | — |
| Lookup Keys | ERB | — | — |

## Detail Pages

| Resource | Status | Has Detail Page | Has Custom Tabs | Has Form |
|----------|--------|-----------------|-----------------|----------|
| Architectures | SPA | Yes | — | fieldsUrl |
| Bookmarks | SPA | Yes | — | fieldsUrl |
| Compute Profiles | SPA | Yes | — | fieldsUrl |
| Compute Resources | SPA | Yes | — | fieldsUrl |
| Common Parameters | SPA | Yes | — | fieldsUrl |
| Domains | SPA | Yes | — | fieldsUrl |
| Host Groups | SPA | Yes | — | fieldsUrl |
| HTTP Proxies | SPA | Yes | — | fieldsUrl |
| Installation Media | SPA | Yes | — | fieldsUrl |
| Locations | SPA | Yes | — | fieldsUrl |
| Operating Systems | SPA | Yes | — | fieldsUrl |
| Organizations | SPA | Yes | — | fieldsUrl |
| Provisioning Templates | SPA | Yes | — | formComponent: TemplateForm |
| Partition Tables | SPA | Yes | — | formComponent: TemplateForm |
| Realms | SPA | Yes | — | fieldsUrl |
| Report Templates | SPA | Yes | — | formComponent: TemplateForm |
| Roles | SPA | Yes | Filters tab | fieldsUrl |
| Smart Proxies | SPA | Yes | — | fieldsUrl |
| Subnets | SPA | Yes | — | fieldsUrl |
| User Groups | SPA | Yes | External Groups tab | fieldsUrl |
| Users | SPA | Yes | SSH Keys, PAT, JWT tabs | fieldsUrl |
| Hosts | React | Partial (HostDetails) | Many | Custom |
| Config Reports | ERB | ERB show page | — | — |
| Compute Resources VMs | ERB | 30 ERB files | — | — |
| Smart Proxy Features | ERB | ERB detail tabs | — | — |

## ERB View Directories — Migration Candidates

| Directory | ERB Files | React Files | Priority | Complexity | Notes |
|-----------|-----------|-------------|----------|------------|-------|
| `hosts/` | 54 | 6 | High | High | Largest view dir; host detail partially React |
| `compute_resources_vms/` | 30 | 1 | Low | High | VM management; provider-specific |
| `smart_proxies/` | 19 | 4 | Medium | Medium | Proxy detail tabs |
| `common/` | 19 | 2 | Medium | Low | Shared partials |
| `unattended/` | 176 | 0 | N/A | — | Provisioning templates, not UI pages |
| `compute_resources/` | 14 | 4 | Medium | Medium | Index/detail done, VM pages remain |
| `nic/` | 11 | 0 | Medium | Medium | Network interface forms |
| `users/` | 11 | 4 | Low | Low | Index/detail SPA done |
| `taxonomies/` | 10 | 4 | Low | Low | Index/detail SPA done |
| `dashboard/` | 10 | 3 | Low | Low | SPA done |
| `provisioning_templates/` | 10 | 4 | Low | Low | Index/detail SPA done |
| `report_templates/` | 10 | 5 | Low | Low | Index/detail SPA done |
| `images/` | 9 | 2 | Low | Low | Compute resource images |
| `common_parameters/` | 9 | 3 | Low | Low | Detail SPA done |
| `operatingsystems/` | 8 | 4 | Low | Low | Index/detail SPA done |
| `subnets/` | 7 | 4 | Low | Low | Index/detail SPA done |
| `compute_profiles/` | 6 | 4 | Low | Low | Index/detail SPA done |
| `config_reports/` | 6 | 4 | Medium | Low | Index SPA, detail ERB |
| `ptables/` | 6 | 4 | Low | Low | Index/detail SPA done |
| `usergroups/` | 6 | 4 | Low | Low | Index/detail SPA done |
| `auth_source_ldaps/` | 5 | 2 | Medium | Medium | LDAP config forms |
| `architectures/` | 5 | 4 | Low | Low | Fully migrated |
| `bookmarks/` | 4 | 3 | Low | Low | Fully migrated |
| `domains/` | 5 | 4 | Low | Low | Fully migrated |
| `hostgroups/` | 5 | 4 | Low | Low | Fully migrated |
| `http_proxies/` | 5 | 4 | Low | Low | Fully migrated |
| `media/` | 5 | 3 | Low | Low | Fully migrated |
| `realms/` | 5 | 4 | Low | Low | Fully migrated |
| `roles/` | 4 | 3 | Low | Low | Fully migrated |
| `ssh_keys/` | 4 | 1 | Low | Low | Tab in Users detail |
| `lookup_keys/` | 4 | 0 | Medium | Medium | Smart class parameters |
| `compute_attributes/` | 4 | 0 | Low | Medium | Compute profile attributes |
| `auth_source_externals/` | 3 | 1 | Low | Low | External auth |
| `auth_sources/` | 3 | 1 | Low | Low | Auth source listing |
| `autosign/` | 3 | 0 | Low | Low | Puppet autosign |
| `fact_values/` | 3 | 2 | Low | Low | SPA done |
| `puppetca/` | 3 | 0 | Low | Low | Puppet CA management |
| `templates/` | 3 | 1 | Low | Low | Template shared views |
| `settings/` | 2 | 1 | Medium | Low | Settings page |
| `template_inputs/` | 2 | 0 | Low | Low | Template input forms |
| `tasks/` | 2 | 0 | Low | Low | Background tasks |
| `filters/` | 1 | 0 | Low | Low | Permission filters |
| `models/` | 1 | 0 | Low | Low | Hardware models |
| `about/` | 1 | 1 | Low | Low | About page |

## Non-UI Directories (N/A for migration)

| Directory | Files | Purpose |
|-----------|-------|---------|
| `unattended/` | 176 | Provisioning templates (kickstart, preseed, etc.) |
| `api/` | 321+ | REST API v2 RABL templates |
| `layouts/` | — | Application layouts |
| `host_mailer/` | 10 | Email templates |
| `audit_mailer/` | 2 | Audit email templates |
| `report_mailer/` | 2 | Report email templates |
| `user_mailer/` | 3 | User email templates |
| `apipie/` | — | API documentation layout |

---

## Next Migration Priorities

### Tier 1 — High Impact
1. **Hosts detail pages** (54 ERB files) — Partially done, needs remaining tabs
2. **Settings page** — Convert to SPA, simple table
3. **Audits** — Already React, needs SPA route registration

### Tier 2 — Medium Impact
4. **Config Reports detail** — Index is SPA, detail is ERB
5. **Smart Proxy detail tabs** — Feature-specific sub-pages
6. **Auth Source LDAP forms** — Configuration forms
7. **Lookup Keys** — Smart class parameter management
8. **NIC forms** — Network interface editing

### Tier 3 — Low Impact / Complex
9. **Compute Resources VMs** — 30 files, provider-specific
10. **Images** — Compute resource images
11. **Filters** — Permission filter editing
12. **Autosign / Puppetca** — Puppet-specific, may be deprecated
