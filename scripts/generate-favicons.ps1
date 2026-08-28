Add-Type -AssemblyName System.Drawing

$publicDirectory = Join-Path $PSScriptRoot "..\public"
$sizes = @(16, 32, 48, 180, 192, 512)
$pngData = @{}

function New-SevanIcon {
  param([int]$Size)

  $bitmap = [System.Drawing.Bitmap]::new($Size, $Size)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.Clear([System.Drawing.Color]::Transparent)

  $scale = $Size / 64.0
  $radius = 13 * $scale
  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $diameter = $radius * 2
  $path.AddArc(0, 0, $diameter, $diameter, 180, 90)
  $path.AddArc($Size - $diameter, 0, $diameter, $diameter, 270, 90)
  $path.AddArc($Size - $diameter, $Size - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc(0, $Size - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()

  $background = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 30, 58, 138))
  $graphics.FillPath($background, $path)

  $borderWidth = [Math]::Max(1.0, 2.5 * $scale)
  $border = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(255, 157, 184, 255), $borderWidth)
  $graphics.DrawPath($border, $path)

  $points = [System.Drawing.PointF[]]@(
    [System.Drawing.PointF]::new(15 * $scale, 14 * $scale),
    [System.Drawing.PointF]::new(51 * $scale, 14 * $scale),
    [System.Drawing.PointF]::new(51 * $scale, 24 * $scale),
    [System.Drawing.PointF]::new(36 * $scale, 53 * $scale),
    [System.Drawing.PointF]::new(23 * $scale, 53 * $scale),
    [System.Drawing.PointF]::new(38 * $scale, 24 * $scale),
    [System.Drawing.PointF]::new(15 * $scale, 24 * $scale)
  )
  $mark = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
  $graphics.FillPolygon($mark, $points)

  $mark.Dispose()
  $border.Dispose()
  $background.Dispose()
  $path.Dispose()
  $graphics.Dispose()
  return $bitmap
}

foreach ($size in $sizes) {
  $bitmap = New-SevanIcon -Size $size
  $stream = [System.IO.MemoryStream]::new()
  $bitmap.Save($stream, [System.Drawing.Imaging.ImageFormat]::Png)
  $pngData[$size] = $stream.ToArray()

  if ($size -eq 48) {
    $bitmap.Save((Join-Path $publicDirectory "favicon-48.png"), [System.Drawing.Imaging.ImageFormat]::Png)
  }
  elseif ($size -eq 180) {
    $bitmap.Save((Join-Path $publicDirectory "apple-touch-icon.png"), [System.Drawing.Imaging.ImageFormat]::Png)
  }
  elseif ($size -eq 192 -or $size -eq 512) {
    $bitmap.Save((Join-Path $publicDirectory "favicon-$size.png"), [System.Drawing.Imaging.ImageFormat]::Png)
  }

  $stream.Dispose()
  $bitmap.Dispose()
}

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
