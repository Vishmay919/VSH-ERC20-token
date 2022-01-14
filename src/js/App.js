App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    loading: false,
    tokenPrice: 1000000000000000,
    tokensSold: 0,
    tokensAvailable: 750000,
  
    init: function() {
      console.log("App initialized...")
      return App.initWeb3();
    },
  
    initWeb3:async function() {
        if (window.ethereum) {
            // Modern DApp browsers
            web3 = new Web3(window.ethereum);
            await window.ethereum.enable();
            
          } 
        else if (window.web3) {
            // Legacy dapp browsers
            web3 = new Web3(window.web3.currentProvider);
          } 
        else {
            // Non-dapp browsers
            console.log("Non-Ethereum browser detected. You should consider trying MetaMask!");
        }
        App.web3Provider = web3.currentProvider
        return App.initContracts();
    },
  
    initContracts: function() {
      $.getJSON("VshTokenSale.json", function(VshTokenSale) {
        App.contracts.VshTokenSale = TruffleContract(VshTokenSale);
        App.contracts.VshTokenSale.setProvider(App.web3Provider);
        App.contracts.VshTokenSale.deployed().then(function(VshTokenSale) {
          console.log("Dapp Token Sale Address:", VshTokenSale.address);
        });
      }).done(function() {
        $.getJSON("VshToken.json", function(VshToken) {
          App.contracts.VshToken = TruffleContract(VshToken);
          App.contracts.VshToken.setProvider(App.web3Provider);
          App.contracts.VshToken.deployed().then(function(VshToken) {
            console.log("Dapp Token Address:", VshToken.address);
          });
  
          App.listenForEvents();
          return App.render();
        });
      })
    },
  
    // Listen for events emitted by the contract
    listenForEvents: function() {
      App.contracts.VshTokenSale.deployed().then(function(instance) {
        instance.Sell({}, {
          fromBlock: 0,
          toBlock: 'latest',
        }).watch(function(error, event) {
          console.log("event triggered", event);
          App.render();
        })
      })
    },
  
    render: function() {
      if (App.loading) {
        return;
      }
      App.loading = true;
  
      var loader  = $('#loader');
      var content = $('#content');
  
      loader.show();
      content.hide();
  
      // Load account data
      web3.eth.getAccounts((err,result)=>{
          if(!err){
            App.account = result[0];
            $('#accountAddress').html("Your Account: " + App.account);
            console.log("Selected: " + result);
          }else{
              console.log("error occured")
          }

      }) 
  
      // Load token sale contract
      App.contracts.VshTokenSale.deployed().then(function(instance) {
        VshTokenSaleInstance = instance;
        return VshTokenSaleInstance.tokenPrice();
      }).then(function(tokenPrice) {
        App.tokenPrice = tokenPrice;
        $('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());
        return VshTokenSaleInstance.tokenSold();
      }).then(function(tokensSold) {
        App.tokensSold = tokensSold.toNumber();
        $('.tokens-sold').html(App.tokensSold);
        $('.tokens-available').html(App.tokensAvailable);
  
        var progressPercent = (Math.ceil(App.tokensSold) / App.tokensAvailable) * 100;
        $('#progress').css('width', progressPercent + '%');
  
        // Load token contract
        App.contracts.VshToken.deployed().then(function(instance) {
          VshTokenInstance = instance;
          return VshTokenInstance.balanceOf(App.account);
        }).then(function(balance) {
          $('.Vsh-balance').html(balance.toNumber());
          App.loading = false;
          loader.hide();
          content.show();
        })
      });
    },
  
    buyTokens: function() {
      $('#content').hide();
      $('#loader').show();
      var numberOfTokens = $('#numberOfTokens').val();
      App.contracts.VshTokenSale.deployed().then(function(instance) {
        return instance.buyTokens(numberOfTokens, {
          from: App.account,
          value: numberOfTokens * App.tokenPrice,
          gas: 500000 // Gas limit
        });
      }).then(function(result) {
        console.log("Tokens bought...")
        $('form').trigger('reset') // reset number of tokens in form
        // Wait for Sell event
      });
    }
  }
  
  $(function() {
    $(window).load(function() {
      App.init();
    })
  });