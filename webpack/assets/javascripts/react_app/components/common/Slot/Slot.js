import { cloneElement, isValidElement, useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { selectFillsComponents } from './SlotSelectors';

const Slot = ({
  id,
  multi,
  fillID,
  children = null,
  deprecated,
  replacedBy,
  versionDeadline, // version deadline for depracation
  ...props
}) => {
  const fills = useSelector(state =>
    selectFillsComponents(state, { id, multiple: multi, fillID })
  );
  const [warned, setWarned] = useState(false);
  const addProps = object => {
    if (deprecated && fills?.length && !warned) {
      // eslint-disable-next-line no-console
      console.warn(
        `Slot with id '${id}' is deprecated and will be removed in version ${versionDeadline}. Please use '${replacedBy}' instead.`
      );
      setWarned(true);
    }
    if (multi && !object.key) {
      // eslint-disable-next-line no-console
      console.warn(
        `Please add a key attribute to multiple fills [component - ${object.type.name}]`
      );
    }

    if (isValidElement(object)) {
      return cloneElement(object, { ...props });
    }

    if (!children) {
      throw new Error('Slot with override props must have a child');
    }

    return cloneElement(children, { ...props, ...object });
  };

  if (fills.length) return fills.map(component => addProps(component));
  return children;
};

Slot.propTypes = {
  id: PropTypes.string.isRequired,
  multi: PropTypes.bool,
  fillID: PropTypes.string,
  children: PropTypes.node,
  deprecated: PropTypes.bool,
  replacedBy: PropTypes.string,
  versionDeadline: PropTypes.string,
};

Slot.defaultProps = {
  multi: false,
  fillID: undefined,
  children: undefined,
  deprecated: false,
  replacedBy: '',
  versionDeadline: undefined,
};

export default Slot;
