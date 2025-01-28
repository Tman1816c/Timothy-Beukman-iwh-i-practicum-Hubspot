require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Variable to store custom object schema ID
let customObjectId = null;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// HubSpot API configuration
const hubspotClient = axios.create({
  baseURL: 'https://api.hubapi.com',
  headers: {
    'Authorization': `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Routes
app.get('/', async (req, res) => {
  try {
    if (!customObjectId) {
      res.status(400).send('Custom object schema not found. Please ensure you have created a custom object schema named "Car" in your HubSpot account with properties: name, description, and category.');
      return;
    }
    const response = await hubspotClient.post(`/crm/v3/objects/${customObjectId}/search`, {
      filterGroups: [],
      sorts: [{
        propertyName: "createdate",
        direction: "DESCENDING"
      }],
      properties: ['name', 'description', 'category', 'createDate'],
      limit: 100
    });
    
    res.render('homepage', { 
      title: 'HubSpot Integration | Integrating With HubSpot I Practicum',
      records: response.data.results || []
    });
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).send(`Error fetching records: ${error.message}`);
  }
});

app.get('/update-cobj', (req, res) => {
  res.render('updates', { 
    title: 'Update Custom Object Form | Integrating With HubSpot I Practicum'
  });
});

app.post('/update-cobj', async (req, res) => {
  try {
    const { name, description, category } = req.body;
    
    if (!customObjectId) {
      throw new Error('Custom object ID not initialized');
    }
    const response = await hubspotClient.post(`/crm/v3/objects/${customObjectId}`, {
      properties: {
        name,
        description,
        category
      }
    });

    res.redirect('/');
  } catch (error) {
    console.error('Error creating record:', error);
    res.status(500).send('Error creating record');
  }
});

// Function to fetch custom object schema ID
async function fetchCustomObjectId() {
  try {
    customObjectId = '2-138621668';
    console.log('Using Car custom object schema with ID:', customObjectId);
  } catch (error) {
    console.error('Error initializing custom object ID:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.data);
    }
  }
}

// Start server and initialize
app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);
  await fetchCustomObjectId();
});