# Quick smoke test — run while server is up (npm start)
$ErrorActionPreference = "Stop"
$base = "http://localhost:3000"

$health = Invoke-RestMethod "$base/api/health"
Write-Host "[OK] Health:" $health.status

$login = Invoke-RestMethod "$base/api/auth/login" -Method POST -ContentType "application/json" `
  -Body '{"email":"admin@university.edu","password":"admin123"}'
Write-Host "[OK] Login as" $login.user.role

$h = @{ Authorization = "Bearer $($login.token)" }
$stats = Invoke-RestMethod "$base/api/dashboard/stats" -Headers $h
Write-Host "[OK] Students:" $stats.totalStudents "| Entries today:" $stats.todayEntries

$students = Invoke-RestMethod "$base/api/students" -Headers $h
Write-Host "[OK] Student list count:" $students.Count

Write-Host ""
Write-Host "All checks passed. Open $base in your browser." -ForegroundColor Green
