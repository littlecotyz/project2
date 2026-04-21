# Backend (Django REST Framework)

Quick start (local, uses SQLite by default):

```powershell
cd backend
python -m venv .venv
& .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Using Docker (Postgres):

```powershell
docker-compose up --build
```

API endpoints:
- `/api/token/` - obtain JWT
- `/api/token/refresh/` - refresh JWT
- `/api/tasks/` - CRUD tasks
- `/api/teams/` - teams
- `/api/comments/` - comments
- `/api/auth/register/` - create a new user (POST username/email/password)
- `/api/auth/google/` - create or login user via Google ID token

Google setup:
- Add your Google OAuth client id(s) to `backend/.env` as `GOOGLE_OAUTH_CLIENT_IDS=clientid1,clientid2`
- On the frontend use Google's Identity Services to obtain an `id_token` and POST it to `/api/auth/google/`.
 WebSocket (real-time comments):
 - The backend exposes a websocket at `ws://<host>/ws/tasks/<task_id>/`.
 - The client should connect using session authentication (or use the same-origin cookie) so the connection has an authenticated `user` in `scope`.
 - To post a comment send JSON: `{"action":"comment","content":"Hello"}`. The server will broadcast the new comment to the task group.

 WebSocket authentication options:
 - Query string: connect to `ws://localhost:8000/ws/tasks/<id>/?token=<ACCESS_TOKEN>` where `<ACCESS_TOKEN>` is a SimpleJWT access token. The server will validate the token and set the authenticated `user` on the connection.
 - (Optional) You can extend the middleware to read `Authorization` header if your client supports custom headers.

If you're using Docker Compose the `redis` service is added and Channels is configured to use it. Ensure `REDIS_URL` in `.env` matches `redis://redis:6379/0` if customized.

Email notifications:
- Configure SMTP variables in `backend/.env`:
	- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `EMAIL_USE_TLS`, `DEFAULT_FROM_EMAIL`.
- Assignment emails are sent automatically when users are added to a task's assignees.
- To send deadline reminders, run the management command (or schedule it via cron):

```powershell
cd backend
& .\.venv\Scripts\Activate.ps1
python manage.py send_deadline_notifications --hours 24
```

