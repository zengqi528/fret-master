#!/usr/bin/env pwsh
# deploy.ps1 — 一键部署到 Vercel
# 用法: .\deploy.ps1 "commit message"

param([string]$msg = "update")

Write-Host "=== 1/4 Git Add ===" -ForegroundColor Cyan
git add -A

Write-Host "=== 2/4 Git Commit ===" -ForegroundColor Cyan  
git commit -m $msg
if ($LASTEXITCODE -ne 0) {
    Write-Host "Nothing to commit, pushing anyway..." -ForegroundColor Yellow
}

Write-Host "=== 3/4 Git Push ===" -ForegroundColor Cyan
git push origin master
if ($LASTEXITCODE -ne 0) {
    Write-Host "Push failed!" -ForegroundColor Red
    exit 1
}

Write-Host "=== 4/4 Vercel Deploy ===" -ForegroundColor Cyan
$output = npx -y vercel --prod --yes 2>&1 | Out-String
Write-Host $output

# Extract deployment URL and set alias
$match = [regex]::Match($output, 'https://fret-master-\S+\.vercel\.app')
if ($match.Success) {
    $deployUrl = $match.Value
    Write-Host "Setting alias: fret-master-app.vercel.app -> $deployUrl" -ForegroundColor Green
    npx -y vercel alias set $deployUrl fret-master-app.vercel.app
    Write-Host ""
    Write-Host "=== DONE! ===" -ForegroundColor Green
    Write-Host "Live at: https://fret-master-app.vercel.app/" -ForegroundColor Green
} else {
    Write-Host "Could not extract deploy URL, alias not set" -ForegroundColor Yellow
    Write-Host "Auto-deploy URL: https://fret-master-khaki.vercel.app/" -ForegroundColor Cyan
}
