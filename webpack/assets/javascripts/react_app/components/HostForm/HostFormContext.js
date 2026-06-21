import { createContext, useContext } from 'react';

const HostFormContext = createContext(null);
export const useHostFormContext = () => useContext(HostFormContext);
export default HostFormContext;
