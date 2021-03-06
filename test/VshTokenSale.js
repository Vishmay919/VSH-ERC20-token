var VshTokenSale = artifacts.require("./VshTokenSale.sol");
var VshToken = artifacts.require("./VshToken.sol");


contract("VshTokenSale",(accounts)=>{
    var tokenInstance;
    var tokenSaleInstance;
    var tokenPrice = 1000000000000000; //0.001ETH
    var admin = accounts[0];
    var buyer = accounts[1];
    var tokensAvailable = 750000;
    var numberOfTokens;

    it("initialises contract with the correct values",()=>{
        return VshTokenSale.deployed().then((instance)=>{
            tokenSaleInstance = instance;
            return tokenSaleInstance.address;
        }).then((address)=>{
            assert.notEqual(address,0x0,"has a contract address")
            return tokenSaleInstance.tokenContract();
        }).then((address)=>{
            assert.notEqual(address,0x0,"has a token contract")
            return tokenSaleInstance.tokenPrice();
        }).then((price)=>{
            assert.equal(price,tokenPrice,"token price is correct")
        })
    })

    it('facilitates token buying', function() {
        return VshToken.deployed().then(function(instance) {
          // Grab token instance first
          tokenInstance = instance;
          return VshTokenSale.deployed();
        }).then(function(instance) {
          // Then grab token sale instance
          tokenSaleInstance = instance;
          // Provision 75% of all tokens to the token sale
          return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, { from: admin })
        }).then(function(receipt) {
          numberOfTokens = 10;
          return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: numberOfTokens * tokenPrice })
        }).then(function(receipt) {
          assert.equal(receipt.logs.length, 1, 'triggers one event');
          assert.equal(receipt.logs[0].event, 'Sell', 'should be the "Sell" event');
          assert.equal(receipt.logs[0].args._buyer, buyer, 'logs the account that purchased the tokens');
          assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'logs the number of tokens purchased');
          return tokenSaleInstance.tokenSold();
        }).then(function(amount) {
          assert.equal(amount.toNumber(), numberOfTokens, 'increments the number of tokens sold');
          return tokenInstance.balanceOf(buyer);
        }).then(function(balance) {
          assert.equal(balance.toNumber(), numberOfTokens);
          return tokenInstance.balanceOf(tokenSaleInstance.address);
        }).then(function(balance) {
          assert.equal(balance.toNumber(), tokensAvailable - numberOfTokens);
          // Try to buy tokens different from the ether value
          return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: 1 });
        }).then(assert.fail).catch(function(error) {
          assert(error.message.indexOf('revert') >= 0, 'msg.value must equal number of tokens in wei');
          return tokenSaleInstance.buyTokens(8000000, { from: buyer, value: numberOfTokens * tokenPrice })
        }).then(assert.fail).catch(function(error) {
          assert(error.message.indexOf('revert') >= 0, 'cannot purchase more tokens than available');
        });
      });

      it("ends the token ICO",()=>{
        return VshToken.deployed().then(function(instance) {
            // Grab token instance first
            tokenInstance = instance;
            return VshTokenSale.deployed();
          }).then(function(instance) {
            // Then grab token sale instance
            tokenSaleInstance = instance;
            // Try to end sale from account other than the admin
            return tokenSaleInstance.endSale({ from: buyer });
          }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert' >= 0, 'must be admin to end sale'));
            // End sale as admin
            return tokenSaleInstance.endSale({ from: admin });
          }).then(function(receipt) {
            return tokenInstance.balanceOf(admin);
          }).then(function(balance) {
            assert.equal(balance.toNumber(), 999990, 'returns all unsold dapp tokens to admin');
        //     return tokenSaleInstance.tokenPrice();
        //   }).then(price=>{
        //       assert.equal(price.toNumber(),0,"token price is reset to 0")
          })
        })

})