var VshToken = artifacts.require("./VshToken.sol");


contract("VshToken",function(accounts){
    var tokenInstance;

    it("initialises contract with correct values",function(){
        return VshToken.deployed().then(function(instance){
        tokenInstance = instance;
        return tokenInstance.name()
        }).then(function(name){
            assert.equal(name,"Vsh Token","has the correct name");
            return tokenInstance.symbol()
        }).then(function(symbol){
            assert.equal(symbol,"VSH","has the correct symbol")
            return tokenInstance.standard()
        }).then(function(standard){
            assert.equal(standard,"Vsh token v0.1","has the correct standard")
        })
    });


    it("Allocates the initial supply",function(){
        return VshToken.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(function(totalSupply){
            assert.equal(totalSupply.toNumber(),1000000,"sets totalSupply to 1000000")
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function(adminBalance){
            assert.equal(adminBalance.toNumber(),1000000,"Initial supply allocated to admin")
        })
    });

    it("transfers token ownership",()=>{
        return VshToken.deployed().then(function(instance){
        tokenInstance = instance;
        return tokenInstance.transfer.call(accounts[0],999999999999);
        }).then(assert.fail).catch((error)=>{
            assert(error.message.indexOf('revert') >= 0,"error msg must contain revert");
            return tokenInstance.transfer.call(accounts[1],250000,{from :accounts[0]})
        }).then((success)=>{
            assert.equal(success,true, "returns true after transaction");
            return tokenInstance.transfer(accounts[1],250000,{from: accounts[0]});
        }).then((receipt)=>{
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
            assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the account the tokens are transferred from');
            assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the account the tokens are transferred to');
            assert.equal(receipt.logs[0].args._value, 250000, 'logs the transfer amount');
            return tokenInstance.balanceOf(accounts[1]);
        }).then((bal)=>{
            assert.equal(bal.toNumber(),250000, "transfers token to reciever");
            return tokenInstance.balanceOf(accounts[0])
        }).then((bal)=>{
            assert.equal(bal,750000,"deducts the amount from sender")
        })
    })
    
})