$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
try {
    $wb = $excel.Workbooks.Open('c:\Users\DELL\OneDrive\Desktop\Enag-Partida-Contable\Enag-Partida-Contable\planilla2.xls')
    $sheet = $wb.Sheets.Item("Planilla Pago")
    
    # Read Row 9 in detail
    Write-Output "--- DIAGNOSTIC FOR ROW 9 ---"
    for ($c = 1; $c -le 10; $c++) {
        $cell = $sheet.Cells.Item(9, $c)
        $text = $cell.Text
        $val = $cell.Value2
        $type = if ($val -ne $null) { $val.GetType().Name } else { "Null" }
        Write-Output ("Col " + $c + ": Text='" + $text + "', Value2='" + $val + "', Type='" + $type + "'")
    }
    
    # Read Row 12 in detail
    Write-Output "--- DIAGNOSTIC FOR ROW 12 ---"
    for ($c = 1; $c -le 10; $c++) {
        $cell = $sheet.Cells.Item(12, $c)
        $text = $cell.Text
        $val = $cell.Value2
        $type = if ($val -ne $null) { $val.GetType().Name } else { "Null" }
        Write-Output ("Col " + $c + ": Text='" + $text + "', Value2='" + $val + "', Type='" + $type + "'")
    }
    
    $wb.Close($false)
} catch {
    Write-Output "Error: $_"
} finally {
    $excel.Quit()
}
