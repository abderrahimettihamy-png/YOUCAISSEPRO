# CPU Stress Test Script
# This will utilize all CPU cores to maximum capacity

param(
    [int]$DurationSeconds = 30,
    [int]$Threads = [Environment]::ProcessorCount
)

Write-Host "=== CPU STRESS TEST ===" -ForegroundColor Cyan
Write-Host "Threads: $Threads (All CPU cores)" -ForegroundColor Yellow
Write-Host "Duration: $DurationSeconds seconds" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop early" -ForegroundColor Red
Write-Host ""

$jobs = @()

# Create intensive computation jobs for each CPU core
1..$Threads | ForEach-Object {
    $job = Start-Job -ScriptBlock {
        param($duration)
        $endTime = (Get-Date).AddSeconds($duration)
        $result = 0
        
        while ((Get-Date) -lt $endTime) {
            # Intensive mathematical operations
            for ($i = 0; $i -lt 100000; $i++) {
                $result = [Math]::Sqrt($i) * [Math]::PI
                $result = [Math]::Pow($result, 2)
                $result = [Math]::Log($result + 1) * [Math]::E
                $result = [Math]::Sin($result) + [Math]::Cos($result)
            }
        }
        return $result
    } -ArgumentList $DurationSeconds
    
    $jobs += $job
    Write-Host "Started stress thread $_ of $Threads" -ForegroundColor Green
}

Write-Host "`nAll threads running! Monitoring progress..." -ForegroundColor Cyan

# Monitor progress
$startTime = Get-Date
while ((Get-Date) -lt $startTime.AddSeconds($DurationSeconds)) {
    $elapsed = [math]::Round(((Get-Date) - $startTime).TotalSeconds, 1)
    $remaining = $DurationSeconds - $elapsed
    Write-Progress -Activity "CPU Stress Test Running" -Status "Time remaining: $remaining seconds" -PercentComplete (($elapsed / $DurationSeconds) * 100)
    Start-Sleep -Milliseconds 500
}

Write-Host "`nStopping all threads..." -ForegroundColor Yellow
$jobs | Wait-Job | Out-Null
$jobs | Remove-Job

Write-Host "=== STRESS TEST COMPLETED ===" -ForegroundColor Green
Write-Host "Check Task Manager to see CPU usage drop back to normal" -ForegroundColor Cyan
