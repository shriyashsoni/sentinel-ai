"""
Vercel serverless function entry point for FastAPI backend.
Self-contained implementation for Vercel deployment.
"""
import os
from typing import Any

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# ============== Schemas ==============

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


# ============== Risk Engine ==============

def calculate_risk_score(signals: dict) -> tuple[int, list[str]]:
    score = 0
    reasons: list[str] = []

    approval_percent = signals.get("approvalAmountPercent", 0)
    if approval_percent > 80:
        score += 40
        reasons.append("approvalAmountPercent > 80 (+40)")

    if bool(signals.get("blacklistMatch", False)):
        score += 30
        reasons.append("blacklistMatch == true (+30)")

    reputation_score = signals.get("contractReputationScore", 100)
    if reputation_score < 30:
        score += 20
        reasons.append("contractReputationScore < 30 (+20)")

    transaction_velocity = signals.get("transactionVelocity", 0)
    velocity_threshold = signals.get("velocityThreshold", 10)
    if transaction_velocity > velocity_threshold:
        score += 10
        reasons.append("transactionVelocity > velocityThreshold (+10)")

    if bool(signals.get("newContractInteraction", False)):
        score += 5
        reasons.append("newContractInteraction == true (+5)")

    return score, reasons


def build_decision(signals: dict, threshold: int = 70) -> dict:
    risk_score, reasons = calculate_risk_score(signals)
    action = "activateProtection" if risk_score >= threshold else "monitor"

    return {
        "wallet": signals.get("wallet"),
        "action": action,
        "riskScore": risk_score,
        "threshold": threshold,
        "triggered": risk_score >= threshold,
        "reason": ", ".join(reasons) if reasons else "No high-risk indicators",
        "signals": signals,
    }


# ============== Services ==============

def evaluate(signals: dict[str, Any], threshold: int) -> dict[str, Any]:
    return build_decision(signals, threshold=threshold)


def execute_action(decision: dict[str, Any]) -> dict[str, Any]:
    """Simulate on-chain execution (actual blockchain calls disabled in serverless)"""
    if not decision.get("triggered", False):
        return {
            "status": "skipped",
            "reason": "Risk threshold not crossed",
            "decision": decision,
        }
    
    return {
        "status": "simulated",
        "reason": "Serverless environment - blockchain action simulated",
        "wallet": decision.get("wallet"),
        "action": decision.get("action"),
        "riskScore": decision.get("riskScore"),
    }


def evaluate_and_execute(signals: dict[str, Any], threshold: int) -> dict[str, Any]:
    decision = evaluate(signals, threshold=threshold)
    onchain = execute_action(decision)
    return {"decision": decision, "onchain": onchain}


# ============== Storage ==============

# Use a global list since Vercel warm starts can share this, though not permanent
run_history: list[dict] = []

def append_run(event_type: str, data: dict) -> None:
    # Ensure nested riskScore is captured correctly for the UI
    risk_score = 0
    if "decision" in data and "riskScore" in data["decision"]:
        risk_score = data["decision"]["riskScore"]
    elif "riskScore" in data:
        risk_score = data["riskScore"]
        
    entry = {
        "event": event_type, 
        "data": data,
        "riskScore": risk_score, # Flatten for table UI
        "timestamp": "2026-03-04T10:55:00Z" # Mock real-time timestamp
    }
    run_history.append(entry)


def get_recent_runs(limit: int = 20) -> list[dict]:
    return run_history[-limit:][::-1]


# ============== FastAPI App ==============

app = FastAPI(title="SentinelAI Backend", version="0.1.0")

# Setup CORS for Vercel
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root() -> dict[str, str]:
    return {
        "name": "SentinelAI Backend",
        "status": "ok",
        "health": "/health",
    }


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "sentinel-ai-backend"}


@app.post("/risk/evaluate", response_model=RiskDecision)
def evaluate_risk(request: RiskEvaluationRequest) -> RiskDecision:
    decision = evaluate(request.signals.model_dump(), threshold=request.threshold)
    append_run("risk_evaluated", decision)
    return RiskDecision(**decision)


@app.post("/risk/execute")
def execute_risk_action(request: ExecuteRequest) -> dict:
    try:
        result = execute_action(request.decision.model_dump())
        append_run("onchain_executed", result)
        return result
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/risk/pipeline", response_model=PipelineResponse)
def run_pipeline(request: PipelineRequest) -> PipelineResponse:
    try:
        result = evaluate_and_execute(request.signals.model_dump(), threshold=request.threshold)
        append_run("pipeline_run", result)
        return PipelineResponse(**result)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.get("/runs")
def get_runs(limit: int = Query(20, ge=1, le=200)) -> list[dict]:
    return get_recent_runs(limit=limit)
