"use strict";

var dnsPacket = _interopRequireWildcard(require("@leichtgewicht/dns-packet"), true);
var _net = require("net");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
let response = null;
let expectedLength = 0;
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
const buf = dnsPacket.streamEncode({
  type: 'query',
  id: getRandomInt(1, 65534),
  flags: dnsPacket.RECURSION_DESIRED,
  questions: [{
    type: 'A',
    name: 'google.com'
  }]
});
const client = new _net.Socket();
client.connect(53, '8.8.8.8', function () {
  console.log('Connected');
  client.write(buf);
});
client.on('data', function (data) {
  console.log('Received response: %d bytes', data.byteLength);
  if (response == null) {
    if (data.byteLength > 1) {
      const plen = data.readUInt16BE(0);
      expectedLength = plen;
      if (plen < 12) {
        throw new Error('below DNS minimum packet length');
      }
      response = Buffer.from(data);
    }
  } else {
    response = Buffer.concat([response, data]);
  }
  if (response.byteLength >= expectedLength) {
    console.log(dnsPacket.streamDecode(response));
    client.destroy();
  }
});
client.on('close', function () {
  console.log('Connection closed');
});