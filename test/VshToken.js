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
    });

    it("approves token for delegated transfer",()=>{
        return VshToken.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.approve.call(accounts[1],100);
        }).then((success)=>{
            assert.equal(success,true,"it returns true");
            return tokenInstance.approve(accounts[1],100,{from: accounts[0]});
        }).then((receipt)=>{
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Approve', 'should be the "Approval" event');
            assert.equal(receipt.logs[0].args._owner, accounts[0], 'logs the account the tokens are authorized by');
            assert.equal(receipt.logs[0].args._spender, accounts[1], 'logs the account the tokens are authorized to');
            assert.equal(receipt.logs[0].args._value, 100, 'logs the transfer amount');
            return tokenInstance.allowance(accounts[0], accounts[1]);
        }).then((allowance)=>{
            assert.equal(allowance.toNumber(),100,"stores the allowance for delegated transfer");
        })
    });

    it("handles delegated transfer",()=>{
        return VshToken.deployed().then(function(instance){
            tokenInstance = instance;
            fromAccount = accounts[2];
            toAccount = accounts[3];
            spendingAccount = accounts[4]
            //transferring some tokens to from account
            return tokenInstance.transfer(fromAccount,100,{from: accounts[0]});
    }).then((receipt)=>{
        //approve spendingAccount to spend 10 tokens from FromAccount
        return tokenInstance.approve(spendingAccount,10,{from: fromAccount})
    }).then(()=>{
        //transfer token more than that in spender account
        return tokenInstance.transferFrom(fromAccount,toAccount,999,{from : spendingAccount});
    }).then(assert.fail).catch((error)=>{
        assert(error.message.indexOf('revert') >=0,"cannot transfer more than balance");
        //try spending more tokens than the approved amount
        return tokenInstance.transferFrom(fromAccount, toAccount,20,{from: spendingAccount})
    }).then(assert.fail).catch((error)=>{
        assert(error.message.indexOf('revert') >=0,"cannot transfer more than approved balance");
        return tokenInstance.transferFrom.call(fromAccount,toAccount,10,{from: spendingAccount})
    }).then((success)=>{
        assert.equal(success,true,"it returns true")
        return tokenInstance.transferFrom(fromAccount,toAccount,10,{from: spendingAccount});
    }).then((receipt)=>{
        assert.equal(receipt.logs.length, 1, 'triggers one event');
        assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
        assert.equal(receipt.logs[0].args._from, fromAccount, 'logs the account the tokens are transferred from');
        assert.equal(receipt.logs[0].args._to, toAccount, 'logs the account the tokens are transferred to');
        assert.equal(receipt.logs[0].args._value, 10, 'logs the transfer amount');
        return tokenInstance.balanceOf(fromAccount)
    }).then((bal)=>{
        assert.equal(bal.toNumber(),90,"deducts balance from sending account")
        return tokenInstance.balanceOf(toAccount)
    }).then((bal)=>{
        assert.equal(bal.toNumber(),10,"adds balance to _to account")
        return tokenInstance.allowance(fromAccount,spendingAccount)
    }).then((bal)=>{
        assert.equal(bal.toNumber(),0,"deducts amount from allowance")
    })
})
    
})