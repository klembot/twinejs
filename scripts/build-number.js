/*
This exports a value, not a function, so that it stays consistent across an
entire build process.
*/

const moment = require('moment');

module.exports = moment().format('YYYYMMDDHHmm');
