import {
  EmployeeManagement,
  type EmployeeManagementProps,
} from "@senramii/employee-management-react";

import "@senramii/employee-management-core/style/base";
import "@senramii/employee-management-core/style/components";

const props: EmployeeManagementProps = {
  debounceDelay: 500,
};

function App() {
  return (
    <div id="react-app-root">
      <EmployeeManagement {...props} />
    </div>
  );
}

export default App;

