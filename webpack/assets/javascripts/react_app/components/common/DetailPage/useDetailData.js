import { useState, useEffect } from 'react';
import API from '../../../redux/API/API';

const useDetailData = ({ apiUrl, resourceId, fieldsUrl }) => {
  const [resource, setResource] = useState(null);
  const [fields, setFields] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [resourceRes, fieldsRes] = await Promise.all([
          API.get(`${apiUrl}/${resourceId}`),
          API.get(fieldsUrl),
        ]);

        if (!cancelled) {
          setResource(resourceRes.data);
          setFields(fieldsRes.data.fields || []);
        }
      } catch (err) {
        if (!cancelled) {
          const errorData = err?.response?.data?.error;
          setError(
            errorData?.message || err.message || 'Failed to load resource'
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [apiUrl, resourceId, fieldsUrl]);

  return { resource, fields, isLoading, error };
};

export default useDetailData;
