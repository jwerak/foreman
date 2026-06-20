import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Table, Thead, Th, Tbody, Tr, Td } from '@patternfly/react-table';
import GlobalStatusIcon from './GlobalStatusIcon';
import LinkOrLabel from './LinkOrLabel';
import { translate as __ } from '../../../common/I18n';

const Details = ({ data }) => {
  const columns = ['', __('Total'), __('Owned')];

  return (
    <Table
      ouiaId="host-statuses-table"
      aria-label="Host Statuses"
      variant="compact"
    >
      <Thead>
        <Tr>
          {columns.map((col, idx) => (
            <Th key={idx}>{col}</Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {data.map(
          ({
            label,
            total,
            owned,
            global_status: globalStatus,
            total_path: totalPath,
            owned_path: ownedPath,
          }) => (
            <Tr key={label}>
              <Td dataLabel={columns[0]}>
                <Fragment>
                  <GlobalStatusIcon status={globalStatus} /> {label}
                </Fragment>
              </Td>
              <Td dataLabel={columns[1]}>
                <LinkOrLabel path={totalPath} label={total.toString()} />
              </Td>
              <Td dataLabel={columns[2]}>
                <LinkOrLabel path={ownedPath} label={owned.toString()} />
              </Td>
            </Tr>
          )
        )}
      </Tbody>
    </Table>
  );
};

Details.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      total: PropTypes.number.isRequired,
      owned: PropTypes.number.isRequired,
      global_status: PropTypes.number,
      total_path: PropTypes.string,
      owned_path: PropTypes.string,
    })
  ),
};

Details.propTypes = {
  data: PropTypes.array,
};

Details.defaultProps = {
  data: [],
};

export default Details;
