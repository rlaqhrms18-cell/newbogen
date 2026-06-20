@echo off
echo Building the blog...
node build.js
echo.
echo Opening Netlify login...
cmd.exe /c ".\node_modules\.bin\netlify login"
echo.
echo Linking to your Netlify site...
cmd.exe /c ".\node_modules\.bin\netlify link --name gleeful-crostata-f32160"
echo.
echo Deploying to Netlify...
cmd.exe /c ".\node_modules\.bin\netlify deploy --prod"
echo.
echo Done! Press any key to exit.
pause
