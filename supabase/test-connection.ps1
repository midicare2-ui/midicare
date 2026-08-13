$url = 'https://icmpgdkosxyjihlgbjkd.supabase.co/rest/v1/products?select=id&limit=1'
$key = 'sb_publishable_O5zIcoIgNRum1Sj2wsGf6A_PEBXQplt'
$headers = @{
    'apikey' = $key
    'Authorization' = "Bearer $key"
    'Content-Type' = 'application/json'
}

try {
    $response = Invoke-RestMethod -Uri $url -Headers $headers -Method GET
    Write-Host "SUCCESS: Connection OK"
    Write-Host "Response: $($response | ConvertTo-Json -Depth 3)"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $statusDesc = $_.Exception.Response.StatusDescription
    Write-Host "ERROR: $($_.Exception.Message)"
    Write-Host "Status Code: $statusCode"
    Write-Host "Status Description: $statusDesc"
    
    # Try to read response body
    try {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $body = $reader.ReadToEnd()
        Write-Host "Response Body: $body"
    } catch {}
}
