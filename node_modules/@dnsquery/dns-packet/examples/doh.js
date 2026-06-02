"use strict";

var dnsPacket = _interopRequireWildcard(require("@leichtgewicht/dns-packet"), true);
var _https = require("https");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/*
 * Sample code to make DNS over HTTPS request using POST
 * AUTHOR: Tom Pusateri <pusateri@bangj.com>
 * DATE: March 17, 2018
 * LICENSE: MIT
 */

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
const buf = dnsPacket.encode({
  type: 'query',
  id: getRandomInt(1, 65534),
  flags: dnsPacket.RECURSION_DESIRED,
  questions: [{
    type: 'A',
    name: 'google.com'
  }]
});
const options = {
  hostname: 'dns.google',
  port: 443,
  path: '/dns-query',
  method: 'POST',
  headers: {
    'Content-Type': 'application/dns-message',
    'Content-Length': Buffer.byteLength(buf)
  }
};
const request = _https.request(options, response => {
  console.log('statusCode:', response.statusCode);
  console.log('headers:', response.headers);
  response.on('data', d => {
    console.log(dnsPacket.decode(d));
  });
});
request.on('error', e => {
  console.error(e);
});
request.write(buf);
request.end();