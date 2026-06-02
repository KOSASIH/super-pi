"use strict";

var dnsPacket = _interopRequireWildcard(require("@leichtgewicht/dns-packet"), true);
var _dgram = require("dgram");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const socket = _dgram.createSocket('udp4');
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
socket.on('message', function (message, rinfo) {
  console.log(rinfo);
  console.log(dnsPacket.decode(message)); // prints out a response from google dns
  socket.close();
});
socket.send(buf, 0, buf.length, 53, '8.8.8.8');