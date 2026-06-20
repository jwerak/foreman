import reducer from './TemplateGeneratorReducer';
import * as templateActions from './TemplateGeneratorActions';

export const actions = templateActions;
export const reducers = { templates: reducer };
export { default } from './TemplateGenerator';
