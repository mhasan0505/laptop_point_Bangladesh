# Script to rename product folders to use dashes instead of spaces
# This enables Next.js image optimization

$productsPath = "C:\Users\user\Desktop\MyProjects\2025\laptop_point_bangladesh\public\products"

Write-Host "Starting folder rename process..." -ForegroundColor Green

# Get all subdirectories in products folder
$brands = Get-ChildItem -Path $productsPath -Directory

foreach ($brand in $brands) {
  Write-Host "`nProcessing brand: $($brand.Name)" -ForegroundColor Cyan

  # Get all product folders under each brand
  $productFolders = Get-ChildItem -Path $brand.FullName -Directory

  foreach ($folder in $productFolders) {
    $oldName = $folder.Name
    # Replace both spaces and underscores with dashes
    $newName = $oldName -replace '[ _]', '-'

    if ($oldName -ne $newName) {
      $oldPath = $folder.FullName
      $newPath = Join-Path $brand.FullName $newName

      Write-Host "  Renaming: $oldName" -ForegroundColor Yellow
      Write-Host "        To: $newName" -ForegroundColor Green

      try {
        Rename-Item -Path $oldPath -NewName $newName -ErrorAction Stop
        Write-Host "  ✓ Success" -ForegroundColor Green
      }
      catch {
        Write-Host "  ✗ Error: $_" -ForegroundColor Red
      }
    }
    else {
      Write-Host "  ✓ Already formatted: $oldName" -ForegroundColor Gray
    }
  }
}

Write-Host "`nFolder rename complete!" -ForegroundColor Green
Write-Host "Next: Update the data.ts file to use new folder names" -ForegroundColor Yellow
