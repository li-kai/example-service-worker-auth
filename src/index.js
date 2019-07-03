const path = require('path');
const express = require('express');
const app = express();

const publicFolder = path.resolve(__dirname, '../public');
app.use(express.static(publicFolder));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}!`));
