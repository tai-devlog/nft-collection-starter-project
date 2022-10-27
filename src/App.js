import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, {useEffect, useState} from "react";
import {ethers} from "ethers";
import myEpicNft from "./utils/MyEpicNFT.json";
import { parseEther } from 'ethers/lib/utils';

// Constantsを宣言する: constとは値書き換えを禁止した変数を宣言する方法です。
const TWITTER_HANDLE = 'あなたのTwitterのハンドルネームを貼り付けてください';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = '';
const TOTAL_MINT_COUNT = 50;
const CONTRACT_ADDRESS =  "0x6B8BfDb1bBeF39D3AdCdD4a83aAC4106e0c51087";

const App = () => {

  //ユーザーのウォレットアドレスを格納する状態変数を定義
  const[currentAccount, setCurrentAccout] = useState("");
  //空のアカウント表示
  console.log("currentAccount:",currentAccount);

// App.js
  // setupEventListener 関数を定義します。
  // MyEpicNFT.sol の中で event が　emit された時に、
  // 情報を受け取ります。
  const setupEventListener = async () => {
    try{
      const {ethereum} = window;
      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );

        connectedContract.on("NewEpicNFTMinted",(from,tokenId) => {
          console.log(from,tokenId.toNumber());
          alert(
            `あなたのウォレットに NFT を送信しました。OpenSea に表示されるまで最大で10分かかることがあります。NFT へのリンクはこちらです: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          );
        })
        console.log("setup eventlistener");
      }else{
        console.log("Eth object doesn't exist");
      }
      } catch(error) {
        console.log(error);
      }
    };


  //ユーザーがMetaMaskを持っているか確認
  const checkIfWalletIsConnected = async ()=>{
    const {ethereum} = window;
    //分割代入。通常はwindow.ethereumとして利用するがこの書き方をすることでwindow.をつけなくてetheremだけでオブジェクト操作ができるようになる
    //ehtereum = window.ethereumと同じ処理
    if(!ethereum) {
      console.log("Make sure you have MetaMask");
    }else{
      console.log("we have ethereum object",ethereum);
    }

    //意図しないChainIdか判定
    let chainId = await ethereum.request({ method: "eth_chainId" });
    console.log("Connected to chain " + chainId);
    // 0x5 は　Goerli の ID です。
    const goerliChainId = "0x5";
    if (chainId !== goerliChainId) {
      alert("You are not connected to the Goerli Test Network!");
    }

    //ユーザーのウォレットに対しアクセス許可を求める
    //許可されれば最初のアドレスをaccountsに格納
    const accounts = await ethereum.request({method: "eth_accounts"});
    if (accounts.length !== 0){
      const account = accounts[0];
      console.log("Found an authorized account :",account);
      setCurrentAccout(account);
      // イベントリスナーを設定
      // この時点で、ユーザーはウォレット接続が済んでいます。
      //setupEventListener();
    }else{
      console.log("No authorized account here");
    }
    
  }
  
  //ConnectWalletメソッドを実装
  const connectWallet = async() => {
    try{
      const {ethereum} = window;
      if(!ethereum){
        alert('Get Metamask!');
        return;
      }
      //ウォレットアドレスに対してアクセスをリクエスト
      const accounts = await ethereum.request({
        method: "eth_requestAccounts"
      });
      console.log("connected:",accounts[0]);
      //ウォレットアドレスをsetする
      setCurrentAccout(accounts[0]);
      // イベントリスナーを設定
      // この時点で、ユーザーはウォレット接続が済んでいます。
      //setupEventListener();
      } catch(error){
        console.log(error);
      }
    };
  



  //コントラクトでのMintで利用
  const askContractToMintNft = async () => {
    try {
      const {ethereum} = window;
      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );
        console.log("Going to pop wallet now to pay gas...");
        let nftTxn = await connectedContract.makeAnEpicNFT();
        console.log("Mining...please wait.");
        await nftTxn.wait();
        console.log(
          `Mined, see transaction: https://goerli.etherscan.io/tx/${nftTxn.hash}`
        );
        }else{
          console.log("Ethereum object doesn't exist!");
        }
        setupEventListener();
      } catch(error){
        console.log(error);
      }

      }




  // renderNotConnectedContainer メソッドを定義します。
  const renderNotConnectedContainer = () => (
    <button 
      onClick = {connectWallet}
      className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  //ページがロード（return以下レンダリング）された後にuserEffect()内の関数が呼び出される
  useEffect(() => {
    checkIfWalletIsConnected();
  },[]);

  //レンダリング
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            あなただけの特別な NFT を Mint しよう💫
          </p>
          
          {/*条件付きレンダリング.既にウォレットが接続されいている場合にはWalletConnectボタンは表示させないようにする*/
          currentAccount ==="" ? (
            renderNotConnectedContainer()
          ) : (
            <button 
            onClick = {askContractToMintNft}
            className="cta-button connect-wallet-button">
             Mint NFT
          </button>
          )}

        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
