const inquirer = require('inquirer');
const mysql = require('mysql2/promise');

const connection = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: 'Naruto237!',
  database: 'employee_db'
});


async function startApp() {
  try {
    console.log('Connected to the database.');

    while (true) {
      const { action } = await inquirer.prompt({
        name: 'action',
        type: 'list',
        message: 'What would you like to do?',
        choices: [
          'View all departments',
          'View all roles',
          'View all employees',
          'Add a department',
          'Add a role',
          'Add an employee',
          'Update an employee role',
          'Exit'
        ]
      });

      switch (action) {
        case 'View all departments':
          await viewAllDepartments();
          break;

        case 'View all roles':
          await viewAllRoles();
          break;

        case 'View all employees':
          await viewAllEmployees();
          break;

        case 'Add a department':
          await addDepartment();
          break;

        case 'Add a role':
          await addRole();
          break;

        case 'Add an employee':
          await addEmployee();
          break;

        case 'Update an employee role':
          await updateEmployeeRole();
          break;

        case 'Exit':
          console.log('Connection closed. Goodbye!');
          await connection.end();
          process.exit();

        default:
          console.log('Invalid choice. Please try again.');
          break;
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

async function viewAllDepartments() {
  const [departments] = await connection.query('SELECT * FROM department');
  console.table(departments);
}

async function viewAllRoles() {
  try {
    const query = `
      SELECT role.id, role.title, role.salary, department.name AS department_name
      FROM role
      INNER JOIN department ON role.department_id = department.id
    `;
    const [roles] = await connection.query(query);
    console.table(roles);
  } catch (error) {
    console.error('Error viewing roles:', error.message);
  }
}


async function viewAllEmployees() {
  try {
    const query = `
      SELECT 
        employee.id, 
        employee.first_name, 
        employee.last_name, 
        role.title AS role_title, 
        role.salary, 
        department.name AS department_name, 
        CONCAT(manager.first_name, ' ', manager.last_name) AS manager_name
      FROM employee
      INNER JOIN role ON employee.role_id = role.id
      INNER JOIN department ON role.department_id = department.id
      LEFT JOIN employee AS manager ON employee.manager_id = manager.id
    `;
    const [employees] = await connection.query(query);
    console.table(employees);
  } catch (error) {
    console.error('Error viewing employees:', error.message);
  }
}


async function addDepartment() {
  const { name } = await inquirer.prompt({
    name: 'name',
    type: 'input',
    message: 'Enter the department name:'
  });

  await connection.execute('INSERT INTO department (name) VALUES (?)', [name]);
  console.log('Department added successfully.');
}

async function addRole() {
  try {
    const departments = await connection.query('SELECT * FROM department');
    
    const { title, salary, department_id } = await inquirer.prompt([
      {
        name: 'title',
        type: 'input',
        message: 'Enter the role title:'
      },
      {
        name: 'salary',
        type: 'number',
        message: 'Enter the role salary:'
      },
      {
        name: 'department_id',
        type: 'list',
        message: 'Select the department for the role:',
        choices: departments[0].map(department => ({ name: department.name, value: department.id }))
      }
    ]);

    await connection.execute('INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)', [title, salary, department_id]);
    console.log('Role added successfully.');
  } catch (error) {
    console.error('Error adding role:', error.message);
  }
}


async function addEmployee() {
  try {
    const [roles] = await connection.query('SELECT * FROM role');
    const [employees] = await connection.query('SELECT * FROM employee');

    const { first_name, last_name, role_id, manager_id } = await inquirer.prompt([
      {
        name: 'first_name',
        type: 'input',
        message: 'Enter the employee\'s first name:'
      },
      {
        name: 'last_name',
        type: 'input',
        message: 'Enter the employee\'s last name:'
      },
      {
        name: 'role_id',
        type: 'list',
        message: 'Select the employee\'s role:',
        choices: roles.map(role => ({ name: role.title, value: role.id }))
      },
      {
        name: 'manager_id',
        type: 'list',
        message: 'Select the employee\'s manager:',
        choices: employees.map(employee => ({ name: `${employee.first_name} ${employee.last_name}`, value: employee.id }))
      }
    ]);

    await connection.execute('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)', [first_name, last_name, role_id, manager_id]);
    console.log('Employee added successfully.');
  } catch (error) {
    console.error('Error adding employee:', error.message);
  }
}




async function updateEmployeeRole() {
  try {
    const [employees] = await connection.query('SELECT * FROM employee');
    const [roles] = await connection.query('SELECT * FROM role');

    const { employee_id, new_role_id } = await inquirer.prompt([
      {
        name: 'employee_id',
        type: 'list',
        message: 'Select the employee to update:',
        choices: employees.map(employee => ({ name: `${employee.first_name} ${employee.last_name}`, value: employee.id }))
      },
      {
        name: 'new_role_id',
        type: 'list',
        message: 'Select the new role for the employee:',
        choices: roles.map(role => ({ name: role.title, value: role.id }))
      }
    ]);

    await connection.execute('UPDATE employee SET role_id = ? WHERE id = ?', [new_role_id, employee_id]);
    console.log('Employee role updated successfully.');
  } catch (error) {
    console.error('Error updating employee role:', error.message);
  }
}

startApp();
