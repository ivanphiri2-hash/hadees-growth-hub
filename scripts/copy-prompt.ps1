# Copy LOVABLE_PROMPT.md contents to clipboard (PowerShell)
# Usage: in project root: .\scripts\copy-prompt.ps1
Get-Content -Path .\LOVABLE_PROMPT.md -Raw | Set-Clipboard
Write-Host 'LOVABLE_PROMPT.md copied to clipboard.'
