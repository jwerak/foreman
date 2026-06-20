import { useState, useEffect, useCallback } from 'react';
import API from '../../../redux/API/API';

const useIndexData = ({
  apiUrl,
  defaultPerPage = 20,
  initialSearch = '',
  initialSort = '',
}) => {
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(defaultPerPage);
  const [sortBy, setSortBy] = useState(initialSort);
  const [search, setSearch] = useState(initialSearch);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canCreate, setCanCreate] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        page,
        per_page: perPage,
        include_permissions: true,
      };
      if (search) params.search = search;
      if (sortBy) params.order = sortBy;

      const { data } = await API.get(apiUrl, {}, params);
      setResults(data.results || []);
      setTotal(data.total || 0);
      setSubtotal(data.subtotal || data.total || 0);
      setCanCreate(data.can_create || false);
    } catch (err) {
      const errorData = err?.response?.data?.error;
      setError(
        errorData?.full_messages?.join(', ') ||
          errorData?.message ||
          err.message
      );
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, page, perPage, search, sortBy]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onPagination = ({ page: newPage, per_page: newPerPage }) => {
    if (newPerPage !== undefined && newPerPage !== perPage) {
      setPerPage(newPerPage);
      setPage(1);
    } else if (newPage !== undefined) {
      setPage(newPage);
    }
  };

  const onSort = (columnKey, direction) => {
    setSortBy(`${columnKey} ${direction}`);
  };

  const onSearch = newSearch => {
    setSearch(newSearch);
    setPage(1);
  };

  return {
    results,
    total,
    subtotal,
    page,
    perPage,
    isLoading,
    error,
    canCreate,
    sortBy,
    search,
    onPagination,
    onSort,
    onSearch,
    fetchData,
  };
};

export default useIndexData;
