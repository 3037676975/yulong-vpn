var exec = require('cordova/exec');

function call(action, args) {
  return new Promise(function(resolve, reject) {
    exec(resolve, reject, 'YulongVPN', action, args || []);
  });
}

module.exports = {
  api: function(method, path, body) {
    return call('api', [method, path, body || {}]);
  },
  startVpn: function(node) {
    return call('startVpn', [node || {}]);
  },
  stopVpn: function() {
    return call('stopVpn', []);
  },
  state: function() {
    return call('state', []);
  }
};
