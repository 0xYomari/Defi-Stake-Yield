import { useContractFunction, useEthers } from "@usedapp/core"
import { constants, utils } from "ethers"
import TokenFarm from "../chain-info/contracts/TokenFarm.json"
import ERC20 from "../chain-info/contracts/MockERC20.json"
import networkMapping from "../chain-info/deployments/map.json"
import { Contract } from "@ethersproject/contracts"
import { useState, useEffect } from "react"


export const useStakeTokens = (tokenAddress: string) => {
    // address
    // abi 
    // chainID
    const { chainId } = useEthers()
    const { abi } = TokenFarm
    let stringChainId = String(chainId)
    const tokenFarmAddress = chainId ? networkMapping[stringChainId]["TokenFarm"][0] : constants.AddressZero
    const tokenFarmInterface = new utils.Interface(abi)
    const tokenFarmContract = new Contract(tokenFarmAddress, tokenFarmInterface)

    const erc20ABI = ERC20.abi
    const erc20Interface = new utils.Interface(erc20ABI)
    const erc20Contract = new Contract(tokenAddress, erc20Interface)
    // approve
    // stake tokens
    const { send: approveERC20send, state: approveAndStakeERC20State } =
        useContractFunction(erc20Contract, "approve", {
            transactionName: "Approv ERC20 transfer",
        })
    const approveAndStake = (amount: string) => {
        setAmountToStake(amount)
        return approveERC20send(tokenFarmAddress, amount)

    }

    const { send: stakeSend, state: stakeState } =
        useContractFunction(tokenFarmContract, "stakeTokens", {
            transactionName: "Stake Tokens",
        })

    const [amountToStake, setAmountToStake] = useState("0")
    // useEffect
    useEffect(() => {
        if (approveAndStakeERC20State.status === "Success") {
            // stake funciton
            stakeSend(amountToStake, tokenAddress)
        }
    }, [approveAndStakeERC20State, amountToStake, tokenAddress])

    const [state, setState] = useState(approveAndStakeERC20State)
    useEffect(() => {
        if (approveAndStakeERC20State.status === "Success") {
            setState(stakeState)
        } else {
            setState(approveAndStakeERC20State)
        }

    }, [approveAndStakeERC20State, stakeState])

    return { approveAndStake, state }

}