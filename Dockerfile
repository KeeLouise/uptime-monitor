FROM python:3.13-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV DB_PATH=/app/data/uptime.db
RUN mkdir -p /app/data

EXPOSE 5001
CMD ["sh", "start.sh"]
