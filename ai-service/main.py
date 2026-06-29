from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------------
# 1. Synthetic Data Generation & Training
# -----------------------------------------

def generate_synthetic_data(num_records=1000):
    np.random.seed(42)
    # Features: task_complexity (1-5), team_size (1-10), historical_delay_rate (0-1), 
    # estimated_duration_days
    data = {
        'task_complexity': np.random.randint(1, 6, num_records),
        'team_size': np.random.randint(1, 11, num_records),
        'historical_delay_rate': np.random.uniform(0, 1, num_records),
        'estimated_duration_days': np.random.randint(1, 30, num_records),
    }
    df = pd.DataFrame(data)
    
    # Target: Will it be delayed? (1 = Yes, 0 = No)
    # Simple heuristic to make data realistic: High complexity + small team + high historical delay = delayed
    risk_score = (df['task_complexity'] * 0.3) - (df['team_size'] * 0.1) + (df['historical_delay_rate'] * 0.5) + (df['estimated_duration_days'] * 0.05)
    # Normalize risk score roughly
    probability = 1 / (1 + np.exp(-risk_score)) # sigmoid
    
    df['is_delayed'] = (probability > 0.65).astype(int)
    return df

df = generate_synthetic_data()
X = df[['task_complexity', 'team_size', 'historical_delay_rate', 'estimated_duration_days']]
y = df['is_delayed']

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X, y)
print("Model trained on synthetic historical task data.")

# -----------------------------------------
# 2. Prediction API
# -----------------------------------------

class TaskData(BaseModel):
    task_complexity: int
    team_size: int
    historical_delay_rate: float
    estimated_duration_days: int

class PredictionResult(BaseModel):
    delay_probability: float
    is_at_risk: bool
    mitigation_recommendation: Optional[str]

@app.post("/predict-delay", response_model=PredictionResult)
def predict_delay(task: TaskData):
    # Prepare input
    input_data = pd.DataFrame([{
        'task_complexity': task.task_complexity,
        'team_size': task.team_size,
        'historical_delay_rate': task.historical_delay_rate,
        'estimated_duration_days': task.estimated_duration_days
    }])
    
    # Predict
    prob = model.predict_proba(input_data)[0][1] # Probability of class 1 (delayed)
    is_at_risk = prob > 0.65
    
    # Simple recommendation engine based on features
    recommendation = None
    if is_at_risk:
        if task.team_size < 3 and task.task_complexity > 3:
            recommendation = "High complexity task with a small team. Consider allocating more resources or breaking the task down."
        elif task.estimated_duration_days > 14:
            recommendation = "Long duration task at risk. Consider splitting into shorter weekly milestones to track progress closer."
        else:
            recommendation = "Task is at risk based on historical trends. Initiate a risk review meeting with the owner."

    return PredictionResult(
        delay_probability=float(prob),
        is_at_risk=bool(is_at_risk),
        mitigation_recommendation=recommendation
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
