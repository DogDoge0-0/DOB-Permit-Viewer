const express = require('express');
const axios = require('axios');
const core = require('@actions/core');

const app = express();
const port = 3000; // Choose the desired port number

app.get('/api/data', async (req, res) => {
  try {
    const apiKey = core.getInput('NYC_GEOSERVICE_API_KEY');
    const apiUrl = 'https://geoservice.planning.nyc.gov/geoservice/geoservice.svc/Function_BBL';

    const { borough, block, lot } = req.query;

    // Make a request to the external API using the secret and dynamic parameters
    const response = await axios.get(apiUrl, {
      params: {
        Borough: borough,
        Block: block,
        Lot: lot,
        key: apiKey
      }
    });

    // Return the API response to the client-side
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
