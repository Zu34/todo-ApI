
## Core Functionality (CRUD)

| Function | Method | Endpoint     | Description                    |
| -------- | ------ | ------------ | ------------------------------ |
| Create   | POST   | `/tasks`     | Add new task                   |
| Read     | GET    | `/tasks`     | Get all tasks (maybe filtered) |
| ReadOne  | GET    | `/tasks/:id` | Get task details               |
| Update   | PUT    | `/tasks/:id` | Edit a task                    |
| Delete   | DELETE | `/tasks/:id` | Remove a task                  |

## User Features
| Feature                        | Purpose                                                     |
| ------------------------------ | ----------------------------------------------------------- |
| **OAuth Login**                | Allow sign in with Google/GitHub                            |
| **User Roles**                 | Add `admin`, `viewer`, `editor` roles for shared workspaces |
| **Two-Factor Auth (2FA)**      | Extra security for power users                              |
| **Dark Mode Toggle (setting)** | Save user UI preferences (if frontend added)                |
