const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Replace these with your own credentials
const CLIENT_ID = '496270c1-efb7-474b-9347-72444566044f'; // Get from HubSpot App Settings
const CLIENT_SECRET = '0a6fdfff-a6dd-42c7-ba59-d0ada0af1473'; // Get from HubSpot App Settings
const REDIRECT_URI = 'http://localhost:3000/oauth/callback'; // Same as HubSpot redirect URL

let accessToken = ''; // To store the access token after OAuth login

// Step 1: Handle OAuth Redirect
app.get('/oauth/callback', async (req, res) => {
  const authCode = req.query.code;

  try {
    // Step 2: Exchange auth code for access token
    const response = await axios.post('https://api.hubapi.com/oauth/v1/token', null, {
      params: {
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code: authCode,
      },
    });

    // Save the access token
    accessToken = response.data.access_token;
    console.log('Access Token:', accessToken);

    res.send('HubSpot OAuth successful! You can now use the API.');
  } catch (error) {
    console.error('Error exchanging code for token:', error.response.data);
    res.send('Error during OAuth process.');
  }
});

// Step 3: Handle Webhooks
app.post('/webhooks', async (req, res) => {
  console.log('Webhook received:', req.body);

  // Example: Send this webhook event to Slack
  const slackWebhookURL = 'https://slack.com/api/chat.postMessage'; // Replace with your Slack webhook URL
  const slackToken = 'YOUR_SLACK_BOT_TOKEN'; // Replace with your Slack Bot Token
  const slackChannel = 'YOUR_CHANNEL_ID'; // Replace with your Slack Channel ID

  try {
    await axios.post(
      slackWebhookURL,
      {
        channel: slackChannel,
        text: `HubSpot Event: ${JSON.stringify(req.body)}`,
      },
      {
        headers: {
          Authorization: `Bearer ${slackToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.sendStatus(200); // Respond to HubSpot
  } catch (error) {
    console.error('Error sending to Slack:', error.response.data);
    res.sendStatus(500);
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
