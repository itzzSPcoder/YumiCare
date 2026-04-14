$ErrorActionPreference = 'Stop'

$projectRoot = 'D:\Coding\Projects\YumiCare\Yumi-Care-Credibility\artifacts\flutter-ready\flutter_app'
$libRoot = Join-Path $projectRoot 'lib'
$expoApp = 'D:\Coding\Projects\YumiCare\Yumi-Care-Credibility\artifacts\yumicare\app'
$tabsDir = Join-Path $expoApp '(tabs)'
$genDir = Join-Path $libRoot 'screens\generated'

New-Item -ItemType Directory -Force -Path $genDir | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $libRoot 'screens') | Out-Null

function To-PascalCase([string]$value) {
  $normalized = ($value -replace '^\+', '' -replace '[^a-zA-Z0-9]+', ' ')
  $parts = $normalized -split ' ' | Where-Object { $_ -ne '' }
  return ($parts | ForEach-Object {
      if ($_.Length -gt 1) {
        $_.Substring(0, 1).ToUpper() + $_.Substring(1)
      }
      else {
        $_.ToUpper()
      }
    }) -join ''
}

function To-FileName([string]$slug) {
  return (($slug -replace '^\+', '' -replace '[^a-zA-Z0-9]+', '_') + '_screen.dart')
}

$routes = @()

Get-ChildItem $expoApp -File -Filter *.tsx |
  Where-Object { $_.BaseName -ne '_layout' } |
  ForEach-Object {
    $slug = $_.BaseName
    if ($slug.StartsWith('+')) {
      $slug = $slug.Substring(1)
      if ([string]::IsNullOrWhiteSpace($slug)) {
        $slug = 'not-found'
      }
    }
    $className = (To-PascalCase $slug) + 'Screen'
    $fileName = To-FileName $slug
    $title = ($slug -replace '-', ' ')
    $sourcePath = 'app/' + $_.Name
    $screenContent = @"
import 'package:flutter/material.dart';

import '../expo_screen_shell.dart';

class $className extends StatelessWidget {
  const $className({super.key});

  @override
  Widget build(BuildContext context) {
    return const ExpoScreenShell(
      title: '$title',
      sourcePath: '$sourcePath',
    );
  }
}
"@

    Set-Content -Path (Join-Path $genDir $fileName) -Value $screenContent -Encoding utf8

    $routes += [pscustomobject]@{
      slug = $slug
      className = $className
      fileName = $fileName
      sourcePath = $sourcePath
    }
  }

Get-ChildItem $tabsDir -File -Filter *.tsx |
  Where-Object { $_.BaseName -ne '_layout' } |
  ForEach-Object {
    $base = $_.BaseName
    $slug = 'tab-' + $base
    $className = (To-PascalCase $slug) + 'Screen'
    $fileName = To-FileName $slug
    $title = 'tabs ' + ($base -replace '-', ' ')
    $sourcePath = 'app/(tabs)/' + $_.Name
    $screenContent = @"
import 'package:flutter/material.dart';

import '../expo_screen_shell.dart';

class $className extends StatelessWidget {
  const $className({super.key});

  @override
  Widget build(BuildContext context) {
    return const ExpoScreenShell(
      title: '$title',
      sourcePath: '$sourcePath',
    );
  }
}
"@

    Set-Content -Path (Join-Path $genDir $fileName) -Value $screenContent -Encoding utf8

    $routes += [pscustomobject]@{
      slug = $slug
      className = $className
      fileName = $fileName
      sourcePath = $sourcePath
    }
  }

$routes = $routes | Sort-Object slug

$exports = ($routes | ForEach-Object { "export 'generated/$($_.fileName)';" }) -join "`n"
Set-Content -Path (Join-Path $libRoot 'screens\generated_screens.dart') -Value ($exports + "`n") -Encoding utf8

$imports = ($routes | ForEach-Object { "import 'generated/$($_.fileName)';" }) -join "`n"
$listEntries = ($routes | ForEach-Object { "  ExpoRouteMeta(route: '/$($_.slug)', title: '$($_.slug)', sourcePath: '$($_.sourcePath)')," }) -join "`n"
$mapEntries = ($routes | ForEach-Object { "  '/$($_.slug)': (context) => const $($_.className)()," }) -join "`n"

$routeRegistry = @"
import 'package:flutter/widgets.dart';

$imports

class ExpoRouteMeta {
  const ExpoRouteMeta({
    required this.route,
    required this.title,
    required this.sourcePath,
  });

  final String route;
  final String title;
  final String sourcePath;
}

const List<ExpoRouteMeta> expoConvertedRoutes = [
$listEntries
];

final Map<String, WidgetBuilder> convertedRouteBuilders = {
$mapEntries
};
"@

Set-Content -Path (Join-Path $libRoot 'screens\converted_routes.dart') -Value $routeRegistry -Encoding utf8

Write-Output ("Generated " + $routes.Count + " Flutter screens from Expo routes.")
