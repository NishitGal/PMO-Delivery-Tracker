import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { LayoutDashboard, AlertTriangle, Activity, Settings, Plus, Download } from 'lucide-react';
import axios from 'axios';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';

const API_URL = 'http://localhost:3001/api';
const AI_URL = 'http://localhost:8000';

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="brand">
            <Activity className="brand-icon" />
            <span>PMO Tracker</span>
          </div>
          <nav className="nav-links">
            <Link to="/" className="nav-link active">
              <LayoutDashboard size={20} /> Dashboard
            </Link>
            <Link to="/raid" className="nav-link">
              <AlertTriangle size={20} /> RAID Log
            </Link>
            <Link to="/ai-predictor" className="nav-link">
              <Activity size={20} /> AI Predictor
            </Link>
            <Link to="/settings" className="nav-link">
              <Settings size={20} /> Settings
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/raid" element={<RaidLog />} />
            <Route path="/ai-predictor" element={<AiPredictor />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

// --- Dashboard Component ---
function Dashboard() {
  const mockBurndownData = [
    { name: 'Week 1', remaining: 100, ideal: 100 },
    { name: 'Week 2', remaining: 85, ideal: 80 },
    { name: 'Week 3', remaining: 70, ideal: 60 },
    { name: 'Week 4', remaining: 65, ideal: 40 },
    { name: 'Week 5', remaining: 40, ideal: 20 },
  ];

  const handleDownloadReport = () => {
    // Usually triggers download from /api/reports/:id
    window.open(`${API_URL}/reports/mock-id`, '_blank');
  };

  return (
    <div>
      <div className="header">
        <h1>Project Dashboard Overview</h1>
        <button className="btn" onClick={handleDownloadReport}>
          <Download size={18} /> Generate PDF Report
        </button>
      </div>

      <div className="dashboard-grid">
        <div className="card glass-panel">
          <h3 className="card-title">Overall Health</h3>
          <div className="metric-value" style={{ color: 'var(--success)' }}>92%</div>
          <span className="status-badge status-ontrack">ON TRACK</span>
        </div>
        <div className="card glass-panel">
          <h3 className="card-title">Active Risks (Critical)</h3>
          <div className="metric-value" style={{ color: 'var(--danger)' }}>3</div>
          <span className="status-badge status-critical">ACTION REQUIRED</span>
        </div>
        <div className="card glass-panel">
          <h3 className="card-title">Schedule Variance</h3>
          <div className="metric-value" style={{ color: 'var(--warning)' }}>-2 Days</div>
          <span className="status-badge status-atrisk">SLIGHT DELAY</span>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginTop: '24px' }}>
        <div className="card glass-panel" style={{ gridColumn: 'span 2', height: '400px' }}>
          <h3 className="card-title">Delivery Metrics (Burndown)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockBurndownData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-panel)', border: 'none', borderRadius: '8px' }} />
              <Legend />
              <Line type="monotone" dataKey="remaining" stroke="var(--accent-blue)" strokeWidth={3} />
              <Line type="monotone" dataKey="ideal" stroke="var(--text-muted)" strokeDasharray="5 5" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// --- RAID Log Component ---
function RaidLog() {
  const [logs, setLogs] = useState([
    { id: 1, type: 'RISK', severity: 'HIGH', description: 'API rate limits might block deployment', status: 'OPEN' },
    { id: 2, type: 'ISSUE', severity: 'CRITICAL', description: 'Database cluster failed over unexpectedly', status: 'OPEN' },
  ]);

  return (
    <div>
      <div className="header">
        <h1>RAID Log Module</h1>
        <button className="btn"><Plus size={18} /> New Log Entry</button>
      </div>

      <div className="card glass-panel table-container">
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Description</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td><strong>{log.type}</strong></td>
                <td>{log.description}</td>
                <td>
                  <span className={`status-badge ${log.severity === 'CRITICAL' ? 'status-critical' : 'status-atrisk'}`}>
                    {log.severity}
                  </span>
                </td>
                <td>{log.status}</td>
                <td><button className="btn btn-secondary">Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- AI Predictor Component ---
function AiPredictor() {
  const [taskData, setTaskData] = useState({
    task_complexity: 4,
    team_size: 2,
    historical_delay_rate: 0.8,
    estimated_duration_days: 15
  });
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${AI_URL}/predict-delay`, taskData);
      setPrediction(res.data);
    } catch (e) {
      console.error(e);
      alert('AI service not reachable. Ensure it is running on port 8000.');
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="header">
        <h1>AI Delay Predictor</h1>
        <p style={{ color: 'var(--text-muted)' }}>Utilizing historical task data to forecast at-risk milestones.</p>
      </div>

      <div className="dashboard-grid">
        <div className="card glass-panel">
          <h3 className="card-title">Task Parameters</h3>
          <div className="form-group">
            <label>Task Complexity (1-5)</label>
            <input type="number" className="form-control" value={taskData.task_complexity} onChange={e => setTaskData({...taskData, task_complexity: +e.target.value})} />
          </div>
          <div className="form-group">
            <label>Team Size</label>
            <input type="number" className="form-control" value={taskData.team_size} onChange={e => setTaskData({...taskData, team_size: +e.target.value})} />
          </div>
          <div className="form-group">
            <label>Historical Delay Rate (0.0 - 1.0)</label>
            <input type="number" step="0.1" className="form-control" value={taskData.historical_delay_rate} onChange={e => setTaskData({...taskData, historical_delay_rate: +e.target.value})} />
          </div>
          <div className="form-group">
            <label>Estimated Duration (Days)</label>
            <input type="number" className="form-control" value={taskData.estimated_duration_days} onChange={e => setTaskData({...taskData, estimated_duration_days: +e.target.value})} />
          </div>
          <button className="btn" onClick={handlePredict} disabled={loading}>
            {loading ? 'Predicting...' : 'Predict Delay Risk'}
          </button>
        </div>

        {prediction && (
          <div className="card glass-panel" style={{ border: prediction.is_at_risk ? '1px solid var(--danger)' : '1px solid var(--success)' }}>
            <h3 className="card-title">Prediction Result</h3>
            <div className="metric-value" style={{ color: prediction.is_at_risk ? 'var(--danger)' : 'var(--success)' }}>
              {(prediction.delay_probability * 100).toFixed(1)}% Risk
            </div>
            <span className={`status-badge ${prediction.is_at_risk ? 'status-critical' : 'status-ontrack'}`}>
              {prediction.is_at_risk ? 'AT RISK MILESTONE' : 'ON TRACK'}
            </span>
            
            {prediction.mitigation_recommendation && (
              <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
                <strong>Mitigation Recommendation:</strong>
                <p style={{ marginTop: '8px' }}>{prediction.mitigation_recommendation}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
