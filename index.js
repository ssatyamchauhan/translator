require("dotenv").config();
const express = require("express");
const bodyParser = require('body-parser');
const cors = require("cors");
const morgan = require('morgan');
const Mongodb = require("./library/mongodb");

const app = express()
const PORT = process.env.PORT || 6000;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('dev'));

Mongodb().then((db) => {
    

    db.collections("")





}).catch((error) => { console.error('Error Connecting Mongodb', error) })

let route = require('./routes');
app.use('/v1', route.apiRoutes);

app.listen(PORT, () => {
    console.info("You App is listening", `http://localhost:${PORT}`)
})