@echo off
echo ========================================
echo MindNest Backend - Git Setup
echo ========================================
echo.

REM Configure git user
"C:\Program Files\Git\bin\git.exe" config user.email "mindnest@example.com"
"C:\Program Files\Git\bin\git.exe" config user.name "MindNest Dev"

REM Commit the code
"C:\Program Files\Git\bin\git.exe" commit -m "Initial commit: MindNest Backend with Challenger AI"

REM Set main branch
"C:\Program Files\Git\bin\git.exe" branch -M main

echo.
echo ========================================
echo SUCCESS! Git repository is ready!
echo ========================================
echo.
echo NEXT STEPS TO DEPLOY:
echo.
echo 1. Go to your GitHub repository page
echo    (https://github.com/YOUR_USERNAME/mindnest-backend)
echo.
echo 2. Copy the repository URL
echo.
echo 3. Open a NEW terminal in this folder and run:
echo.
echo    "C:\Program Files\Git\bin\git.exe" remote add origin YOUR_REPO_URL
echo    "C:\Program Files\Git\bin\git.exe" push -u origin main
echo.
echo 4. Then go to render.com and deploy!
echo.
echo ========================================
echo.
pause
