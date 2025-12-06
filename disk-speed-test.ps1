# Disk Speed Test Script
# Tests read and write speeds of your hard drive

param(
    [string]$TestPath = "$env:TEMP\disktest",
    [int]$FileSizeMB = 100
)

Write-Host "=== DISK SPEED TEST ===" -ForegroundColor Cyan
Write-Host "Drive: $(Split-Path $TestPath -Qualifier)" -ForegroundColor Yellow
Write-Host "Test file size: $FileSizeMB MB" -ForegroundColor Yellow
Write-Host ""

# Create test directory
New-Item -ItemType Directory -Path $TestPath -Force | Out-Null

try {
    # Generate test data
    Write-Host "Preparing test data..." -ForegroundColor Yellow
    $testFile = Join-Path $TestPath "speedtest.tmp"
    $data = New-Object byte[] (1MB)
    (New-Object Random).NextBytes($data)
    
    # WRITE TEST
    Write-Host "`nTesting WRITE speed..." -ForegroundColor Green
    $writeStart = Get-Date
    
    $stream = [System.IO.File]::Create($testFile)
    for ($i = 0; $i -lt $FileSizeMB; $i++) {
        $stream.Write($data, 0, $data.Length)
        $progress = [math]::Round(($i / $FileSizeMB) * 100)
        Write-Progress -Activity "Writing test file" -Status "$progress% Complete" -PercentComplete $progress
    }
    $stream.Close()
    
    $writeEnd = Get-Date
    $writeDuration = ($writeEnd - $writeStart).TotalSeconds
    $writeSpeed = [math]::Round($FileSizeMB / $writeDuration, 2)
    
    Write-Host "Write Speed: $writeSpeed MB/s" -ForegroundColor Cyan
    
    # READ TEST
    Write-Host "`nTesting READ speed..." -ForegroundColor Green
    $readStart = Get-Date
    
    $stream = [System.IO.File]::OpenRead($testFile)
    $buffer = New-Object byte[] (1MB)
    $totalRead = 0
    
    while (($bytesRead = $stream.Read($buffer, 0, $buffer.Length)) -gt 0) {
        $totalRead += $bytesRead
        $progress = [math]::Round(($totalRead / ($FileSizeMB * 1MB)) * 100)
        Write-Progress -Activity "Reading test file" -Status "$progress% Complete" -PercentComplete $progress
    }
    $stream.Close()
    
    $readEnd = Get-Date
    $readDuration = ($readEnd - $readStart).TotalSeconds
    $readSpeed = [math]::Round($FileSizeMB / $readDuration, 2)
    
    Write-Host "Read Speed: $readSpeed MB/s" -ForegroundColor Cyan
    
    # RESULTS
    Write-Host "`n=== RESULTS ===" -ForegroundColor Green
    Write-Host "Write Speed: $writeSpeed MB/s" -ForegroundColor White
    Write-Host "Read Speed:  $readSpeed MB/s" -ForegroundColor White
    
    # Performance rating
    Write-Host "`n=== PERFORMANCE RATING ===" -ForegroundColor Cyan
    if ($readSpeed -gt 500) {
        Write-Host "Excellent (NVMe SSD)" -ForegroundColor Green
    } elseif ($readSpeed -gt 200) {
        Write-Host "Very Good (SATA SSD)" -ForegroundColor Green
    } elseif ($readSpeed -gt 100) {
        Write-Host "Good (Fast HDD or older SSD)" -ForegroundColor Yellow
    } else {
        Write-Host "Slow (Traditional HDD)" -ForegroundColor Red
    }
    
} finally {
    # Cleanup
    Write-Host "`nCleaning up test files..." -ForegroundColor Yellow
    Remove-Item -Path $TestPath -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "Test completed!" -ForegroundColor Green
}
