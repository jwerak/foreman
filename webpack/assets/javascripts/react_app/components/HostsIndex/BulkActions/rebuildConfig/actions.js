import { APIActions } from '../../../../redux/API';
import { foremanUrl } from '../../../../common/helpers';

export const BULK_REBUILD_CONFIG_KEY = 'BULK_REBUILD_CONFIG_KEY';
export const bulkRebuildConfig = (params, handleSuccess, handleError) => {
  const url = foremanUrl('/api/v2/hosts/bulk/build');
  return APIActions.put({
    key: BULK_REBUILD_CONFIG_KEY,
    url,
    successToast: response => response.data.message,
    handleSuccess,
    handleError,
    params,
  });
};

export default bulkRebuildConfig;
