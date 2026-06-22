module Foreman
  module Controller
    module TaxonomyFormFields
      extend ActiveSupport::Concern

      private

      def append_taxonomy_form_fields
        default_tab = _(controller_name.singularize.humanize)
        @form_fields.each { |f| f[:tab] ||= default_tab }

        if helpers.show_location_tab?
          location_options = Location.authorized(:view_locations).order(:title).map { |l| { value: l.id, label: l.title } }
          @form_fields += [
            { name: 'location_ids', label: _('Locations'), type: 'checkboxGroup', tab: _('Locations'),
              options: location_options, loadKey: 'locations' },
          ]
        end
        if helpers.show_organization_tab?
          org_options = Organization.authorized(:view_organizations).order(:title).map { |o| { value: o.id, label: o.title } }
          @form_fields += [
            { name: 'organization_ids', label: _('Organizations'), type: 'checkboxGroup', tab: _('Organizations'),
              options: org_options, loadKey: 'organizations' },
          ]
        end
      end
    end
  end
end
