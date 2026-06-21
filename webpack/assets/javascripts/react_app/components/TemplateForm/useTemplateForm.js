import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import API from '../../redux/API/API';
import { selectValue as selectEditorValue } from '../Editor/EditorSelectors';

const useTemplateForm = ({ template, options, meta }) => {
  const isEdit = !meta.isNew;
  const editorValue = useSelector(selectEditorValue);

  const [values, setValues] = useState(() => {
    const initial =
      template && typeof template === 'object' ? { ...template } : {};
    if (!initial.template_inputs_attributes) {
      initial.template_inputs_attributes = [];
    }
    if (!initial.location_ids) {
      initial.location_ids = [];
    }
    if (!initial.organization_ids) {
      initial.organization_ids = [];
    }
    return initial;
  });

  const [errors, setErrors] = useState({});
  const [submitErrors, setSubmitErrors] = useState(null);
  const [isLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      const payload = {
        [meta.resourceName]: {
          ...values,
          template: editorValue || values.template || '',
          template_inputs_attributes: (
            values.template_inputs_attributes || []
          ).map((input, idx) => ({
            ...input,
            position: idx,
          })),
        },
      };

      delete payload[meta.resourceName].template_inputs_attributes_original;

      try {
        if (isEdit) {
          await API.put(`${meta.apiUrl}/${values.id}`, payload);
        } else {
          await API.post(meta.apiUrl, payload);
        }
        window.location.href = meta.cancelUrl;
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
    [isEdit, values, editorValue, meta, validate]
  );

  return {
    values,
    errors,
    submitErrors,
    isLoading,
    isSubmitting,
    options: options || {},
    onChange,
    onSubmit,
  };
};

export default useTemplateForm;
