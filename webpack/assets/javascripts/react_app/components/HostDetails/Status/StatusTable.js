import PropTypes from 'prop-types';
import React from 'react';
import { useDispatch } from 'react-redux';
import {
  Table,
  Thead,
  Th,
  Tbody,
  Tr,
  Td,
  ActionsColumn,
} from '@patternfly/react-table';
import RelativeDateTime from '../../common/dates/RelativeDateTime';
import StatusIcon from './StatusIcon';
import { forgetStatus } from './StatusActions';
import { translate as __, sprintf } from '../../../common/I18n';
import './styles.scss';
import { openConfirmModal } from '../../ConfirmModal';

const StatusTable = ({ hostName, statuses, canForgetStatuses }) => {
  const dispatch = useDispatch();
  const handleClearStatus = (rawName, displayName) => {
    dispatch(
      openConfirmModal({
        title: __('Clear host status'),
        message: sprintf(
          __('You are about to clear the %s status. Are you sure?'),
          displayName
        ),
        isWarning: true,
        onConfirm: () => {
          const [chosenStatus] = statuses.filter(
            status => status.name === rawName
          );
          dispatch(forgetStatus(hostName, chosenStatus));
        },
      })
    );
  };
  const columns = [__('Name'), __('Status'), __('Reported at')];

  return (
    <Table
      style={{ height: 'auto' }}
      aria-label="statuses-table"
      ouiaId="statuses-table"
      variant="compact"
      borders={false}
    >
      <Thead>
        <Tr>
          {columns.map(col => (
            <Th key={col}>{col}</Th>
          ))}
          <Th />
        </Tr>
      </Thead>
      <Tbody>
        {statuses?.map(
          ({ name, label, link, global, reported_at: reportedAt }, rowIdx) => (
            <Tr key={name || rowIdx}>
              <Td dataLabel={columns[0]}>
                {link ? <a href={link}>{__(name)}</a> : __(name)}
              </Td>
              <Td dataLabel={columns[1]}>
                <StatusIcon statusNumber={global} label={label} />
              </Td>
              <Td dataLabel={columns[2]}>
                <RelativeDateTime
                  date={reportedAt}
                  defaultValue={
                    <span className="disabled">{__('N/A')}</span>
                  }
                />
              </Td>
              <Td isActionCell>
                <ActionsColumn
                  items={[
                    {
                      title: __('Clear'),
                      onClick: () => handleClearStatus(name, __(name)),
                      isDisabled: !canForgetStatuses,
                    },
                  ]}
                  isDisabled={!reportedAt}
                  popperProps={{ direction: 'up' }}
                />
              </Td>
            </Tr>
          )
        )}
      </Tbody>
    </Table>
  );
};

StatusTable.propTypes = {
  hostName: PropTypes.string.isRequired,
  statuses: PropTypes.arrayOf(PropTypes.object),
  canForgetStatuses: PropTypes.bool,
};

StatusTable.defaultProps = {
  statuses: [],
  canForgetStatuses: undefined,
};

export default StatusTable;
