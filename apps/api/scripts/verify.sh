#!/usr/bin/env bash
set -euo pipefail

BASE="${BASE_URL:-http://localhost:3000}"

echo "[INFO] Checking $BASE"
health="$(curl -fsS "$BASE/api/health")"
echo "[OK] Health: $health"

login="$(curl -fsS "$BASE/api/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@university.edu","password":"admin123"}')"

token="$(node -e "const data=JSON.parse(process.argv[1]); console.log(data.token)" "$login")"
role="$(node -e "const data=JSON.parse(process.argv[1]); console.log(data.user.role)" "$login")"
echo "[OK] Login as $role"

stats="$(curl -fsS "$BASE/api/dashboard/stats" -H "Authorization: Bearer $token")"
students="$(curl -fsS "$BASE/api/students" -H "Authorization: Bearer $token")"

node -e "const s=JSON.parse(process.argv[1]); console.log('[OK] Students:', s.totalStudents, '| Entries today:', s.todayEntries)" "$stats"
node -e "const s=JSON.parse(process.argv[1]); console.log('[OK] Student list count:', s.length)" "$students"

echo "All checks passed."
