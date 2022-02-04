from brownie import (
    Contract,
    accounts,
    network,
    config,
    interface,
    LinkToken,
    MockV3Aggregator,
    MockWETH,
    MockDAI,
)

INTIIAL_PRICE_FEED_VALUE = 2000000000000000000000
DECIMALS = 18

NON_FORKED_LOCAL_BLOCKCHAIN_ENVIRONMENTS = ["hardhat", "development", "ganache"]

LOCAL_BLOCKCHAIN_ENVIRONMENTS = NON_FORKED_LOCAL_BLOCKCHAIN_ENVIRONMENTS + [
    "maninnet-fork",
    "matic-fork",
]

contract_to_mock = {
    "eth_usd_price_feed": MockV3Aggregator,
    "dai_usd_price_feed": MockV3Aggregator,
    "fau_token": MockDAI,
    "weth_token": MockWETH,
}


def get_account(id=None, index=None):
    if id:
        return accounts.load(id)
    if index:
        return accounts(index)
    if network.show_active() in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        return accounts[0]
    if network.show_active() in config["networks"]:
        return accounts.add(config["wallets"]["from_key"])
    return None


def get_contract(contract_name):
    contract_type = contract_to_mock[contract_name]
    if network.show_active() in NON_FORKED_LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        if len(contract_type) <= 0:
            deploy_mocks()
        contract = contract_type[-1]
    else:
        try:
            contract_address = config["networks"][network.show_active()][contract_type]
            contract = Contract.from_abi(
                contract_type._name, contract_address, contract_type.abi
            )
        except KeyError:
            print(
                f"{network.show_active()} address not found, perhaps you should add it to the config or deploy mocks?"
            )

        print(f"brownie run scripts/deploy_mocks.py --network {network.show_active()}")
        return contract


def fund_with_link(
    contract_address, account=None, link_token=None, amount=100000000000000000
):
    account = account if account else get_account()
    link_token = link_token if link_token else get_contract("link_token")
    tx = interface.LinkTokenInterface(link_token).transfer(
        contract_address, amount, {"from": account}
    )
    print("Funded {}".format(contract_address))
    return tx


def get_verify_status():
    verify = (
        config["networks"][network.show_active()]["verify"]
        if config["networks"][network.show_active()].get("verify")
        else False
    )
    return verify


def deploy_mocks(decimals=DECIMALS, initial_value=INTIIAL_PRICE_FEED_VALUE):
    print(f"The active network is {network.show_active()}")
    print("Deploying Mocks.....")
    account = get_account()
    print("Deploying Mock Link Token....")
    link_token = LinkToken.deploy({"from": account})
    print("Deploying Mock Price Feed....")
    mock_price_feed = MockV3Aggregator.deploy(
        decimals, initial_value, {"from": account}
    )
    print(f"Deployed to {mock_price_feed.address}")
    print("Deploying Mock DAI.....")
    dai_token = MockDAI.deploy({"from": account})
    print(f"Deployed to {dai_token.address}")
    print("Deploying Mock WETH")
    weth_token = MockWETH.deploy({"from": account})
    print(f"Deployed to {weth_token.address}")
