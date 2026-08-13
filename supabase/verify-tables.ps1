$key = 'sb_publishable_O5zIcoIgNRum1Sj2wsGf6A_PEBXQplt'
$base = 'https://icmpgdkosxyjihlgbjkd.supabase.co/rest/v1'
$headers = @{
    'apikey'        = $key
    'Authorization' = "Bearer $key"
}

Write-Host "MEDICARE - Supabase Verification Check"
Write-Host "--------------------------------------"

$tables = @('products', 'orders', 'wilayas', 'communes', 'coupons', 'reviews', 'staff', 'audit_logs', 'customers', 'categories')

foreach ($table in $tables) {
    try {
        $url = "$base/" + $table + "?select=id&limit=1"
        $result = Invoke-RestMethod -Uri $url -Headers $headers -Method GET
        Write-Host "  OK   $table"
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        Write-Host "  FAIL $table (HTTP $code)"
    }
}

Write-Host "--------------------------------------"
Write-Host "Done."
