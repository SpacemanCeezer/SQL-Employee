INSERT INTO department (id, name) VALUES
(10, 'Engineering'),
(20, 'Sales'),
(30, 'Marketing');

INSERT INTO role (id, title, salary, department_id) VALUES
(100, 'Software Engineer', 80000, 10),
(200, 'Sales Representative', 50000, 20),
(300, 'Marketing Coordinator', 45000, 30);

INSERT INTO employee (id, first_name, last_name, role_id, manager_id) VALUES
(1000, 'John', 'Doe', 100, NULL),
(2000, 'Jane', 'Smith', 200, 1000),
(3000, 'Bob', 'Johnson', 300, 1000);
