export default async function handler(req, res) {
    if (req.method === 'POST') {
      try {
        const deployId = process.env.VERCEL_DEPLOY_ID;
    
        if (!deployId) {
          return res.status(500).json({ error: 'Vercel deploy ID not found in environment variables' });
        }
    
        const url = `https://api.vercel.com/v1/integrations/deploy/${deployId}`;
    
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
    
        if (response.ok) {
          return res.status(200).json({ message: 'Redeploy triggered successfully!' });
        } else {
          return res.status(500).json({ error: 'Failed to trigger redeploy' });
        }
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    } else {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
  }
  