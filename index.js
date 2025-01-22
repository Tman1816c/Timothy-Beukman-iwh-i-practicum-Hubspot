const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

const app = express();

// Set up middleware to parse POST data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up Pug as the templating engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Load environment variables from .env file
dotenv.config();

// * DO NOT INCLUDE the private app access token in your repo.
const PRIVATE_APP_ACCESS = ''; // Ensure this is loaded from .env or environment variables

// Homepage Route ("/")
app.get('/', async (req, res) => {
    // Sample static CRM data for now (replace with API data later)
    const crmData = [
        { name: 'Jumbo', description: 'A majestic elephant', category: 'Elephant' },
        { name: 'Ezra', description: 'A playful cat', category: 'Cat' },
        { name: 'Snoopy', description: 'A friendly labrador', category: 'Labrador' },
    ];

    res.render('homepage', { title: 'Homepage | Integrating With HubSpot I Practicum', crmData });
});

// Route to display form for creating a custom object ("/update-cobj")
app.get('/update-cobj', (req, res) => {
    res.render('updates', { title: 'Update Custom Object Form | Integrating With HubSpot I Practicum' });
});

// Route to handle form submission and create new CRM record ("/update-cobj")
app.post('/update-cobj', async (req, res) => {
    const { name, description, category } = req.body;
    
    try {
        // Replace with the actual API call to create a custom object
        await axios.post('https://api.hubapi.com/crm/v3/objects/Pets', {
            properties: {
                name,
                description,
                category
            },
            headers: {
                'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}`
            }
        });
        res.redirect('/');
    } catch (error) {
        console.error('Error creating custom object:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});