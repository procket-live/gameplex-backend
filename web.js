String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

const http = require('http');
const app = require('./app');

const port = process.env.PORT || 3001;

const server = http.createServer(app);

server.listen(port);
