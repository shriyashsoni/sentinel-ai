"""
Vercel serverless function entry point for FastAPI backend.
This file exposes the FastAPI app for Vercel's Python runtime.
"""
from main import app

# Vercel will look for 'app' or 'handler' in this module
__all__ = ['app']
