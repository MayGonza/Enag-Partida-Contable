$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
try {
    $wb = $excel.Workbooks.Open('c:\Users\DELL\OneDrive\Desktop\Enag-Partida-Contable\Enag-Partida-Contable\planilla2.xls')
    foreach ($sheet in $wb.Sheets) {
        Write-Output "=== SHEET: $($sheet.Name) ==="
        for ($r = 1; $r -le 25; $r++) {
            $row = @()
            for ($c = 1; $c -le 25; $c++) {
                $row += $sheet.Cells.Item($r, $c).Text
            }
            $line = "Row " + $r + ": " + ($row -join " | ")
            Write-Output $line
        }
    }
    $wb.Close($false)
} catch {
    Write-Output "Error: $_"
} finally {
    $excel.Quit()
}
