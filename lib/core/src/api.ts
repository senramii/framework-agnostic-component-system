import type { Employee } from "./types";

const url = 'https://cdn.jsdelivr.net/gh/senramii/framework-agnostic-component-system@main/data.json'

export async function employeeAPI({ query }: { query?: string } = {}): Promise<Employee[]> {
  const res = await fetch(url)
  const data: { employee: Employee }[] = await res.json()

  const employeeRecords = data.map((record) => ({ ...record.employee, email: `${record.employee.name.toLowerCase().replace(' ', '-')}@example.com`, }));

  if (!query) return employeeRecords;

  return employeeRecords.filter((employee) =>
    employee.name.toLowerCase().includes(query.toLowerCase()) ||
    employee.email.toLowerCase().includes(query.toLowerCase()) ||
    employee.id.toLowerCase().includes(query.toLowerCase()));
}