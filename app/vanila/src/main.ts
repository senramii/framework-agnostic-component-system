import { EmployeeManagement } from "@senramii/employee-management-core";

import "@senramii/employee-management-core/style/base";
import "@senramii/employee-management-core/style/components";

const app = document.querySelector<HTMLDivElement>('#app')!

const instance = new EmployeeManagement();

instance.mount(app);
