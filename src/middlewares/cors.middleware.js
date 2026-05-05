const cors = require('cors');

const corsOptions = {
    origin: 'https://localhost:5173', // localhost Front-End
    credentials: true
};

module.exports = cors(corsOptions);