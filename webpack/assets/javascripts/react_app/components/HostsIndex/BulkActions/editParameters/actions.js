import { APIActions } from '../../../../redux/API';
import { foremanUrl } from '../../../../common/helpers';

export const BULK_UPDATE_PARAMETERS_KEY = 'BULK_UPDATE_PARAMETERS_KEY';
export const bulkUpdateParameters = (params, handleSuccess, handleError) => {
  const url = foremanUrl('/api/v2/hosts/bulk/update_parameters');
  return APIActions.put({
    key: BULK_UPDATE_PARAMETERS_KEY,
    url,
    successToast: response => response.data.message,
    handleSuccess,
    handleError,
    params,
  });
};

export default bulkUpdateParameters;
