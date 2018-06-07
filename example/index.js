const config = require('../src');

config.load(__dirname, {specialItems: ['OBJECT__EMPTY']});

console.log(config.default);
