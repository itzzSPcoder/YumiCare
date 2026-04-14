import 'dart:ui' as ui;

import 'package:flutter/material.dart';

import 'yolo_models.dart';

class YoloOverlayPainter extends CustomPainter {
  YoloOverlayPainter({
    required this.detections,
    required this.imageWidth,
    required this.imageHeight,
  });

  final List<Detection> detections;
  final int imageWidth;
  final int imageHeight;

  static const _palette = <Color>[
    Color(0xFFE11D48),
    Color(0xFF0EA5E9),
    Color(0xFF10B981),
    Color(0xFFF59E0B),
  ];

  @override
  void paint(Canvas canvas, Size size) {
    if (imageWidth <= 0 || imageHeight <= 0) return;

    final scaleX = size.width / imageWidth;
    final scaleY = size.height / imageHeight;

    for (final det in detections) {
      final color = _palette[det.classId % _palette.length];
      final rect = Rect.fromLTRB(
        det.x1 * scaleX,
        det.y1 * scaleY,
        det.x2 * scaleX,
        det.y2 * scaleY,
      );

      final boxPaint = Paint()
        ..color = color
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.0;

      canvas.drawRect(rect, boxPaint);

      final label = '${det.className} ${(det.score * 100).toStringAsFixed(1)}%';
      final textSpan = TextSpan(
        text: label,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 11,
          fontWeight: FontWeight.w600,
        ),
      );

      final tp = TextPainter(text: textSpan, textDirection: ui.TextDirection.ltr)
        ..layout(maxWidth: size.width);

      final labelBg = Rect.fromLTWH(
        rect.left,
        (rect.top - tp.height - 4).clamp(0.0, size.height - tp.height - 4),
        tp.width + 8,
        tp.height + 4,
      );

      final bgPaint = Paint()
        ..color = color.withOpacity(0.92)
        ..style = PaintingStyle.fill;

      canvas.drawRect(labelBg, bgPaint);
      tp.paint(canvas, Offset(labelBg.left + 4, labelBg.top + 2));
    }
  }

  @override
  bool shouldRepaint(covariant YoloOverlayPainter oldDelegate) {
    return oldDelegate.detections != detections ||
        oldDelegate.imageWidth != imageWidth ||
        oldDelegate.imageHeight != imageHeight;
  }
}
