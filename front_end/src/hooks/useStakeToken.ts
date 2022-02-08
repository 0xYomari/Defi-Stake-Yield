import { useEthers } from "@usedapp/core"
import { constants, utils } from "ethers"
import TokenFarm from "../chain-info/contracts/TokenFarm.json"
import ERC20 from "../chain-info/contracts/MockERC20.json"
import networkMapping from "../chain-info/deployments/map.json"
import { Contract } from "ethersproject/contracts"


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

}