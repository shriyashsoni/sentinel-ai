// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

/**
 * @title SentinelGuardian
 * @notice Advanced security vault with Chainlink Price Feeds and Automation
 * @dev Integrates Chainlink for real-time price data and automated protection triggers
 */
contract SentinelGuardian is AutomationCompatibleInterface {
    // ============== State Variables ==============
    bool public protectionActive;
    address public owner;
    
    // Chainlink Price Feed (ETH/USD on Sepolia)
    AggregatorV3Interface public priceFeed;
    
    // Risk Management
    mapping(address => bool) public flaggedContracts;
    mapping(address => uint256) public riskScores;
    mapping(address => bool) public protectedUsers;
    mapping(address => uint256) public lastCheckTimestamp;
    
    // Automation Settings
    uint256 public automationThreshold = 70;
    uint256 public checkInterval = 60; // seconds between automated checks
    address[] public monitoredWallets;
    
    // Price threshold for alerts (e.g., if ETH drops 10% trigger extra protection)
    int256 public priceAlertThreshold;
    int256 public lastRecordedPrice;

    // ============== Events ==============
    event RiskDetected(address indexed user, uint256 score, int256 ethPrice);
    event ProtectionActivated(address indexed user, string reason);
    event ContractFlagged(address indexed contractAddress);
    event EmergencyLock(address indexed user);
    event AutomationTriggered(address indexed user, uint256 score);
    event PriceAlertTriggered(int256 currentPrice, int256 threshold);
    event WalletMonitoringAdded(address indexed wallet);
    event ThresholdUpdated(uint256 newThreshold);

    // ============== Modifiers ==============
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    // ============== Constructor ==============
    constructor(address _priceFeed) {
        owner = msg.sender;
        // Sepolia ETH/USD Price Feed: 0x694AA1769357215DE4FAC081bf1f309aDC325306
        priceFeed = AggregatorV3Interface(_priceFeed);
        
        // Initialize price tracking
        (, lastRecordedPrice, , , ) = priceFeed.latestRoundData();
        priceAlertThreshold = lastRecordedPrice * 90 / 100; // Alert if price drops 10%
    }

    // ============== Chainlink Price Feed Functions ==============
    
    /**
     * @notice Get the latest ETH/USD price from Chainlink
     * @return price The current ETH price in USD (8 decimals)
     */
    function getLatestPrice() public view returns (int256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return price;
    }
    
    /**
     * @notice Get price feed details
     * @return decimals The number of decimals in the price
     * @return description The price feed description
     */
    function getPriceFeedInfo() public view returns (uint8 decimals, string memory description) {
        decimals = priceFeed.decimals();
        description = priceFeed.description();
    }
    
    /**
     * @notice Check if price has dropped below alert threshold
     */
    function isPriceAlertActive() public view returns (bool) {
        int256 currentPrice = getLatestPrice();
        return currentPrice < priceAlertThreshold;
    }

    // ============== Chainlink Automation Functions ==============
    
    /**
     * @notice Chainlink Automation check function
     * @dev Called by Chainlink Automation to determine if upkeep is needed
     */
    function checkUpkeep(bytes calldata /* checkData */) 
        external 
        view 
        override 
        returns (bool upkeepNeeded, bytes memory performData) 
    {
        // Check if any monitored wallet exceeds risk threshold
        for (uint256 i = 0; i < monitoredWallets.length; i++) {
            address wallet = monitoredWallets[i];
            if (riskScores[wallet] >= automationThreshold && !protectedUsers[wallet]) {
                return (true, abi.encode(wallet, riskScores[wallet]));
            }
        }
        
        // Check if price alert is triggered
        if (isPriceAlertActive() && !protectionActive) {
            return (true, abi.encode(address(0), 0));
        }
        
        return (false, "");
    }
    
    /**
     * @notice Chainlink Automation perform function
     * @dev Called by Chainlink Automation when checkUpkeep returns true
     */
    function performUpkeep(bytes calldata performData) external override {
        (address wallet, uint256 score) = abi.decode(performData, (address, uint256));
        
        if (wallet == address(0)) {
            // Price alert triggered
            protectionActive = true;
            emit PriceAlertTriggered(getLatestPrice(), priceAlertThreshold);
        } else if (riskScores[wallet] >= automationThreshold && !protectedUsers[wallet]) {
            // Risk threshold exceeded
            protectedUsers[wallet] = true;
            emit AutomationTriggered(wallet, score);
            emit ProtectionActivated(wallet, "Automated: Risk threshold exceeded");
        }
    }

    // ============== Core Protection Functions ==============
    
    /**
     * @notice Flag a malicious contract
     */
    function flagContract(address contractAddress) external onlyOwner {
        flaggedContracts[contractAddress] = true;
        emit ContractFlagged(contractAddress);
    }
    
    /**
     * @notice Report risk score for a user with price context
     */
    function reportRisk(address user, uint256 score) external onlyOwner {
        riskScores[user] = score;
        lastCheckTimestamp[user] = block.timestamp;
        
        int256 currentPrice = getLatestPrice();
        emit RiskDetected(user, score, currentPrice);
        
        // Auto-activate if threshold exceeded
        if (score >= automationThreshold) {
            protectedUsers[user] = true;
            emit ProtectionActivated(user, "Risk score exceeded threshold");
        }
    }
    
    /**
     * @notice Manually activate protection for a user
     */
    function activateProtection(address user) external onlyOwner {
        protectionActive = true;
        protectedUsers[user] = true;
        emit ProtectionActivated(user, "Manual activation");
    }
    
    /**
     * @notice Revoke high-risk token approval (placeholder for actual implementation)
     */
    function revokeHighRiskApproval(address user, address token) external onlyOwner {
        // In production, this would interact with token contracts
        // For demo purposes, we emit an event
        emit ProtectionActivated(user, "Approval revocation requested");
        user; token; // Silence unused variable warnings
    }
    
    /**
     * @notice Emergency lock for immediate protection
     */
    function emergencyLock(address user) external onlyOwner {
        protectionActive = true;
        protectedUsers[user] = true;
        emit EmergencyLock(user);
    }

    // ============== Monitoring Management ==============
    
    /**
     * @notice Add a wallet to automated monitoring
     */
    function addMonitoredWallet(address wallet) external onlyOwner {
        monitoredWallets.push(wallet);
        emit WalletMonitoringAdded(wallet);
    }
    
    /**
     * @notice Get all monitored wallets
     */
    function getMonitoredWallets() external view returns (address[] memory) {
        return monitoredWallets;
    }
    
    /**
     * @notice Update automation risk threshold
     */
    function setAutomationThreshold(uint256 _threshold) external onlyOwner {
        automationThreshold = _threshold;
        emit ThresholdUpdated(_threshold);
    }
    
    /**
     * @notice Update price alert threshold
     */
    function setPriceAlertThreshold(int256 _threshold) external onlyOwner {
        priceAlertThreshold = _threshold;
    }
    
    /**
     * @notice Reset protection status
     */
    function resetProtection(address user) external onlyOwner {
        protectedUsers[user] = false;
        if (monitoredWallets.length == 0) {
            protectionActive = false;
        }
    }

    // ============== View Functions ==============
    
    /**
     * @notice Get comprehensive status for a user
     */
    function getUserStatus(address user) external view returns (
        uint256 riskScore,
        bool isProtected,
        uint256 lastCheck,
        int256 currentEthPrice
    ) {
        return (
            riskScores[user],
            protectedUsers[user],
            lastCheckTimestamp[user],
            getLatestPrice()
        );
    }
    
    /**
     * @notice Get system status
     */
    function getSystemStatus() external view returns (
        bool globalProtection,
        uint256 threshold,
        uint256 monitoredCount,
        int256 ethPrice,
        bool priceAlert
    ) {
        return (
            protectionActive,
            automationThreshold,
            monitoredWallets.length,
            getLatestPrice(),
            isPriceAlertActive()
        );
    }
}
