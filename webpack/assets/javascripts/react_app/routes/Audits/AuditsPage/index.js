import { combineReducers } from 'redux';
import withQueryReducer from '../../common/reducerHOC/withQueryReducer';
import withDataReducer from '../../common/reducerHOC/withDataReducer';

export const reducers = {
  auditsPage: combineReducers({
    data: withDataReducer('AUDITS_PAGE'),
    query: withQueryReducer('AUDITS_PAGE'),
  }),
};

export { default } from './AuditsPage';
