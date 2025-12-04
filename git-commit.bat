@echo off
"C:\Program Files\Git\bin\git.exe" commit -m "Initial commit: MindNest Backend with Challenger AI"
"C:\Program Files\Git\bin\git.exe" branch -M main
echo.
echo ========================================
echo Git repository is ready!
echo ========================================
echo.
echo NEXT STEPS:
echo.
echo 1. Go to your GitHub repository page
echo 2. Copy the repository URL (should look like: https://github.com/YOUR_USERNAME/mindnest-backend.git)
echo 3. Run this command (replace YOUR_REPO_URL with the actual URL):
echo.
echo    "C:\Program Files\Git\bin\git.exe" remote add origin YOUR_REPO_URL
echo.
echo 4. Then push your code:
echo.
echo    "C:\Program Files\Git\bin\git.exe" push -u origin main
echo.
pause
