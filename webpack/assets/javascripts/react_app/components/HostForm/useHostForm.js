import { useState, useCallback } from 'react';
import API from '../../redux/API/API';
import { HOSTS_API_URL } from './constants';

const useHostForm = ({ host, options, meta }) => {
  const isEdit = !meta.isNew;

  const [values, setValues] = useState(() => {
    const initial =
      host && typeof host === 'object' ? { ...host } : {};
    if (!initial.host_parameters_attributes) {
      initial.host_parameters_attributes = [];
    }
    if (!initial.interfaces_attributes && meta.isNew) {
      initial.interfaces_attributes = [
        {
          primary: true,
          provision: true,
          managed: true,
          type: 'Nic::Managed',
          _destroy: false,
        },
      ];
    }
    return initial;
  });

  const [errors, setErrors] = useState({});
  const [submitErrors, setSubmitErrors] = useState(null);
  const [isLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userOverrides, setUserOverrides] = useState(new Set());
  const [dynamicOptions, setDynamicOptions] = useState({});

  const onChange = useCallback((fieldName, value) => {
    setValues(prev => ({ ...prev, [fieldName]: value }));
    setUserOverrides(prev => new Set(prev).add(fieldName));
    setErrors(prev => {
      if (!prev[fieldName]) return prev;
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  }, []);

  const applyHostgroupDefaults = useCallback(
    async hostgroupId => {
      if (!hostgroupId) return;
      try {
        const { data } = await API.get(
          `/api/v2/hostgroups/${hostgroupId}`
        );
        const inheritableFields = {
          compute_resource_id: data.compute_resource_id,
          compute_profile_id: data.compute_profile_id,
          domain_id: data.domain_id,
          subnet_id: data.subnet_id,
          subnet6_id: data.subnet6_id,
          realm_id: data.realm_id,
          architecture_id: data.architecture_id,
          operatingsystem_id: data.operatingsystem_id,
          medium_id: data.medium_id,
          ptable_id: data.ptable_id,
          pxe_loader: data.pxe_loader,
        };
        setValues(prev => {
          const next = { ...prev };
          Object.entries(inheritableFields).forEach(([key, val]) => {
            if (!userOverrides.has(key) && val !== undefined) {
              next[key] = val;
            }
          });
          return next;
        });
      } catch (err) {
        // silently fail - hostgroup defaults are optional
      }
    },
    [userOverrides]
  );

  const refreshTaxonomyOptions = useCallback(async (orgId, locId) => {
    try {
      const params = {};
      if (orgId) params.organization_id = orgId;
      if (locId) params.location_id = locId;

      const [hgRes, crRes] = await Promise.all([
        API.get('/api/v2/hostgroups', {}, { per_page: 'all', ...params }),
        API.get(
          '/api/v2/compute_resources',
          {},
          { per_page: 'all', ...params }
        ),
      ]);

      setDynamicOptions(prev => ({
        ...prev,
        hostgroups: (hgRes.data.results || []).map(hg => ({
          value: hg.id,
          label: hg.title,
        })),
        computeResources: (crRes.data.results || []).map(cr => ({
          value: cr.id,
          label: cr.name,
        })),
      }));
    } catch (err) {
      // silently fail
    }
  }, []);

  const validate = useCallback(() => {
    const newErrors = {};
    if (!values.name) {
      newErrors.name = "can't be blank";
    }
    return newErrors;
  }, [values]);

  const onSubmit = useCallback(
    async e => {
      if (e?.preventDefault) e.preventDefault();

      const validationErrors = validate();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return { success: false };
      }

      setIsSubmitting(true);
      setSubmitErrors(null);
      setErrors({});

      const payload = { host: values };

      try {
        let response;
        if (isEdit) {
          response = await API.put(`${HOSTS_API_URL}/${values.id}`, payload);
        } else {
          response = await API.post(HOSTS_API_URL, payload);
        }
        const savedHost = response?.data;
        const hostName = savedHost?.name || values.name;
        window.location.href = `/new/hosts/${hostName}`;
        return { success: true };
      } catch (err) {
        const errorData = err?.response?.data?.error;
        if (errorData?.errors) {
          setErrors(
            Object.fromEntries(
              Object.entries(errorData.errors).map(([key, msgs]) => [
                key,
                Array.isArray(msgs) ? msgs[0] : msgs,
              ])
            )
          );
        }
        setSubmitErrors(
          errorData?.full_messages || [errorData?.message || err.message]
        );
        return { success: false };
      } finally {
        setIsSubmitting(false);
      }
    },
    [isEdit, values, validate]
  );

  return {
    values,
    errors,
    submitErrors,
    isLoading,
    isSubmitting,
    options: { ...(options || {}), ...dynamicOptions },
    onChange,
    onSubmit,
    applyHostgroupDefaults,
    refreshTaxonomyOptions,
  };
};

export default useHostForm;
