module.exports = {
  apps : [
      { name: "gateway", script: 'src/services/gateway.js'},
      { name: "registry", script: 'src/services/registry.js'},
      { name: "deriver", script: 'src/services/deriver.js' }
  ]
};
