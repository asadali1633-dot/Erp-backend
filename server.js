require("dotenv").config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require("body-parser");
const routers = require('./routes/router');
const tenantDbMiddleware  = require('./middlewares/tenantDbMiddleware');
const path = require('path');


// app.use(cors());
app.use(cors({
  origin: ["http://localhost:3000","https://software.itrackspace.com"],   
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(routers)


const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
