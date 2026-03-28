const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 30, checkperiod: 10 });

module.exports = cache;
