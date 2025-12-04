@echo off
"C:\Program Files\Git\bin\git.exe" commit -m "Initial commit: MindNest Backend"
"C:\Program Files\Git\bin\git.exe" branch -M main
echo.
echo Git setup complete!
echo.
echo Next steps:
echo 1. Copy your GitHub repository URL
echo 2. Run: "C:\Program Files\Git\bin\git.exe" remote add origin YOUR_REPO_URL
echo 3. Run: "C:\Program Files\Git\bin\git.exe" push -u origin main
pause
