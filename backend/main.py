from typing import Union

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import pandas as pd
import uvicorn

from utils import predict_average_match

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://unnamed-catalyst.github.io"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Load the model and dataset
rf_model = joblib.load("models/rf_model.pkl")
df = pd.read_csv("datasets/vct_average.csv")
df = df.drop(columns=["Unnamed: 0"])


# Define the request body model
class MatchRequest(BaseModel):
    teamA: str
    teamB: str


# API Endpoint
@app.post("/predict_match/")
def predict_match(request: MatchRequest):
    try:
        result = predict_average_match(request.teamA, request.teamB, df, rf_model)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/get_predict")
def predict_match(teamA: str = Query(...), teamB: str = Query(...)):
    try:
        result = predict_average_match(teamA, teamB, df, rf_model)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
