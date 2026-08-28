Add-Type -AssemblyName System.Drawing

$publicDirectory = Join-Path $PSScriptRoot "..\public"
$sourcePath = Join-Path $publicDirectory "favicon-192.png"
$outputSizes = @(16, 32, 48, 180, 512)
$pngData = @{}

function New-ResizedIcon {
  param(
    [System.Drawing.Image]$Source,
    [int]$Size
  )

  $bitmap = [System.Drawing.Bitmap]::new(
    $Size,
    $Size,
    [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
  )
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.Clear([System.Drawing.Color]::Transparent)
  $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
  $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.DrawImage($Source, [System.Drawing.Rectangle]::new(0, 0, $Size, $Size))
  $graphics.Dispose()

  return $bitmap
}

$source = [System.Drawing.Image]::FromFile($sourcePath)

foreach ($size in $outputSizes) {
  $bitmap = New-ResizedIcon -Source $source -Size $size
  $stream = [System.IO.MemoryStream]::new()
  $bitmap.Save($stream, [System.Drawing.Imaging.ImageFormat]::Png)
  $pngData[$size] = $stream.ToArray()

  if ($size -eq 48) {
    $bitmap.Save((Join-Path $publicDirectory "favicon-48.png"), [System.Drawing.Imaging.ImageFormat]::Png)
  }
  elseif ($size -eq 180) {
    $bitmap.Save((Join-Path $publicDirectory "apple-touch-icon.png"), [System.Drawing.Imaging.ImageFormat]::Png)
  }
  elseif ($size -eq 512) {
    $bitmap.Save((Join-Path $publicDirectory "favicon-512.png"), [System.Drawing.Imaging.ImageFormat]::Png)
  }

  $stream.Dispose()
  $bitmap.Dispose()
}

$source.Dispose()

$iconStream = [System.IO.File]::Create((Join-Path $publicDirectory "favicon.ico"))
$writer = [System.IO.BinaryWriter]::new($iconStream)
$iconSizes = @(16, 32, 48)
$writer.Write([uint16]0)
$writer.Write([uint16]1)
$writer.Write([uint16]$iconSizes.Count)
$offset = 6 + (16 * $iconSizes.Count)

foreach ($size in $iconSizes) {
  $bytes = $pngData[$size]
  $writer.Write([byte]$size)
  $writer.Write([byte]$size)
  $writer.Write([byte]0)
  $writer.Write([byte]0)
  $writer.Write([uint16]1)
  $writer.Write([uint16]32)
  $writer.Write([uint32]$bytes.Length)
  $writer.Write([uint32]$offset)
  $offset += $bytes.Length
}

foreach ($size in $iconSizes) {
  $writer.Write([byte[]]$pngData[$size])
}

$writer.Dispose()
$iconStream.Dispose()
