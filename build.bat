@echo off
setlocal

for /f "delims=" %%a in (version.txt) do (
	set "version=%%a"
)

echo VERSION
echo %version%

set "outpath=.\tags\%version%"
del /F /Q /S %outpath%\
mkdir %outpath%\

copy *.md %outpath%\
copy *.txt %outpath%\
copy *.css %outpath%\
copy *.html %outpath%\
copy *.js %outpath%\
copy *.png %outpath%\
copy *.json %outpath%\
del %outpath%\version.txt

xcopy /S /Y _locales\ %outpath%\_locales\

echo # Chromium ###############################################################

set "makepath=.\release\chromium"
del /F /Q /S %makepath%\RamoT\
xcopy /S /Y %outpath%\ %makepath%\RamoT\

del %makepath%\RamoT\firefox-*.*

set "zipfile=%makepath%\RamoT-%version%.zip"
del %zipfile%

powershell compress-archive %makepath%\RamoT\* %zipfile% -Force

set "basefile=%makepath%\RamoT.zip"
del %basefile%

copy %zipfile% %basefile%

echo # Firefox ################################################################

set "makepath=.\release\firefox\"
del /F /Q /S %makepath%\RamoT\
xcopy /S /Y %outpath%\ %makepath%\RamoT\

del %makepath%\RamoT\manifest.json
del %makepath%\RamoT\firefox-updates.json
move %makepath%RamoT\firefox-manifest.json %makepath%RamoT\manifest.json

set "zipfile=%makepath%\RamoT-%version%.zip"
del %zipfile%

rem powershell compress-archive %makepath%\RamoT\* %zipfile% -Force
"C:\Program Files\7-Zip\7z.exe" a %zipfile% %makepath%\RamoT\*

set "basefile=%makepath%\RamoT.zip"
del %basefile%

copy %zipfile% %basefile%

endlocal
rem pause
echo on
