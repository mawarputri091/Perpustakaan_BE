const cors = require('cors');

const corsOptions = {
    origin: [
        'http://localhost:5173',        // frontend di laptop yang sama
        'http://192.168.1.6:5173',      // GANTI dengan IP FRONTEND nanti!
    ],
    credentials: true,
    optionsSuccessStatus: 200
};

module.exports = cors(corsOptions);