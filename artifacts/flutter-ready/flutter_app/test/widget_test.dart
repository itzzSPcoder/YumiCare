import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:yumicare_flutter_yolo_demo/main.dart';

void main() {
  testWidgets('App loads login page', (WidgetTester tester) async {
    await tester.pumpWidget(const YumiCareYoloApp());

    await tester.pump();

    expect(find.byType(Scaffold), findsAtLeastNWidgets(1));
    expect(find.textContaining('YumiCare'), findsWidgets);
  });
}
