import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import {
  registerFillComponent,
  unregisterFillComponent,
} from './FillActions';

const Fill = ({
  children,
  overrideProps,
  slotId,
  weight,
  id,
}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(registerFillComponent(slotId, overrideProps, id, children, weight));

    return () => {
      dispatch(unregisterFillComponent(slotId, id));
    };
  }, []);

  return null;
};

Fill.propTypes = {
  // a component to be injected on a slot
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.object]),
  slotId: PropTypes.string.isRequired,
  // ordering between slot's fills, higher will be rendered first
  weight: PropTypes.number.isRequired,
  // fill's id
  id: PropTypes.string.isRequired,
  // a props object to be injected on the slot's children
  overrideProps: PropTypes.object,
};

Fill.defaultProps = {
  children: undefined,
  overrideProps: undefined,
};

export default Fill;
