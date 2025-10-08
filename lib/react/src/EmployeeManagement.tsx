import { useEffect, useRef } from "react";
import {
  EmployeeManagement as EmployeeManagementCore,
  type EmployeeManagementProps as EmployeeManagementCoreProps,
} from "@senramii/employee-management-core";

export interface EmployeeManagementProps extends EmployeeManagementCoreProps {}

export function EmployeeManagement(props: EmployeeManagementProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const myElement = new EmployeeManagementCore(props);
    myElement.mount(containerRef.current!);

    return () => {
      myElement.destroy();
    };
  }, []);

  return <div ref={containerRef}></div>;
}

