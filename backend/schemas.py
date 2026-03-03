from typing import Any

from pydantic import BaseModel, Field


class WalletSignals(BaseModel):
    wallet: str = Field(..., description="Wallet address under evaluation")
    approvalAmountPercent: int = 0
    contractReputationScore: int = 100
    transactionVelocity: int = 0
    velocityThreshold: int = 10
    newContractInteraction: bool = False
    blacklistMatch: bool = False


class RiskEvaluationRequest(BaseModel):
    signals: WalletSignals
    threshold: int = 70


class RiskDecision(BaseModel):
    wallet: str | None
    action: str
    riskScore: int
    threshold: int
    triggered: bool
    reason: str
    signals: dict[str, Any]


class ExecuteRequest(BaseModel):
    decision: RiskDecision


class PipelineRequest(BaseModel):
    signals: WalletSignals
    threshold: int = 70


class PipelineResponse(BaseModel):
    decision: RiskDecision
    onchain: dict[str, Any]
