// middleware/webhookAuth.js
// Cloud providers (CloudWatch/SNS, Azure Monitor action groups, etc.) can't
// log in and get a JWT — they authenticate with a pre-shared secret instead.
module.exports = (req, res, next) => {
  const secret = req.headers['x-webhook-secret'];
  if (!secret || secret !== process.env.WEBHOOK_SECRET) {
    return res.status(401).json({ message: 'Invalid webhook secret' });
  }
  next();
};