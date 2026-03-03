import json
import os
from pathlib import Path

from dotenv import load_dotenv
from solcx import compile_standard, install_solc
from web3 import Web3

BASE_DIR = Path(__file__).resolve().parent.parent
CONTRACT_PATH = BASE_DIR / "contracts" / "GuardianVault.sol"
ARTIFACT_DIR = BASE_DIR / "simulation-data"
ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)


def require_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise ValueError(f"Missing required env var: {name}")
    return value


def main() -> None:
    load_dotenv(BASE_DIR / ".env")

    rpc_url = require_env("RPC_URL")
    private_key = require_env("PRIVATE_KEY")
    chain_id = int(os.getenv("CHAIN_ID", "11155111"))

    source = CONTRACT_PATH.read_text(encoding="utf-8")

    install_solc("0.8.24")
    compiled = compile_standard(
        {
            "language": "Solidity",
            "sources": {"GuardianVault.sol": {"content": source}},
            "settings": {
                "optimizer": {"enabled": True, "runs": 200},
                "outputSelection": {
                    "*": {
                        "*": [
                            "abi",
                            "evm.bytecode.object",
                        ]
                    }
                },
            },
        },
        solc_version="0.8.24",
    )

    contract_data = compiled["contracts"]["GuardianVault.sol"]["GuardianVault"]
    abi = contract_data["abi"]
    bytecode = contract_data["evm"]["bytecode"]["object"]

    web3 = Web3(Web3.HTTPProvider(rpc_url))
    if not web3.is_connected():
        raise ConnectionError("Could not connect to RPC endpoint")

    account = web3.eth.account.from_key(private_key)
    nonce = web3.eth.get_transaction_count(account.address)

    contract = web3.eth.contract(abi=abi, bytecode=bytecode)
    constructor_call = contract.constructor()
    gas_estimate = constructor_call.estimate_gas({"from": account.address})
    latest_block = web3.eth.get_block("latest")
    base_fee = latest_block.get("baseFeePerGas", web3.to_wei("10", "gwei"))
    priority_fee = web3.to_wei("1", "gwei")
    max_fee = base_fee + priority_fee

    tx = constructor_call.build_transaction(
        {
            "from": account.address,
            "nonce": nonce,
            "chainId": chain_id,
            "gas": int(gas_estimate * 1.2),
            "maxFeePerGas": max_fee,
            "maxPriorityFeePerGas": priority_fee,
        }
    )

    signed = account.sign_transaction(tx)
    tx_hash = web3.eth.send_raw_transaction(signed.raw_transaction)
    receipt = web3.eth.wait_for_transaction_receipt(tx_hash)

    if receipt.contractAddress is None:
        raise RuntimeError("Deployment failed: contractAddress is None")

    output = {
        "network": "sepolia",
        "chainId": chain_id,
        "deployer": account.address,
        "contractAddress": receipt.contractAddress,
        "deploymentTxHash": tx_hash.hex(),
        "blockNumber": receipt.blockNumber,
        "status": receipt.status,
        "abi": abi,
    }

    artifact_path = ARTIFACT_DIR / "guardian_deployment.json"
    artifact_path.write_text(json.dumps(output, indent=2), encoding="utf-8")

    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()
