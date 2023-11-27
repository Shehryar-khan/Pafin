# Project Name

**PAFIN-ASSIGNMENT**

## Description

CRUD operations for the user resource.

## Stack Used
```bash
NestJs Framework : For API Development  
PostgreSql       : For Data Storage  
Swagger          : For API Documentation
```

### Prerequisites
```bash
node
npm
docker
```

### Installation

```bash
git clone https://github.com/Shehryar-khan/Pafin.git
cd into the directory where you have cloned this project
npm install
```

### How To Run
Once the project is cloned and npm install command run.
```bash
docker compose up --build
```
Project will start running on your machine. NodeJs Server and Postgres will spin up.

### API Documentations
Run this command on local machine to see API Documentation
```bash
localhost:3000/api
```

### API Routes
Create User
```bash
POST -> localhost:3000/user/register
```
Get User / Login User
```bash
POST -> localhost:3000/user/login
```
Update User 
```bash
PUT -> localhost:3000/user/update
```
Delete User 
```bash
DELETE -> localhost:3000/user/delete/:id
```
Update User and Delete User routes has to be authenticated with JWT

### Run Unit Test
To run unit tests locally run this command in the terminal
```bash
npm run test
```

**For questions or feedback, feel free to contact:**

- Shehryar Khan Tanoli (shehryar_tanoli@outlook.com)

