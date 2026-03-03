from eth_tester import EthereumTester, PyEVMBackend
from web3 import Web3, EthereumTesterProvider
from solcx import compile_standard, install_solc
import json
from pathlib import Path

def test_contract():
    # Setup - use localized solc compiler
    install_solc("0.8.24")
    
    base_dir = Path(__file__).resolve().parent.parent
    contract_path = base_dir / "contracts" / "GuardianVault.sol"
    
    with open(contract_path, 'r') as file:
        source_code = file.read()

    compile_result = compile_standard(
        {
            "language": "Solidity",
            "sources": {"GuardianVault.sol": {"content": source_code}},
            "settings": {
                "outputSelection": {
                    "*": {
                        "*": ["abi", "evm.bytecode"]
                    }
                }
            }
        },
        solc_version="0.8.24",
    )

    contract_interface = compile_result['contracts']['GuardianVault.sol']['GuardianVault']
    abi = contract_interface['abi']
    bytecode = contract_interface['evm']['bytecode']['object']

    # Deploy to mock blockchain
    tester = EthereumTester(PyEVMBackend())
    w3 = Web3(EthereumTesterProvider(tester))
    w3.eth.default_account = w3.eth.accounts[0]

    Guardian = w3.eth.contract(abi=abi, bytecode=bytecode)
    tx_hash = Guardian.constructor().transact()
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    guardian = w3.eth.contract(
        address=tx_receipt.contractAddress,
        abi=abi
    )

    # Test 1: Deployment Success
    assert guardian.functions.owner().call() == w3.eth.default_account, "Owner check failed"
    print("✅ Deployment: Success")

    # Test 2: Report Risk
    user_address = w3.eth.accounts[1]
    tx_hash = guardian.functions.reportRisk(user_address, 85).transact()
    w3.eth.wait_for_transaction_receipt(tx_hash)
    
    stored_score = guardian.functions.riskScores(user_address).call()
    assert stored_score == 85, "Risk Score mismatch"
    print("✅ Report Risk: Success")

    # Test 3: Flag Contract
    malicious_contract = w3.eth.accounts[2]
    tx_hash = guardian.functions.flagContract(malicious_contract).transact()
    w3.eth.wait_for_transaction_receipt(tx_hash)
    
    is_flagged = guardian.functions.flaggedContracts(malicious_contract).call()
    assert is_flagged == True, "Contract flagging failed"
    print("✅ Flag Contract: Success")

    # Test 4: Activate Protection
    tx_hash = guardian.functions.activateProtection(user_address).transact()
    w3.eth.wait_for_transaction_receipt(tx_hash)
    
    is_active = guardian.functions.protectionActive().call()
    assert is_active == True, "Protection activation failed"
    print("✅ Activate Protection: Success")

    print("\n🎯 All Contract Tests Passed!")

if __name__ == "__main__":
    test_contract()
