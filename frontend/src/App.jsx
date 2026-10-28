import React, { useState, useEffect } from 'react';

const RAW_API_URL = import.meta.env.VITE_API_URL;
const API_BASE = (RAW_API_URL || 'http://localhost:5000').replace(/\/$/, '');

export default function App() {
  const [connectionStatus, setConnectionStatus] = useState('checking'); // 'checking' | 'connected' | 'unreachable'
  const [errorMessage, setErrorMessage] = useState(null);

  const [healthData, setHealthData] = useState(null);
  const [helloData, setHelloData] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const [dbData, setDbData] = useState(null);
  const [dbLoading, setDbLoading] = useState(false);
  const [dbError, setDbError] = useState(null);

  const testBackendConnection = async () => {
    setConnectionStatus('checking');
    setErrorMessage(null);
    setInitialLoading(true);

    try {
      // 1. Fetch /health
      const healthRes = await fetch(`${API_BASE}/health`);
      if (!healthRes.ok) {
        throw new Error(`Health check failed (HTTP ${healthRes.status}: ${healthRes.statusText})`);
      }
      const healthJson = await healthRes.json();
      setHealthData(healthJson);

      // 2. Fetch /api/hello
      const helloRes = await fetch(`${API_BASE}/api/hello`);
      if (!helloRes.ok) {
        throw new Error(`Hello endpoint failed (HTTP ${helloRes.status}: ${helloRes.statusText})`);
      }
      const helloJson = await helloRes.json();
      setHelloData(helloJson);

      setConnectionStatus('connected');
    } catch (err) {
      console.error('Backend connection error:', err);
      setConnectionStatus('unreachable');
      setErrorMessage(err.message || 'Failed to fetch from backend. Ensure backend is running and CORS is configured.');
    } finally {
      setInitialLoading(false);
    }
  };

  const checkDbStatus = async () => {
    setDbLoading(true);
    setDbError(null);
    try {
      const res = await fetch(`${API_BASE}/api/db-status`);
      if (!res.ok) {
        throw new Error(`DB check failed (HTTP ${res.status}: ${res.statusText})`);
      }
      const json = await res.json();
      setDbData(json);
    } catch (err) {
      console.error('DB Status error:', err);
      setDbError(err.message || 'Failed to check database status');
    } finally {
      setDbLoading(false);
    }
  };

  useEffect(() => {
    testBackendConnection();
  }, []);

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <div className="badge-row">
          <span className="badge tech-badge">Vite + React</span>
          <span className="badge tech-badge">Node.js + Express</span>
          <span className="badge monorepo-badge">deploy-test Monorepo</span>
        </div>
        <h1>Deployment Verification Dashboard</h1>
        <p className="subtitle">
          Testing communication between Vercel (Frontend) and Render (Backend)
        </p>
      </header>

      {/* Main Connection Status Banner */}
      <section className="status-section">
        {connectionStatus === 'checking' && (
          <div className="status-banner checking">
            <div className="spinner"></div>
            <div>
              <strong>Connecting to backend...</strong>
              <p>Attempting to reach <code>{API_BASE}</code></p>
            </div>
          </div>
        )}

        {connectionStatus === 'connected' && (
          <div className="status-banner connected">
            <span className="status-icon">✅</span>
            <div className="status-text">
              <span className="status-title">Connected</span>
              <p>Successfully communicated with backend at <code>{API_BASE}</code></p>
            </div>
            <button className="btn btn-outline" onClick={testBackendConnection} disabled={initialLoading}>
              {initialLoading ? 'Testing...' : 'Retest'}
            </button>
          </div>
        )}

        {connectionStatus === 'unreachable' && (
          <div className="status-banner unreachable">
            <span className="status-icon">❌</span>
            <div className="status-text">
              <span className="status-title">Backend unreachable</span>
              <p className="error-message"><strong>Error:</strong> {errorMessage}</p>
            </div>
            <button className="btn btn-danger" onClick={testBackendConnection} disabled={initialLoading}>
              {initialLoading ? 'Retrying...' : 'Retry Connection'}
            </button>
          </div>
        )}
      </section>

      {/* Configuration Details */}
      <section className="card config-card">
        <h2>API Configuration</h2>
        <div className="config-grid">
          <div className="config-item">
            <span className="config-label">Configured VITE_API_URL</span>
            <code className="config-value">{RAW_API_URL || '(not set - using fallback)'}</code>
          </div>
          <div className="config-item">
            <span className="config-label">Active Target Base URL</span>
            <code className="config-value highlight">{API_BASE}</code>
          </div>
        </div>
      </section>

      {/* Endpoints Grid */}
      <div className="cards-grid">
        {/* /health Card */}
        <section className="card endpoint-card">
          <div className="card-header">
            <h3>GET /health</h3>
            <span className={`pill ${healthData ? 'pill-success' : 'pill-muted'}`}>
              {healthData ? healthData.status : 'No data'}
            </span>
          </div>
          <p className="endpoint-desc">Backend health & heartbeat timestamp.</p>
          <div className="response-box">
            {initialLoading ? (
              <span className="loading-text">Loading /health...</span>
            ) : healthData ? (
              <pre>{JSON.stringify(healthData, null, 2)}</pre>
            ) : (
              <span className="empty-text">No response received</span>
            )}
          </div>
        </section>

        {/* /api/hello Card */}
        <section className="card endpoint-card">
          <div className="card-header">
            <h3>GET /api/hello</h3>
            <span className={`pill ${helloData ? 'pill-success' : 'pill-muted'}`}>
              {helloData ? helloData.env : 'No data'}
            </span>
          </div>
          <p className="endpoint-desc">Backend environment & greeting message.</p>
          <div className="response-box">
            {initialLoading ? (
              <span className="loading-text">Loading /api/hello...</span>
            ) : helloData ? (
              <pre>{JSON.stringify(helloData, null, 2)}</pre>
            ) : (
              <span className="empty-text">No response received</span>
            )}
          </div>
        </section>

        {/* /api/db-status Card */}
        <section className="card endpoint-card db-card">
          <div className="card-header">
            <h3>GET /api/db-status</h3>
            {dbData && (
              <span className={`pill ${dbData.connected ? 'pill-success' : 'pill-warning'}`}>
                {dbData.connected ? 'Connected' : 'Disconnected'}
              </span>
            )}
          </div>
          <p className="endpoint-desc">Optional MongoDB connection check via Mongoose.</p>
          
          <div className="action-row">
            <button 
              className="btn btn-primary" 
              onClick={checkDbStatus} 
              disabled={dbLoading}
            >
              {dbLoading ? 'Checking MongoDB...' : 'Check Database Status'}
            </button>
          </div>

          <div className="response-box">
            {dbLoading ? (
              <span className="loading-text">Querying /api/db-status...</span>
            ) : dbError ? (
              <span className="error-text">Error: {dbError}</span>
            ) : dbData ? (
              <pre>{JSON.stringify(dbData, null, 2)}</pre>
            ) : (
              <span className="empty-text">Click the button above to check database status</span>
            )}
          </div>
        </section>
      </div>

      {/* Deployment Quick Reference Footer */}
      <footer className="footer">
        <p>Monorepo <code>deploy-test</code> &bull; Frontend on Vercel &bull; Backend on Render</p>
      </footer>
    </div>
  );
}

