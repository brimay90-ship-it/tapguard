$file = 'c:\Users\brima\Documents\Projects\tapguard\src\components\matrix\BJJFlowBuilder.jsx'
$content = [System.IO.File]::ReadAllText($file)
# Fix encoding: replace garbled UTF-8 sequences
# The PowerShell Set-Content with -Encoding UTF8 adds BOM and may double-encode
# Re-read as bytes and write back as UTF8 without BOM
$bytes = [System.IO.File]::ReadAllBytes($file)
# Check for BOM
if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
    # Has BOM, strip it
    $bytes = $bytes[3..($bytes.Length-1)]
    [System.IO.File]::WriteAllBytes($file, $bytes)
    Write-Host "Stripped BOM"
} else {
    Write-Host "No BOM found"
}
# Also normalize line endings to LF
$text = [System.IO.File]::ReadAllText($file)
$text = $text.Replace("`r`n", "`n")
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($file, $text, $utf8NoBom)
Write-Host "Done. File size: $((Get-Item $file).Length) bytes"
