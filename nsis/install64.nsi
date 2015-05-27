; NOTE: this .NSI script is designed for NSIS v1.8+
; and is shamelessly ripped from https://github.com/tweecode/twine/blob/master/install.nsi

Name "Twine 2.0.5"
OutFile "..\dist\nsis\twine_2.0.5_win64.exe"

; Some default compiler settings (uncomment and change at will):
; SetCompress auto ; (can be off or force)
; SetDatablockOptimize on ; (can be off)
; CRCCheck on ; (can be off)
; AutoCloseWindow false ; (can be true for the window go away automatically at end)
; ShowInstDetails hide ; (can be show to have them shown, or nevershow to disable)
; SetDateSave off ; (can be on to have files restored to their orginal date)
RequestExecutionLevel highest

InstallDir "$PROGRAMFILES\Twine 2"
InstallDirRegKey HKEY_LOCAL_MACHINE "SOFTWARE\Twine2" ""
;DirShow show ; (make this hide to not let the user change it)
DirText "Choose which folder to install Twine 2 into:"

Section "" ; (default section)
SetOutPath "$INSTDIR"

; add files / whatever that need to be installed here.
; see http://nsis.sourceforge.net/Docs/Chapter4.html#4.9.1.5

File /r "..\dist\nwjs\Twine\win64\*"

; add Start Menu entries

CreateDirectory "$SMPROGRAMS\Twine 2\"
CreateShortCut "$SMPROGRAMS\Twine 2\Twine.lnk" "$INSTDIR\Twine.exe"
CreateShortCut "$SMPROGRAMS\Twine 2\Uninstall.lnk" "$INSTDIR\uninstalltwine.exe"

; add uninstall entry in Add/Remove Programs

WriteRegStr HKEY_LOCAL_MACHINE "SOFTWARE\Twine2" "" "$INSTDIR"
WriteRegStr HKEY_LOCAL_MACHINE "Software\Microsoft\Windows\CurrentVersion\Uninstall\Twine2" "DisplayName" "Twine 2.0.5 (remove only)"
WriteRegStr HKEY_LOCAL_MACHINE "Software\Microsoft\Windows\CurrentVersion\Uninstall\Twine2" "UninstallString" '"$INSTDIR\uninstalltwine.exe"'

; write out uninstaller

WriteUninstaller "$INSTDIR\uninstalltwine.exe"

SectionEnd ; end of default section


; begin uninstall settings/section

UninstallText "This will uninstall Twine 2.0.5 from your system."

Section Uninstall

; add delete commands to delete whatever files/registry keys/etc you installed here.

Delete "$INSTDIR\uninstalltwine.exe"
DeleteRegKey HKEY_LOCAL_MACHINE "SOFTWARE\Twine2"
DeleteRegKey HKEY_LOCAL_MACHINE "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\Twine2"
RMDir /r "$SMPROGRAMS\Twine"
RMDir /r "$INSTDIR"
SectionEnd ; end of uninstall section

; eof
