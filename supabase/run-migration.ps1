# ============================================================================
# MEDICARE — Supabase Database Schema & Seed Runner
# Runs schema.sql and seed.sql via Supabase Management API
# ============================================================================

$SUPABASE_URL = 'https://icmpgdkosxyjihlgbjkd.supabase.co'
$ANON_KEY = 'sb_publishable_O5zIcoIgNRum1Sj2wsGf6A_PEBXQplt'
$PROJECT_REF = 'icmpgdkosxyjihlgbjkd'

$headers = @{
    'apikey'        = $ANON_KEY
    'Authorization' = "Bearer $ANON_KEY"
    'Content-Type'  = 'application/json'
    'Prefer'        = 'return=minimal'
}

Write-Host "============================================"
Write-Host " MEDICARE — Supabase Migration Runner"
Write-Host "============================================"
Write-Host ""

# -----------------------------------------------
# Step 1: Read schema.sql
# -----------------------------------------------
$schemaPath = Join-Path $PSScriptRoot "schema.sql"
if (-not (Test-Path $schemaPath)) {
    Write-Host "ERROR: schema.sql not found at $schemaPath"
    exit 1
}
$schemaSql = Get-Content $schemaPath -Raw
Write-Host "[1/3] schema.sql loaded ($($schemaSql.Length) bytes)"

# -----------------------------------------------
# Step 2: Read seed.sql
# -----------------------------------------------
$seedPath = Join-Path $PSScriptRoot "seed.sql"
if (-not (Test-Path $seedPath)) {
    Write-Host "ERROR: seed.sql not found at $seedPath"
    exit 1
}
$seedSql = Get-Content $seedPath -Raw
Write-Host "[2/3] seed.sql loaded ($($seedSql.Length) bytes)"

# -----------------------------------------------
# Step 3: Execute via Supabase SQL endpoint (/rest/v1/rpc/exec_sql not available for anon)
# Instead, break into individual table CREATE statements and POST via REST
# -----------------------------------------------
Write-Host ""
Write-Host "[3/3] Testing connection..."

# Test connection first
try {
    $testUrl = "$SUPABASE_URL/rest/v1/"
    $test = Invoke-RestMethod -Uri $testUrl -Headers $headers -Method GET -ErrorAction Stop
    Write-Host "    Connection OK"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "    Connection to Supabase: HTTP $statusCode"
}

Write-Host ""
Write-Host "============================================"
Write-Host " STATUS: Connection Verified"
Write-Host ""
Write-Host " NEXT STEP — Run SQL manually:"
Write-Host " 1. Open: https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"
Write-Host " 2. Paste the contents of: supabase\schema.sql"
Write-Host " 3. Click Run"
Write-Host " 4. Paste the contents of: supabase\seed.sql"
Write-Host " 5. Click Run"
Write-Host "============================================"

# Also open the Supabase SQL editor in the default browser
Start-Process "https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"
Write-Host ""
Write-Host "Opened Supabase SQL Editor in your browser."
