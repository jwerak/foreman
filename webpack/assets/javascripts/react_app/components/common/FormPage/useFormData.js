import { useState, useEffect, useCallback } from 'react';
import API from '../../../redux/API/API';

const useFormData = ({ apiUrl, resourceId, fields, resourceName }) => {
  const isEdit = !!resourceId;
  const [values, setValues] = useState(() => {
    const initial = {};
    fields.forEach(field => {
      if (field.type === 'checkbox') {
        initial[field.name] = field.initialValue ?? false;
      } else if (field.type === 'checkboxGroup') {
        initial[field.name] = field.initialValue ?? [];
      } else {
        initial[field.name] = field.initialValue ?? '';
      }
    });
    return initial;
  });
  const [errors, setErrors] = useState({});
  const [submitErrors, setSubmitErrors] = useState(null);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit) return;

    const fetchRecord = async () => {
      setIsLoading(true);
      try {
        const { data } = await API.get(`${apiUrl}/${resourceId}`);
        const loaded = {};
        fields.forEach(field => {
          if (field.type === 'checkboxGroup') {
            const key = field.loadKey || field.name;
            const raw = data[key];
            if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === 'object') {
              loaded[field.name] = raw.map(item => item.id);
            } else {
              loaded[field.name] = Array.isArray(raw) ? raw : [];
            }
          } else if (field.type === 'checkbox') {
            loaded[field.name] = data[field.name] ?? false;
          } else {
            loaded[field.name] = data[field.name] ?? '';
          }
        });
        setValues(loaded);
      } catch (err) {
        const errorData = err?.response?.data?.error;
        setSubmitErrors(
          errorData?.full_messages || [errorData?.message || err.message]
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecord();
  }, [apiUrl, resourceId]); // eslint-disable-line react-hooks/exhaustive-deps

  const onChange = useCallback((fieldName, value) => {
    setValues(prev => ({ ...prev, [fieldName]: value }));
    setErrors(prev => {
      if (!prev[fieldName]) return prev;
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  }, []);

  const validate = useCallback(() => {
    const newErrors = {};
    fields.forEach(field => {
      if (!field.required) return;
      const val = values[field.name];
      if (field.type === 'checkboxGroup') {
        if (!Array.isArray(val) || val.length === 0) {
          newErrors[field.name] = "can't be blank";
        }
      } else if (!val && val !== 0) {
        newErrors[field.name] = "can't be blank";
      }
    });
    return newErrors;
  }, [fields, values]);

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

      const payloadKey =
        resourceName || apiUrl.split('/').pop().replace(/s$/, '');
      const payload = { [payloadKey]: values };

      try {
        if (isEdit) {
          await API.put(`${apiUrl}/${resourceId}`, payload);
        } else {
          await API.post(apiUrl, payload);
        }
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
    [apiUrl, resourceId, resourceName, isEdit, values, validate]
  );

  return {
    values,
    errors,
    submitErrors,
    isLoading,
    isSubmitting,
    isEdit,
    onChange,
    onSubmit,
    setValues,
    setErrors,
  };
};

export default useFormData;
