import json
import os
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from web3 import Web3

INPUT_PATH = Path("simulation-data/risk_decision.json")
OUTPUT_PATH = Path("simulation-data/onchain_result.json")

load_dotenv()

GUARDIAN_ABI = [
    {
        "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
        "name": "activateProtection",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    },
    {
        "inputs": [
            {"internalType": "address", "name": "user", "type": "address"},
            {"internalType": "uint256", "name": "score", "type": "uint256"},
        ],
        "name": "reportRisk",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    },
]


def require_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise ValueError(f"Missing required env var: {name}")
    return value


def execute_from_decision(decision: dict[str, Any], output_path: Path = OUTPUT_PATH) -> dict[str, Any]:
    if not decision.get("triggered", False):
        result = {
            "status": "skipped",
            "reason": "Risk threshold not crossed",
            "decision": decision,
        }
        output_path.write_text(json.dumps(result, indent=2), encoding="utf-8")
        return result

    rpc_url = require_env("RPC_URL")
    private_key = require_env("PRIVATE_KEY")
    contract_address = require_env("GUARDIAN_CONTRACT")
    chain_id = int(os.getenv("CHAIN_ID", "11155111"))

    web3 = Web3(Web3.HTTPProvider(rpc_url))
    account = web3.eth.account.from_key(private_key)
    contract = web3.eth.contract(address=Web3.to_checksum_address(contract_address), abi=GUARDIAN_ABI)

    wallet = decision["wallet"]
    wallet_address = Web3.to_checksum_address(wallet)
    risk_score = int(decision["riskScore"])

    nonce = web3.eth.get_transaction_count(account.address)

    latest_block = web3.eth.get_block("latest")
    base_fee = latest_block.get("baseFeePerGas", web3.to_wei("10", "gwei"))
    priority_fee = web3.to_wei("1", "gwei")
    max_fee = base_fee + priority_fee

    report_risk_call = contract.functions.reportRisk(wallet_address, risk_score)
    report_gas_estimate = report_risk_call.estimate_gas({"from": account.address})

    tx1 = report_risk_call.build_transaction(
        {
            "from": account.address,
            "nonce": nonce,
            "chainId": chain_id,
            "gas": int(report_gas_estimate * 1.2),
            "maxFeePerGas": max_fee,
            "maxPriorityFeePerGas": priority_fee,
        }
    )
    signed_tx1 = account.sign_transaction(tx1)
    tx_hash_1 = web3.eth.send_raw_transaction(signed_tx1.raw_transaction)
    receipt_1 = web3.eth.wait_for_transaction_receipt(tx_hash_1)

    activate_protection_call = contract.functions.activateProtection(wallet_address)
    activate_gas_estimate = activate_protection_call.estimate_gas({"from": account.address})

    tx2 = activate_protection_call.build_transaction(
        {
            "from": account.address,
            "nonce": nonce + 1,
            "chainId": chain_id,
            "gas": int(activate_gas_estimate * 1.2),
            "maxFeePerGas": max_fee,
            "maxPriorityFeePerGas": priority_fee,
        }
    )
    signed_tx2 = account.sign_transaction(tx2)
    tx_hash_2 = web3.eth.send_raw_transaction(signed_tx2.raw_transaction)
    receipt_2 = web3.eth.wait_for_transaction_receipt(tx_hash_2)

    result = {
        "status": "executed",
        "wallet": wallet,
        "riskScore": risk_score,
        "reportRiskTxHash": tx_hash_1.hex(),
        "reportRiskBlock": receipt_1.blockNumber,
        "activateProtectionTxHash": tx_hash_2.hex(),
        "activateProtectionBlock": receipt_2.blockNumber,
    }

    output_path.write_text(json.dumps(result, indent=2), encoding="utf-8")
    return result


def main() -> None:
    with INPUT_PATH.open("r", encoding="utf-8") as f:
        decision = json.load(f)

    result = execute_from_decision(decision)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
