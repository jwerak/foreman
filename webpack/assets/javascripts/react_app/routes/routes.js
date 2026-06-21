import Audits from './Audits';
import Models from './Models';
import HostDetails from './HostDetails';
import RegistrationCommands from './RegistrationCommands';
import HostStatuses from './HostStatuses';
import Hosts from './Hosts';
import EmptyPage from './common/EmptyPage/route';
import FiltersForm from './FiltersForm';
import Upgrade from './Upgrade';
import IndexPages from './IndexPages';
import DetailPages from './DetailPages';
import Dashboard from './Dashboard';

export const routes = [
  Dashboard,
  Audits,
  ...Models,
  Hosts,
  HostDetails,
  RegistrationCommands,
  HostStatuses,
  EmptyPage,
  ...FiltersForm,
  Upgrade,
  ...DetailPages,
  ...IndexPages,
];
