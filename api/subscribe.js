// api/subscribe.js
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { email, name, tag } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Email required' });

  // TODO: Connect to Mailchimp/ConvertKit/Airtable/Firestore.
  console.log('New subscriber:', { email, name, tag });
  res.json({ ok: true });
};
