import React from 'react';
import {
  TextInput,
  Button,
  Content,
} from '@patternfly/react-core';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { TrashIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { translate as __ } from '../../../common/I18n';
import { useHostFormContext } from '../HostFormContext';

const ParametersTab = () => {
  const { values, onChange } = useHostFormContext();

  // Host parameters are stored as an array of {name, value} objects
  const hostParams = values.host_parameters_attributes || [];

  const updateParams = newParams => {
    onChange('host_parameters_attributes', newParams);
  };

  const addParam = () => {
    updateParams([...hostParams, { name: '', value: '', _destroy: false }]);
  };

  const removeParam = index => {
    const param = hostParams[index];
    if (param.id) {
      // Existing param: mark for destruction
      const updated = [...hostParams];
      updated[index] = { ...param, _destroy: true };
      updateParams(updated);
    } else {
      // New param: just remove from array
      updateParams(hostParams.filter((_, i) => i !== index));
    }
  };

  const updateParam = (index, field, val) => {
    const updated = hostParams.map((p, i) =>
      i === index ? { ...p, [field]: val } : p
    );
    updateParams(updated);
  };

  return (
    <>
      <Content component="h2">{__('Host Parameters')}</Content>

      {hostParams.some(p => !p._destroy) ? (
        <Table aria-label={__('Host parameters')} variant="compact">
          <Thead>
            <Tr>
              <Th>{__('Name')}</Th>
              <Th>{__('Value')}</Th>
              <Th width={10}>{__('Actions')}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {hostParams.map((param, index) => {
              if (param._destroy) return null;
              return (
                <Tr key={param.id || `new-${index}`}>
                  <Td>
                    <TextInput
                      id={`host-param-name-${index}`}
                      value={param.name || ''}
                      onChange={(_event, val) =>
                        updateParam(index, 'name', val)
                      }
                      placeholder={__('Name')}
                      aria-label={__('Parameter name')}
                    />
                  </Td>
                  <Td>
                    <TextInput
                      id={`host-param-value-${index}`}
                      value={param.value || ''}
                      onChange={(_event, val) =>
                        updateParam(index, 'value', val)
                      }
                      placeholder={__('Value')}
                      aria-label={__('Parameter value')}
                    />
                  </Td>
                  <Td>
                    <Button
                      variant="plain"
                      onClick={() => removeParam(index)}
                      aria-label={__('Remove parameter')}
                    >
                      <TrashIcon />
                    </Button>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      ) : (
        <Content component="p">{__('No host parameters defined.')}</Content>
      )}

      <Button variant="link" icon={<PlusCircleIcon />} onClick={addParam}>
        {__('Add parameter')}
      </Button>
    </>
  );
};

export default ParametersTab;
