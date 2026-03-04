"""
Deploy SentinelGuardian contract with Chainlink integration to Sepolia testnet.

This script deploys the enhanced SentinelGuardian contract that integrates:
- Chainlink ETH/USD Price Feed
- Chainlink Automation compatibility

Prerequisites:
- Set RPC_URL, PRIVATE_KEY in .env
- Fund the deployer wallet with Sepolia ETH

Usage:
    python scripts/deploy_sentinel_guardian.py
"""

import json
import os
from pathlib import Path

from dotenv import load_dotenv
from solcx import compile_standard, install_solc
from web3 import Web3

BASE_DIR = Path(__file__).resolve().parent.parent
CONTRACT_PATH = BASE_DIR / "contracts" / "SentinelGuardian.sol"
ARTIFACT_DIR = BASE_DIR / "simulation-data"
ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)

# Chainlink Price Feed addresses (Sepolia)
CHAINLINK_FEEDS = {
    "sepolia": {
        "ETH_USD": "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    },
    "mainnet": {
        "ETH_USD": "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
    },
}


def require_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise ValueError(f"Missing required env var: {name}")
    return value


def get_chainlink_imports() -> dict:
    """Return Chainlink contract source code for compilation."""
    return {
        "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol": {
            "content": '''// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface AggregatorV3Interface {
  function decimals() external view returns (uint8);
  function description() external view returns (string memory);
  function version() external view returns (uint256);
  function getRoundData(uint80 _roundId) external view returns (
    uint80 roundId,
    int256 answer,
    uint256 startedAt,
    uint256 updatedAt,
    uint80 answeredInRound
  );
  function latestRoundData() external view returns (
    uint80 roundId,
    int256 answer,
    uint256 startedAt,
    uint256 updatedAt,
    uint80 answeredInRound
  );
}'''
        },
        "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol": {
            "content": '''// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./AutomationBase.sol";
import "./interfaces/AutomationCompatibleInterface.sol";

abstract contract AutomationCompatible is AutomationBase, AutomationCompatibleInterface {}'''
        },
        "@chainlink/contracts/src/v0.8/automation/AutomationBase.sol": {
            "content": '''// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AutomationBase {
  error OnlySimulatedBackend();

  function preventExecution() internal view {
    if (tx.origin != address(0)) {
      revert OnlySimulatedBackend();
    }
  }

  modifier cannotExecute() {
    preventExecution();
    _;
  }
}'''
        },
        "@chainlink/contracts/src/v0.8/automation/interfaces/AutomationCompatibleInterface.sol": {
            "content": '''// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface AutomationCompatibleInterface {
  function checkUpkeep(bytes calldata checkData) external returns (bool upkeepNeeded, bytes memory performData);
  function performUpkeep(bytes calldata performData) external;
}'''
        },
    }


def main() -> None:
    load_dotenv(BASE_DIR / ".env")

    rpc_url = require_env("RPC_URL")
    private_key = require_env("PRIVATE_KEY")
    chain_id = int(os.getenv("CHAIN_ID", "11155111"))
    
    # Determine network and get price feed address
    network = "sepolia" if chain_id == 11155111 else "mainnet"
    price_feed_address = CHAINLINK_FEEDS[network]["ETH_USD"]

    print(f"Deploying SentinelGuardian to {network} (chain ID: {chain_id})")
    print(f"Using Chainlink ETH/USD Price Feed: {price_feed_address}")

    source = CONTRACT_PATH.read_text(encoding="utf-8")

    # Prepare sources with Chainlink imports
    sources = {
        "SentinelGuardian.sol": {"content": source},
        **get_chainlink_imports(),
    }

    install_solc("0.8.24")
    compiled = compile_standard(
        {
            "language": "Solidity",
            "sources": sources,
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

    contract_data = compiled["contracts"]["SentinelGuardian.sol"]["SentinelGuardian"]
    abi = contract_data["abi"]
    bytecode = contract_data["evm"]["bytecode"]["object"]

    web3 = Web3(Web3.HTTPProvider(rpc_url))
    if not web3.is_connected():
        raise ConnectionError("Could not connect to RPC endpoint")

    account = web3.eth.account.from_key(private_key)
    print(f"Deployer address: {account.address}")
    
    balance = web3.eth.get_balance(account.address)
    print(f"Deployer balance: {web3.from_wei(balance, 'ether')} ETH")

    nonce = web3.eth.get_transaction_count(account.address)

    contract = web3.eth.contract(abi=abi, bytecode=bytecode)
    
    # Constructor takes price feed address
    constructor_call = contract.constructor(Web3.to_checksum_address(price_feed_address))
    
    gas_estimate = constructor_call.estimate_gas({"from": account.address})
    print(f"Estimated gas: {gas_estimate}")
    
    latest_block = web3.eth.get_block("latest")
    base_fee = latest_block.get("baseFeePerGas", web3.to_wei("10", "gwei"))
    priority_fee = web3.to_wei("2", "gwei")
    max_fee = base_fee + priority_fee

    tx = constructor_call.build_transaction(
        {
            "from": account.address,
            "nonce": nonce,
            "chainId": chain_id,
            "gas": int(gas_estimate * 1.3),
            "maxFeePerGas": max_fee,
            "maxPriorityFeePerGas": priority_fee,
        }
    )

    print("Signing and sending transaction...")
    signed = account.sign_transaction(tx)
    tx_hash = web3.eth.send_raw_transaction(signed.raw_transaction)
    print(f"Transaction hash: {tx_hash.hex()}")
    
    print("Waiting for confirmation...")
    receipt = web3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)

    if receipt.contractAddress is None:
        raise RuntimeError("Deployment failed: contractAddress is None")

    print(f"\n✅ SentinelGuardian deployed successfully!")
    print(f"   Contract Address: {receipt.contractAddress}")
    print(f"   Block Number: {receipt.blockNumber}")
    print(f"   Gas Used: {receipt.gasUsed}")

    output = {
        "contractName": "SentinelGuardian",
        "network": network,
        "chainId": chain_id,
        "deployer": account.address,
        "contractAddress": receipt.contractAddress,
        "priceFeedAddress": price_feed_address,
        "deploymentTxHash": tx_hash.hex(),
        "blockNumber": receipt.blockNumber,
        "gasUsed": receipt.gasUsed,
        "status": receipt.status,
        "abi": abi,
    }

    artifact_path = ARTIFACT_DIR / "sentinel_guardian_deployment.json"
    artifact_path.write_text(json.dumps(output, indent=2), encoding="utf-8")
    print(f"\n📄 Deployment artifact saved to: {artifact_path}")
    
    # Print instructions
    print("\n" + "="*60)
    print("NEXT STEPS:")
    print("="*60)
    print(f"1. Update frontend/src/lib/guardian.ts with the new address:")
    print(f"   sentinelGuardianContract.address = '{receipt.contractAddress}'")
    print()
    print("2. To enable Chainlink Automation, register at:")
    print("   https://automation.chain.link/sepolia")
    print(f"   - Contract: {receipt.contractAddress}")
    print("   - Trigger: Custom logic")
    print()
    print("3. Fund the Automation subscription with LINK tokens")
    print("="*60)


if __name__ == "__main__":
    main()
