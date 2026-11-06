# Stage 1: build the React app (Node is only needed here)
FROM node:24-slim AS frontend
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: the real image (Python only)
FROM python:3.13-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
COPY --from=frontend /frontend/dist ./frontend/dist


ENV DB_PATH=/app/data/uptime.db
RUN mkdir -p /app/data

EXPOSE 5001
CMD ["sh", "start.sh"]
