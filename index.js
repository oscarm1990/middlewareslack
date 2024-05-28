const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios'); // Include axios
const Buffer = require('buffer/').Buffer; // Use the global Buffer module

const app = express();
const PORT = process.env.PORT || 3000;

// Replace 'your_zendesk_subdomain' with your actual subdomain.
const ZENDESK_SUBDOMAIN = 'z3noscarmejiasv';
// Replace 'your_zendesk_email' with your actual Zendesk account email.
const ZENDESK_EMAIL = 'omejias@zendesk.com';
// Replace 'your_zendesk_api_token' with your actual API token.
const ZENDESK_API_TOKEN = 'do7Xbiv5gEDKQv99rVOKBLkYhQMxEwTpSbVly4Hv';

app.use(bodyParser.json());

// Base64 encode your email and API token for Zendesk authentication
const base64Credentials = Buffer.from(`${ZENDESK_EMAIL}/token:${ZENDESK_API_TOKEN}`).toString('base64');

app.post('/webhook', (req, res) => {
  const topicId = req.body.detail.topic_id; // Parsing topic_id from webhook payload
  const topicUrl = `https://${ZENDESK_SUBDOMAIN}.zendesk.com/api/v2/help_center/community/topics/${topicId}.json`;

  axios.get(topicUrl, {
    headers: {
      'Authorization': `Basic ${base64Credentials}`
    }
  })
  .then(response => {
    const topicName = response.data.topic.name; // Extract topic name from Zendesk API response
    const postTitle = req.body.event.title; // Extract post title from webhook payload

    const slackWebhookUrl = 'https://hooks.slack.com/services/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';
    const slackMessage = {
      text: `A new community post has been created for the topic "${topicName}" and the topic title is "${postTitle}"`
    };

    // Send a message to Slack
    axios.post(slackWebhookUrl, slackMessage)
      .then(slackResponse => {
        console.log('Message sent to Slack:', slackResponse.data);
      })
      .catch(slackError => {
        console.error('Error sending message to Slack:', slackError);
      });

    // Respond to the initial webhook
    res.status(200).json({ message: 'Webhook processed and Slack notification sent' });
  })
  .catch(error => {
    console.error('Error calling Zendesk API:', error);
    res.status(500).json({ message: 'Error processing webhook' });
  });
});

// GET route is ignored for this example, but still included
app.get("/apiqueries", (req, res) => {
  const queries = req.query;
  console.log('Received params:', req.query);
  res.send(queries);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});