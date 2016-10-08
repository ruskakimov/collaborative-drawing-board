var express = require('express');

var app = express();
var server = app.listen(3001);
app.use(express.static('public'));
