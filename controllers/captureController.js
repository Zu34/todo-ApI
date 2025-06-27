const Capture = require('../models/Capture');

function autoDetectType(title = '', content = '') {
  const full = `${title} ${content}`.trim();
  const length = full.length;
  const wordCount = full.split(/\s+/).length;

  const taskKeywords = ['todo', 'fix', 'call', 'email', 'submit', 'buy', 'complete', 'check', 'send'];

  const isTask = taskKeywords.some(keyword =>
    full.toLowerCase().includes(keyword)
  );

  if (length < 100 && !title) return 'thought';
  if (isTask && wordCount < 50) return 'task';
  if (wordCount <= 300) return 'note';
  if (wordCount <= 800) return 'blog';
  return 'essay';
}
exports.getCaptureStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const counts = await Capture.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const summary = {
      thought: 0,
      task: 0,
      note: 0,
      blog: 0,
      essay: 0,
      total: 0
    };

    counts.forEach(item => {
      summary[item._id] = item.count;
      summary.total += item.count;
    });

    res.json(summary);
  } catch (err) {
    next(err);
  }
};
