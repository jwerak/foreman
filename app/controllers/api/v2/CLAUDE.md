# API v2 Controllers

REST API v2 controllers — 61 controllers serving JSON via RABL templates.

## Base Class
All controllers inherit from `Api::V2::BaseController` which provides:
- Pagination: `page`, `per_page` (or 'all'), `order` params
- Search: `search` param with scoped_search integration
- Taxonomy scoping: automatic org/location filtering
- Response metadata: `total`, `subtotal`, `page`, `per_page`, `search`, `order`

## Response Templates
RABL templates in `app/views/api/v2/` (321 files). Standard structure:
- `index.json.rabl` — Collection with pagination metadata
- `show.json.rabl` — Single resource
- `main.json.rabl` — Shared attribute definitions

## Key Controllers
- `hosts_controller.rb` — 28+ endpoints (the largest controller)
- `hosts_bulk_actions_controller.rb` — Bulk operations (build, power, reassign, etc.)
- `registration_controller.rb` — Host registration with template generation
- `topology_controller.rb` — Infrastructure/configuration topology data

## Adding a New API Endpoint
1. Create controller inheriting from `Api::V2::BaseController`
2. Add route in `config/routes/api/v2.rb`
3. Create RABL templates in `app/views/api/v2/{resource}/`
4. Add apipie documentation annotations to controller actions

## Conventions
- All responses are JSON (default format in routes)
- Use `process_response` for standard create/update flows
- Use `param` blocks with apipie for parameter documentation
- Authentication: Basic auth, OAuth, or session (handled by base controller)
