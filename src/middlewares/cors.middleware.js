const cors = require('cors');

const corsOptions = {
    origin: [
        'http://localhost:5173',        // frontend di laptop yang sama
        'http://10.134.199.17:5173',      // GANTI dengan IP FRONTEND nanti!
    ],
    credentials: true,
    optionsSuccessStatus: 200
};

module.exports = cors(corsOptions);