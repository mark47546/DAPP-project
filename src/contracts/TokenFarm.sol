// SPDX-License-Identifier: MIT
pragma solidity ^0.7.4;
import "./DappToken.sol";
import "./DaiToken.sol";

contract TokenFarm{
    string public name = 'Dapp Token Farm';
    address public owner;
    DappToken public dappToken;
    DaiToken public daiToken;

    address[] public stakers;
    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;
    constructor(DappToken _dappToken, DaiToken _daiToken) public {
        dappToken = _dappToken;
        daiToken = _daiToken;
        owner = msg.sender;
    }

    //Stakes Tokens (Deposit)
    function stakeTokens(uint _amount) public{
        //require amount more than 0
        require(_amount>0,"amount can not be 0");
        //tranfers to this contract for staking
        daiToken.transferFrom(msg.sender, address(this), _amount);
        //update staking balance
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;
        if (!hasStaked[msg.sender]){
            stakers.push(msg.sender);
        }
        hasStaked[msg.sender] = true;
        isStaking[msg.sender] = true;
    }
    //Unstaking Tokens (Withdraws)
    function unstakeTokens() public{
        uint balance = stakingBalance[msg.sender];
        require(balance>0,"staking balance can not be 0");
        daiToken.transfer(msg.sender, balance);
        stakingBalance[msg.sender] = 0;
        isStaking[msg.sender] = false;
    }

    //Issuing Tokens
    function issueTokens() public{
        //only owner can all this function
        require(msg.sender == owner, "caller must be the owner");
        for (uint i=0; i<stakers.length; i++){
            address recipient = stakers[i];
            uint balance = stakingBalance[recipient];
            if (balance>0){
                dappToken.transfer(recipient, balance);
            }
        }
    }
}