import 'dart:math' as math;

class Detection {
  final double x1;
  final double y1;
  final double x2;
  final double y2;
  final double score;
  final int classId;
  final String className;

  const Detection({
    required this.x1,
    required this.y1,
    required this.x2,
    required this.y2,
    required this.score,
    required this.classId,
    required this.className,
  });

  double get width => (x2 - x1).clamp(0.0, double.infinity);
  double get height => (y2 - y1).clamp(0.0, double.infinity);
  double get area => width * height;

  Detection clampToImage(int imageWidth, int imageHeight) {
    return Detection(
      x1: x1.clamp(0.0, imageWidth.toDouble()),
      y1: y1.clamp(0.0, imageHeight.toDouble()),
      x2: x2.clamp(0.0, imageWidth.toDouble()),
      y2: y2.clamp(0.0, imageHeight.toDouble()),
      score: score,
      classId: classId,
      className: className,
    );
  }
}

double iou(Detection a, Detection b) {
  final interX1 = math.max(a.x1, b.x1);
  final interY1 = math.max(a.y1, b.y1);
  final interX2 = math.min(a.x2, b.x2);
  final interY2 = math.min(a.y2, b.y2);

  final interW = math.max(0.0, interX2 - interX1);
  final interH = math.max(0.0, interY2 - interY1);
  final interArea = interW * interH;

  if (interArea <= 0) return 0.0;
  final unionArea = a.area + b.area - interArea;
  if (unionArea <= 0) return 0.0;
  return interArea / unionArea;
}

List<Detection> nms(
  List<Detection> detections, {
  double iouThreshold = 0.45,
}) {
  final byScore = [...detections]..sort((a, b) => b.score.compareTo(a.score));
  final keep = <Detection>[];

  while (byScore.isNotEmpty) {
    final best = byScore.removeAt(0);
    keep.add(best);
    byScore.removeWhere(
        (d) => d.classId == best.classId && iou(d, best) > iouThreshold);
  }

  return keep;
}
