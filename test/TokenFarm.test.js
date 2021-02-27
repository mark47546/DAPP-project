const { assert } = require('chai')
const { contracts_build_directory } = require('../truffle-config')

const TokenFarm = artifacts.require("TokenFarm")
const DaiToken = artifacts.require("DaiToken")
const DappToken = artifacts.require("DappToken")

require('chai')
    .use(require('chai-as-promised'))
    .should()

function tokens(n){
    return web3.utils.toWei(n,'Ether')
}

contract('TokenFarm',([owner,investor])=>{
    let daiToken, dappToken, tokenFarm

    before(async()=>{
        //Load Contracts
        daiToken = await DaiToken.new()
        dappToken = await DappToken.new()
        tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address)

        //Transfer all Dapp tokens to farm
        await dappToken.transfer(tokenFarm.address, tokens('1000000') )
        //sends Token to investor
        await daiToken.transfer(investor, tokens('100'), {from: owner} )
    })
    describe('Mock Dai deployment', async() => {
        it('has a name',async() => {
            const name = await daiToken.name()
            assert.equal(name,'Mock DAI Token')
        })
    })
    describe('Dapp Token deployment', async() => {
        it('has a name',async() => {
            const name = await dappToken.name()
            assert.equal(name,'DApp Token')
        })
    })
    describe('Token Farm deployment', async() => {
        it('has a name',async() => {
            const name = await tokenFarm.name()
            assert.equal(name,'Dapp Token Farm')
        })
        it('Contract has tokens', async() => {
            let balance = await dappToken.balanceOf(tokenFarm.address)
            assert.equal(balance.toString(),tokens('1000000'))
        })
    })
    describe('Farming Tokens', async()=>{
        it('rewards investors for staking mDai tokens',async()=>{
            let result
            //check investor's balance before staking
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(),tokens('100'),'investor Mock DAI wallet balance before staking')
            //stake Mock Dai Tokens
            await daiToken.approve (tokenFarm.address, tokens('100'),{from: investor})
            await tokenFarm.stakeTokens(tokens('100'),{from:investor })
            //check staking result
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(),tokens('0'),'investor Mock DAI wallet balance after staking')

            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(),tokens('100'),'Token Farm Mock DAI balance correct after staking')

            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(),tokens('100'),'investor staking balance correct after staking')

            result = await tokenFarm.isStaking(investor)
            assert.equal(result.toString(),'true','investor staking status correct after staking')
            
            //Issue Token
            await tokenFarm.issueTokens({from:owner})
            //check balance after issurance 
            result = await dappToken.balanceOf(investor)
            assert.equal(result.toString(),tokens('100'),'investor Dapp Token wallet balance correct after issurance')
            //check that only the owner can call function
            await tokenFarm.issueTokens({from: investor}).should.be.rejected;
            
            //Unstake token
            await tokenFarm.unstakeTokens({from:investor})
            //check result after unstaking 
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'),'investor Mock DAI wallet balance correct after staking')

            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(), tokens('0'),'Token from Mock DAI balance correct after staking')

            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(), tokens('0'),'investor staking balance correct after staking')

            result = await tokenFarm.isStaking(investor)
            assert.equal(result.toString(), 'false','investor staking status correct after staking')
        })
    })
}) 