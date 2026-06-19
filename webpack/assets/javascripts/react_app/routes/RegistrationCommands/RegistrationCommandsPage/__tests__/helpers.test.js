import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FormSelectOption } from '@patternfly/react-core';

import {
  emptyOption,
  validatedOS,
  osHelperText,
} from '../RegistrationCommandsPageHelpers';

describe('emptyOption', () => {
  it('when length == 0', () => {
    expect(emptyOption(0)).toEqual(
      <FormSelectOption label="Nothing to select." value="" />
    );
  });

  it('when length > 0', () => {
    expect(emptyOption(23)).toEqual(<FormSelectOption label="" value="" />);
  });
});

describe('validatedOS', () => {
  it('no OS id', () => {
    expect(validatedOS('', {})).toEqual('default');
  });

  it('with template', () => {
    expect(validatedOS(1, { name: 'test' })).toEqual('success');
  });

  it('without template', () => {
    expect(validatedOS(1, { name: '' })).toEqual('error');
  });
});

describe('osHelperText', () => {
  it('OS with template', () => {
    const { container } = render(
      <>{osHelperText(1, [], null, [], { name: 'test' })}</>
    );
    expect(container.textContent).toMatch(
      /Initial configuration template: test/
    );
  });

  it('OS without template', () => {
    const { container } = render(
      <>{osHelperText(1, [], null, [], {})}</>
    );
    expect(container.textContent).toMatch(
      /does not have assigned host_init_config template/
    );
  });

  it('for host group with OS with template', () => {
    const { container } = render(
      <>
        {osHelperText(
          null,
          [{ id: 23 }],
          1,
          [{ id: 1, inherited_operatingsystem_id: 23 }],
          { name: 'test' }
        )}
      </>
    );

    expect(container.textContent).toMatch(/Host group OS/);
    expect(container.textContent).toMatch(/Initial configuration template/);
  });

  it('for host group with OS without template', () => {
    const { container } = render(
      <>
        {osHelperText(
          null,
          [{ id: 23 }],
          1,
          [{ id: 1, inherited_operatingsystem_id: 23 }],
          {}
        )}
      </>
    );

    expect(container.textContent).toMatch(/Host group OS/);
    expect(container.textContent).toMatch(
      /does not have assigned host_init_config template/
    );
  });

  it('for host group without OS', () => {
    const { container } = render(
      <>
        {osHelperText(
          null,
          [],
          1,
          [{ id: 1, inherited_operatingsystem_id: 23 }],
          {}
        )}
      </>
    );
    expect(container.textContent).toMatch(/No OS from host group/);
  });

  it('no OS or host group', () => {
    expect(osHelperText()).toEqual('');
  });
});
