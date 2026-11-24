; Removes the per-user "Run" registry entry that Electron's login-item
; API writes when "Start at sign-in" is enabled.
!macro customUnInstall
  DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "Gen V1"
  DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Explorer\StartupApproved\Run" "Gen V1"
!macroend
