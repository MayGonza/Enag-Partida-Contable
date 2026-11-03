$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
try {
    $wb = $excel.Workbooks.Open('c:\Users\DELL\OneDrive\Desktop\Enag-Partida-Contable\Enag-Partida-Contable\planilla2.xls')
    $sheet = $wb.Sheets.Item("Planilla Pago")
    
    $row5 = @()
    $row6 = @()
    # Let's inspect up to 50 columns
    for ($c = 1; $c -le 50; $c++) {
        $row5 += $sheet.Cells.Item(5, $c).Text
        $row6 += $sheet.Cells.Item(6, $c).Text
    }
    
    Write-Output "Row 5: $($row5 -join ' | ')"
    Write-Output "Row 6: $($row6 -join ' | ')"
    $wb.Close($false)
} catch {
    Write-Output "Error: $_"
} finally {
    $excel.Quit()
}
