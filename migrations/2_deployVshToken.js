const VshToken = artifacts.require("./VshToken.sol");
const VshTokenSale = artifacts.require("./VshTokenSale.sol");

module.exports = function (deployer) {
  deployer.deploy(VshToken,1000000).then(()=>{
    var tokenPrice = 1000000000000000;
    return deployer.deploy(VshTokenSale,VshToken.address,tokenPrice);
  });
  
  
};
