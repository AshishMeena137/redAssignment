// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract BuyToken{
    IERC20 public token;
    uint256 public tokenPrice;

    constructor(address _tokenAddress,uint256 _tokenPrice){
      token = IERC20(_tokenAddress);
      tokenPrice = _tokenPrice;
    }

    function buyToken(uint256 _numberOfTokens)public payable {
      require(_numberOfTokens >0 ,"amount cannot be less than 0");
      uint256 totalAmount = (_numberOfTokens*tokenPrice)/10**18;

      require(msg.value >= totalAmount, "Invalid amount of ether sent");
      require(token.balanceOf(address(this)) >= _numberOfTokens, "Insufficient tokens in contract");
      require(token.transfer(msg.sender, _numberOfTokens), "Token transfer failed");
    }
}