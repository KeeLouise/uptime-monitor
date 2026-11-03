#!/bin/sh
python -u checker.py &
exec gunicorn --bind 0.0.0.0:5001 app:app
