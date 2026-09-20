$path = Join-Path $PSScriptRoot 'dados.json'
$text = Get-Content -Raw -Encoding UTF8 $path

$replacements = [ordered]@{
  'A‰' = 'á'
  'A£' = 'ã'
  ('A' + [char]0xA0) = 'à'
  'A§' = 'ç'
  'A¢' = 'õ'
  'A³' = 'ô'
  'Aª' = 'ê'
  'A©' = 'é'
  'A´' = 'ó'
  'Aº' = 'ú'
  'A±' = 'ñ'
  'A¼' = 'ü'
  'A¤' = 'í'
  'Aµ' = 'ã'
  'A¥' = 'ã'
  'A…' = 'ã'
  'A¡' = 'á'
  'A¬' = 'ã'
  'A¹' = 'ô'
  'A«' = 'ê'
  'ProduçAo' = 'Produção'
  'OperaçA£o' = 'Operação'
  'OperaçAo' = 'Operação'
  'CadeirAo' = 'Cadeirão'
  'sofisticaçA£o' = 'sofisticação'
  'sA£o' = 'são'
  'mA£os' = 'mãos'
  'nA£o' = 'não'
  'A£o' = 'ão'
  'sA£' = 'sã'
}

foreach ($key in $replacements.Keys) {
  $text = $text.Replace($key, $replacements[$key])
}

$obj = $text | ConvertFrom-Json

foreach ($collectionEntry in $obj.colecoes.PSObject.Properties) {
  $collection = $collectionEntry.Value
  foreach ($productEntry in $collection.PSObject.Properties) {
    $product = $productEntry.Value
    $details = if ($product.detalhes) { $product.detalhes } else { [ordered]@{} }
    $product.detalhes = [ordered]@{
      material = if ($details.material -and $details.material.ToString().Trim()) { $details.material.ToString().Trim() } else { 'Madeira' }
      acabamento = if ($details.acabamento -and $details.acabamento.ToString().Trim()) { $details.acabamento.ToString().Trim() } else { 'Natural' }
    }
  }
}

$json = $obj | ConvertTo-Json -Depth 100
Set-Content -Path $path -Value $json -Encoding UTF8
Write-Host 'Dados limpos. Primeiro produto:'
Write-Host $obj.colecoes.Cadeiras_Poltronas.cadeira1.detalhes.material
Write-Host $obj.colecoes.Cadeiras_Poltronas.cadeira1.detalhes.acabamento
