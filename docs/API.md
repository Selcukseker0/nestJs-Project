# API

## Auth
- `POST /auth/login` - body: `{ "email": "...", "password": "..." }` -> `{ access_token: "..." }`

## Users
- `POST /users` - create user (body: CreateUserDto)
- `GET /users` - list users
- `DELETE /users/:id` - delete user (requires Bearer token)

## Tasks (Bearer token required)
- `POST /tasks` - create (CreateTaskDto)
- `GET /tasks` - list user's tasks
- `GET /tasks/:id` - get task
- `PATCH /tasks/:id` - update
- `DELETE /tasks/:id` - delete

Swagger UI is available at `/api` when the server is running.
