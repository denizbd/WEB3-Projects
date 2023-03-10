import Web3 from "web3"
import Web3Modal from "web3modal"
import WalletConnectProvider from "@walletconnect/web3-provider";

import { useState, useEffect, createContext } from 'react'

import WIP from './WIP.json'

const contractAddress = "0x0156022AF4694a2eD20056dE7A2C2614f3248511"

export const WalletContext = createContext()

const Wallet = function ({ children }) {
  const [accounts, setAccounts] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [web3, setWeb3] = useState(
    new Web3(Web3.givenProvider)
  )

  const [contract, setContract] = useState(
    new web3.eth.Contract(WIP.abi, contractAddress)
  )

  const [balance, setBalance] = useState(0)
  const [canPost, setCanPost] = useState(false)
  const [canComment, setCanComment] = useState(false)

  useEffect(() => {
    if (accounts.length > 0) {
      setIsConnected(true)
    } else {
      setIsConnected(false)
    }

    fetchBalance()
  }, [accounts])

  useEffect(() => {
    web3.eth.getAccounts().then(setAccounts)

    web3.currentProvider.on("accountsChanged", setAccounts)

    web3.currentProvider.on("disconnected", function () {
      setAccounts([])
    })

    setContract(
      new web3.eth.Contract(WIP.abi, contractAddress)
    )
  }, [web3])

  const connect = async function () {
    if (window) {
      const web3Modal = new Web3Modal({
        network: "goerli",
        providerOptions: {
          walletconnect: {
            package: WalletConnectProvider,
            options: {
      provider: () => new HDWalletProvider(mnemonic, `https://goerli.infura.io/v3/c550f6f3ab7e463e8ccef8ec5fd0c14b`),
      infuraId: "c550f6f3ab7e463e8ccef8ec5fd0c14b"
            }
          }
        }
      })

      const provider = await web3Modal.connect()

      setWeb3(new Web3(provider))
    }
  }

  const fetchBalance = async function () {
    if (accounts.length > 0) {
      const b = await contract.methods.balanceOf(accounts[0]).call()
      setBalance(b)

      const cp = await contract.methods.canPost(accounts[0]).call()
      setCanPost(cp)

      const cc = await contract.methods.canComment(accounts[0]).call()
      setCanComment(cc)
    } else {
      setBalance(0)
      setCanPost(false)
      setCanComment(false)
    }
  }
  
  const exp = {
    accounts,
    connect,
    isConnected,
    balance,
    canPost,
    canComment,
    contract,
    web3,
    fetchBalance
  }

  return (
    <WalletContext.Provider value={exp}>
      {children}
    </WalletContext.Provider>
  )
}

export default Wallet