// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VshToken {

  string public name = "Vsh Token";
  string public symbol = "VSH";
  string public standard = "Vsh token v0.1";

  event Transfer(
      address indexed _from,
      address indexed _to,
      uint256 _value
  );

  event Approve(
      address indexed _owner,
      address indexed _spender,
      uint256 _value
  );

  uint256 public totalSupply;
  mapping(address => uint256) public balanceOf;
  //Account A approves acount B,C,D.. to spend value
  mapping(address => mapping(address => uint256)) public allowance;


  constructor(uint256 _initialSupply) {
    balanceOf[msg.sender] = _initialSupply;
    totalSupply = _initialSupply;
  }

    function transfer(address _to, uint256 _value) public returns(bool){
      require(balanceOf[msg.sender] >= _value);

      balanceOf[msg.sender] -= _value;
      balanceOf[_to] += _value;

      emit Transfer(msg.sender, _to, _value);

      return true;
      
    }

    function approve(address _spender, uint256 _value) public returns(bool){
        allowance[msg.sender][_spender] = _value;
        emit Approve(msg.sender,_spender,_value);
        return true;
    }

    function transferFrom(address _from,address _to,uint256 _value) public returns(bool){
        require(_value <= balanceOf[_from]);
        require(_value <= allowance[_from][msg.sender]);

        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;

        allowance[_from][msg.sender] -= _value;

        emit Transfer(_from,_to, _value);
        return true;
    }



}