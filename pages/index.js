import { useState } from 'react';
import { ethers } from 'ethers';

import StakingContract from '../artifacts/contracts/staking.sol/Staking.json';
import TokenContract from '../artifacts/contracts/redToken.sol/TokenTest.json';
import BuyTokens from '../artifacts/contracts/buytoken.sol/BuyToken.json';

import Swal from 'sweetalert2';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [amountStake, setAmountStake] = useState('');
  const [amountUnstake, setAmountUstake] = useState('');
  const [stakeContract, setStakeContract] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [buyTokenContract, setBuyTokenContract] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [reward, setReward] = useState('')
  const [tokensToBuy, setTokensToBuy]=useState('');
  const tokenPrice = 0.02;
  const stakingContractAddress = process.env.NEXT_PUBLIC_STAKE_CONTRACT_ADDRESS;
  const tokenContractAddress = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS;
  const buyTokenContractAddress = process.env.NEXT_PUBLIC_BUY_CONTRACT_ADDRESS;

  async function connectWallet() {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const stakeContract = new ethers.Contract(
          stakingContractAddress,
          StakingContract.abi,
          signer
        );
        const tokenContract = new ethers.Contract(
          tokenContractAddress,
          TokenContract.abi,
          signer
        )
        const buyTokenContract = new ethers.Contract(
          buyTokenContractAddress,
          BuyTokens.abi,
          signer
        )
        const account = await signer.getAddress();
        setStakeContract(stakeContract);
        setTokenContract(tokenContract);
        setBuyTokenContract(buyTokenContract);
        setSigner(signer);
        setAccount(account);
      } catch (error) {
        console.error(error);
        //setMessageStaking('Failed to connect to the wallet');
        Swal.fire('Failed to connect to the wallet');
      }
    } else {
      //setMessageStaking('Please install MetaMask to use this application');
      Swal.fire('Please install MetaMask to use this application');
    }
  }
 //Function to stake desired Amount  
  async function stakeTokens() {
    if(amountStake==0||amountStake == undefined || amountStake == ''){
      Swal.fire('please enter a valid number of tokens to stake');
    }else{
      try {
        const stakedAmount = ethers.utils.parseEther(amountStake);
        const tokenBalance = await tokenContract.balanceOf(account);
        const tokenBalanceInEth = ethers.utils.formatEther(tokenBalance.toString())

        if(Number(amountStake) > tokenBalanceInEth){
          Swal.fire('You donot have enough tokens to stake');
        }else{
          console.log("proceed")
        
        const approveTx = await tokenContract.approve(
          stakingContractAddress,
          ethers.constants.MaxUint256
        );
        await approveTx.wait(); 

        const tokenStaking = await stakeContract.stake(stakedAmount);
        await tokenStaking.wait();

        //setMessageStaking('Tokens staked successfully');
        Swal.fire('Tokens staked successfully');
        }
      } catch (error) {
        console.error(error);
        //setMessageStaking('Failed to stake tokens');
        Swal.fire('Failed to stake tokens');
      }
  }
  }

 //Function to unstake desired amount
  async function unstakeTokens(){
    if(amountUnstake==0||amountUnstake == undefined || amountUnstake == ''){
      Swal.fire('please enter a valid number of tokens to unstake');
    }else{
      const value = await stakeContract.stakers(account);
      const stakedValue = ethers.utils.formatEther(value[0].toString());
      const stakedValueNum = Number(stakedValue)
      const amountToUnstake = Number(amountUnstake)
    try{
      if(amountToUnstake > stakedValueNum){
        Swal.fire('You do not enough tokens staked');
      }else{
        const unstakeAmount = ethers.utils.parseEther(amountUnstake);
        
        const tokenUnstaking = await stakeContract.unstake(unstakeAmount);
        await tokenUnstaking.wait();
        //setMessageUnstaking("Unstaking Successfull")
        Swal.fire('Unstaking Successfull');
      }
    }
    catch(error){
      console.error(error);
     // setMessageUnstaking('Failed to Unstake tokens');
     Swal.fire('Failed to Unstake tokens');
    }
  }
  }
 //Function to calculate the reward
  async function calculateReward(){
   try{
     const calculateReward = await stakeContract.calculateReward(account);
     const rewardinEth = ethers.utils.formatEther(String(calculateReward))
     console.log(rewardinEth);
     setReward(rewardinEth)
     Swal.fire(`You have : ${rewardinEth} tokens as reward`);
   }
   catch(error){
    console.log("error", error)
   }
  
  }

  //Claim the reward 
  async function claimReward(){
    try{
      const claimReward = await stakeContract.claimReward();
      await claimReward.wait();
      Swal.fire('reward Claimed');
    }
    catch(error){
      console.log("Error while claiming reward", error);
      Swal.fire('reward Claimed failed');
    }
  }

  //Buy token
  async function buyTokens(){
    if(tokensToBuy==0 || tokensToBuy == undefined || tokensToBuy == ''){
      Swal.fire('Enter a valid number of tokens to buy');
    }else{
      try{
        const numberOfTokens = ethers.utils.parseEther(tokensToBuy);
        const tokensInNum = Number(tokensToBuy);
        const totalAmount = tokensInNum * tokenPrice;
        const totalAmountInWei = ethers.utils.parseEther(String(totalAmount));
        console.log(totalAmountInWei)
        const buyToken = await buyTokenContract.buyToken(
          numberOfTokens,
          {
            value:totalAmountInWei,
            gasLimit: 5000000,
          }
        )
        await buyToken.wait();
        Swal.fire('Token Purchase Successfull');
      }
      catch(error){
        console.log(error);
        Swal.fire('Token Purchase Failed');
      }
    }
  }
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Staking / Unstaking</h1>
      {account ? (
        <div>
          <p style={{margin:'5%',width:'100%'}}>Connected with address: {account}</p>
          <input
            type="text"
            value={amountStake}
            onChange={(e) => setAmountStake(e.target.value)}
            placeholder="Enter the amount to stake"
            className={styles.input}
          />
          <button onClick={stakeTokens} className={styles.button}>Stake Tokens</button>
          <input
            type="text"
            value={amountUnstake}
            onChange={(e) => setAmountUstake(e.target.value)}
            placeholder="Enter the amount to Unstake"
            className={styles.input}
          />
          <button onClick={unstakeTokens} className={styles.button}>Unstake Tokens</button><br/>
          <button onClick={calculateReward} className={styles.button}>Calculate reward</button><br/>
          <button onClick={claimReward} className={styles.button}>Claim reward</button>
          <input
            type="text"
            value={tokensToBuy}
            onChange={(e) => setTokensToBuy(e.target.value)}
            placeholder="number of tokens to buy"
            className={styles.input}
          />
          <button onClick={buyTokens} className={styles.button}>Buy Token</button><br/>
        </div>
      ) : (
        <button onClick={connectWallet} className={styles.connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
}
