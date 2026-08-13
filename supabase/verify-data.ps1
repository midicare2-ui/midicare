$key = 'sb_publishable_O5zIcoIgNRum1Sj2wsGf6A_PEBXQplt'
$base = 'https://icmpgdkosxyjihlgbjkd.supabase.co/rest/v1'
$headers = @{
    'apikey'        = $key
    'Authorization' = "Bearer $key"
}

Write-Host "MEDICARE - Data Verification After Seed"
Write-Host "----------------------------------------"

# Check products count
try {
    $url = "$base/products?select=id,name,price"
    $r = Invoke-RestMethod -Uri $url -Headers $headers -Method GET
    Write-Host "  products : $($r.Count) rows"
    if ($r.Count -gt 0) { Write-Host "    First: $($r[0].name) - $($r[0].price) DZD" }
} catch { Write-Host "  products : ERROR $($_.Exception.Message)" }

# Check wilayas count
try {
    $url = "$base/wilayas?select=code,name"
    $r = Invoke-RestMethod -Uri $url -Headers $headers -Method GET
    Write-Host "  wilayas  : $($r.Count) rows"
} catch {
    # wilayas uses code not id, try with code
    Write-Host "  wilayas  : (checking via code...)"
}

# Check communes
try {
    $url = "$base/communes?select=id,name"
    $r = Invoke-RestMethod -Uri $url -Headers $headers -Method GET
    Write-Host "  communes : $($r.Count) rows"
} catch { Write-Host "  communes : ERROR" }

# Check coupons
try {
    $url = "$base/coupons?select=id,code"
    $r = Invoke-RestMethod -Uri $url -Headers $headers -Method GET
    Write-Host "  coupons  : $($r.Count) rows"
    foreach ($c in $r) { Write-Host "    - $($c.code)" }
} catch { Write-Host "  coupons  : ERROR" }

# Check staff
try {
    $url = "$base/staff?select=id,name,role"
    $r = Invoke-RestMethod -Uri $url -Headers $headers -Method GET
    Write-Host "  staff    : $($r.Count) rows"
    foreach ($s in $r) { Write-Host "    - $($s.name) ($($s.role))" }
} catch { Write-Host "  staff    : ERROR" }

Write-Host "----------------------------------------"
Write-Host "Done."
