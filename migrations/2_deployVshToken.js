const VshToken = artifacts.require("VshToken");

module.exports = function (deployer) {
  deployer.deploy(VshToken,1000000);
};
