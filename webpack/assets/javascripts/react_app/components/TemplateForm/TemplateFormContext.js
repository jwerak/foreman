import { createContext, useContext } from 'react';

const TemplateFormContext = createContext(null);
export const useTemplateFormContext = () => useContext(TemplateFormContext);
export default TemplateFormContext;
