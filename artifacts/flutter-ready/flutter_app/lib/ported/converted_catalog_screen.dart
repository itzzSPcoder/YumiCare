import 'package:flutter/material.dart';

import '../screens/converted_routes.dart';

class ConvertedCatalogScreen extends StatelessWidget {
  const ConvertedCatalogScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final routes = [...expoConvertedRoutes]
      ..sort((a, b) => a.route.compareTo(b.route));

    return Scaffold(
      appBar: AppBar(title: const Text('Converted Expo Route Catalog')),
      body: ListView.separated(
        itemCount: routes.length,
        separatorBuilder: (_, __) => const Divider(height: 1),
        itemBuilder: (context, index) {
          final route = routes[index];
          return ListTile(
            title: Text(route.title),
            subtitle: Text(route.sourcePath),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => Navigator.of(context).pushNamed(route.route),
          );
        },
      ),
    );
  }
}
