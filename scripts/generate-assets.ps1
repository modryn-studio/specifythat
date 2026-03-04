# scripts/generate-assets.ps1
# ──────────────────────────────────────────────────────────────────────────────
# Generates all favicon, icon, OG image, and README banner assets from your
# logomark. Run from the project root after cloning, and again after any
# logomark or site.ts update.
#
# Requires: ImageMagick (magick) — https://imagemagick.org
#
# ── Inputs (you provide) ──────────────────────────────────────────────────────
#
#   REQUIRED:
#   public/brand/logomark.png       1024×1024 recommended.
#                                   Use a COLORED mark that works on both light
#                                   and dark backgrounds, OR a dark mark on
#                                   transparent bg if you want the auto-invert
#                                   dual-favicon mode (see below).
#
#   OPTIONAL — enables dual favicon mode:
#   public/brand/logomark-dark.png  Your mark as it should appear on dark
#                                   backgrounds (e.g. white/light-colored).
#                                   If this file exists, the script uses both
#                                   files for light/dark favicon switching.
#                                   If absent, logomark.png is used for both
#                                   modes (good for colored marks).
#
#   OPTIONAL — skipped if missing, auto-generated:
#   public/brand/banner.png         1280×320 README header image.
#                                   If absent, the script generates one from
#                                   your logomark + site name.
#
# ── Outputs (auto-generated — do not edit by hand) ───────────────────────────
#
#   public/icon-light.png           Favicon in light mode
#   public/icon-dark.png            Favicon in dark mode
#   public/icon.png                 1024×1024 for manifest + JSON-LD
#   public/favicon.ico              Legacy multi-res (48/32/16px)
#   src/app/apple-icon.png          180×180 iOS home screen (dark bg)
#   public/og-image.png             1200×630 social card
#   public/brand/banner.png         1280×320 README banner (if not provided)
#
# ─────────────────────────────────────────────────────────────────────────────

# Run from repo root regardless of where the script is called from
Set-Location (Split-Path -Parent $PSScriptRoot)

$logomark     = "public\brand\logomark.png"
$logomarkDark = "public\brand\logomark-dark.png"
$banner       = "public\brand\banner.png"

# ── Guards ────────────────────────────────────────────────────────────────────
if (-not (Test-Path $logomark)) {
    Write-Host ""
    Write-Host "  ERROR: $logomark not found." -ForegroundColor Red
    Write-Host "  Drop your logomark (1024x1024 recommended) at that path and re-run." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

if (-not (Get-Command magick -ErrorAction SilentlyContinue)) {
    Write-Host ""
    Write-Host "  ERROR: ImageMagick not found." -ForegroundColor Red
    Write-Host "  Install from https://imagemagick.org then re-run." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# ── Read site name from site.ts (for OG image + banner text) ─────────────────
$siteName = "Your Site"
$siteTs = "src\config\site.ts"
if (Test-Path $siteTs) {
    $nameLine = Select-String -Path $siteTs -Pattern "name:\s*'([^']+)'" | Select-Object -First 1
    if ($nameLine) {
        $match = [regex]::Match($nameLine.Line, "name:\s*'([^']+)'")
        if ($match.Success -and $match.Groups[1].Value -notmatch 'TODO') {
            $siteName = $match.Groups[1].Value
        }
    }
}

Write-Host ""
Write-Host "  Generating assets — site: $siteName" -ForegroundColor Cyan
Write-Host ""

# ── Favicon pair ─────────────────────────────────────────────────────────────
# DUAL MODE   — public/brand/logomark-dark.png exists:
#               icon-light.png = logomark.png (your dark/colored mark)
#               icon-dark.png  = logomark-dark.png (your light/white mark)
#
# SINGLE MODE — only logomark.png exists:
#               icon-light.png = icon-dark.png = logomark.png
#               Use this for colored marks that read well on any background.
if (Test-Path $logomarkDark) {
    Write-Host "  favicon mode: DUAL (logomark.png + logomark-dark.png)" -ForegroundColor DarkGray
    Copy-Item $logomark     "public\icon-light.png"
    Copy-Item $logomarkDark "public\icon-dark.png"
} else {
    Write-Host "  favicon mode: SINGLE (logomark.png used for both modes)" -ForegroundColor DarkGray
    Write-Host "  Tip: add public/brand/logomark-dark.png to enable light/dark favicon switching." -ForegroundColor DarkGray
    Copy-Item $logomark "public\icon-light.png"
    Copy-Item $logomark "public\icon-dark.png"
}
Write-Host "  + public/icon-light.png"
Write-Host "  + public/icon-dark.png"

# ── icon.png: manifest + JSON-LD (dark bg, white/inverted mark) ──────────────
magick -size 1024x1024 xc:"#111111" `
    '(' $logomark -channel RGB -negate -resize 800x800 ')' `
    -gravity Center -composite "public\icon.png"
Write-Host "  + public/icon.png"

# ── apple-icon.png: iOS home screen (dark bg, 180x180) ───────────────────────
if (-not (Test-Path "src\app")) { New-Item -ItemType Directory -Path "src\app" | Out-Null }
magick -size 180x180 xc:"#111111" `
    '(' $logomark -channel RGB -negate -resize 140x140 ')' `
    -gravity Center -composite "src\app\apple-icon.png"
Write-Host "  + src/app/apple-icon.png"

# ── favicon.ico: legacy multi-resolution ─────────────────────────────────────
magick $logomark -define icon:auto-resize=48,32,16 "public\favicon.ico"
Write-Host "  + public/favicon.ico"

# ── og-image.png: 1200x630 social card ───────────────────────────────────────
magick -size 1200x630 xc:"#111111" `
    '(' $logomark -channel RGB -negate -resize 100x100 ')' `
    -gravity North -geometry +0+75 -composite `
    -gravity North -font "Arial-Bold" -pointsize 88 -fill "#e5e5e5" -annotate +0+230 $siteName `
    -fill "#6366f1" -draw "rectangle 0,618 1200,630" `
    "public\og-image.png"
Write-Host "  + public/og-image.png"

# ── banner.png: 1280x320 README header ───────────────────────────────────────
# Generated only if not already provided by the user.
if (Test-Path $banner) {
    Write-Host "  ~ public/brand/banner.png (skipped — file already exists)"
} else {
    Write-Host "  + public/brand/banner.png (auto-generated)"
    if (-not (Test-Path "public\brand")) { New-Item -ItemType Directory -Path "public\brand" | Out-Null }
    magick -size 1280x320 xc:"#111111" `
        '(' $logomark -channel RGB -negate -resize 160x160 ')' `
        -gravity West -geometry +100+0 -composite `
        -gravity West -font "Arial-Bold" -pointsize 72 -fill "#e5e5e5" -annotate +300+0 $siteName `
        $banner
}

Write-Host ""
Write-Host "  Done." -ForegroundColor Green
if ($siteName -eq "Your Site") {
    Write-Host "  Tip: fill in src/config/site.ts, then re-run to stamp your site name on" -ForegroundColor DarkGray
    Write-Host "       the OG image and banner." -ForegroundColor DarkGray
}
Write-Host ""
