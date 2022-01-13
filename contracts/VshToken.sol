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

  uint256 public totalSupply;
  mapping(address => uint256) public balanceOf;

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


}