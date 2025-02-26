#!/bin/bash
set -e

run() {
    echo "Uruchamianie: $@"
    "$@"
}

echo "Uruchamianie npm install w katalogu /backend..."
cd backend
run npm install

echo "Uruchamianie npm install w katalogu /frontend..."
cd ../frontend
run npm install

echo "Uruchamianie redis-server w katalogu /backend..."
cd ../backend
run redis-server &

REDIS_PID=$!

echo "Uruchamianie backendu..."
run npm start &

BACKEND_PID=$!

echo "Uruchamianie frontend..."
cd ../frontend
run npm start &

FRONTEND_PID=$!

trap "kill $REDIS_PID $BACKEND_PID $FRONTEND_PID" EXIT

wait $REDIS_PID $BACKEND_PID $FRONTEND_PID
