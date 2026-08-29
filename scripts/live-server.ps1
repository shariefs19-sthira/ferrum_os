Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Start-Process powershell -ArgumentList '-NoExit','-Command','cd D:\ferrum_os; pnpm --filter ./apps/web start -p 3001'