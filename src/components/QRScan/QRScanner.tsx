import React, { useState } from 'react';
import { QrCode } from 'lucide-react';
import '../../styles/components.css';

interface ScanResult {
  id: string;
  customerName: string;
  eventName: string;
  ticketType: string;
  scannedAt: string;
  status: 'valid' | 'invalid' | 'already_used';
}

const QRScanner: React.FC = () => {
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const mockScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const newScan: ScanResult = {
        id: Date.now().toString(),
        customerName: 'John Doe',
        eventName: 'Saturday Night Fever',
        ticketType: 'VIP',
        scannedAt: new Date().toISOString(),
        status: 'valid'
      };
      setScanResults(prev => [newScan, ...prev]);
      setIsScanning(false);
    }, 2000);
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">QR Code Scanner</h2>
          <p className="card-subtitle">Scan tickets and verify customer entry</p>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '300px',
            height: '300px', /* Keep as is */
            margin: '0 auto',
            background: '#212529', /* Dark background for scanner */
            border: '2px dashed #405189', /* Primary blue dashed border */
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center', /* Keep as is */
            flexDirection: 'column',
            gap: '16px'
          }}>
            {isScanning ? (
              <>
                <div className="loading-spinner" style={{ width: '40px', height: '40px' }}></div>
                <span style={{ color: '#6366f1', fontWeight: '600' }}>Scanning...</span>
              </> /* Keep as is */
            ) : (
              <>
                <QrCode size={64} style={{ color: '#405189' }} />
                <span style={{ color: '#6366f1', fontWeight: '600' }}>Ready to Scan</span>
              </>
            )}
          </div>
          
          <button 
            className="btn btn-primary" 
            onClick={mockScan}
            disabled={isScanning}
            style={{ marginTop: '20px' }}
          >
            {isScanning ? 'Scanning...' : 'Start Scan'}
          </button>
        </div>

        {scanResults.length > 0 && (
          <div>
            <h3 style={{ color: '#ffffff', marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
              Recent Scans
            </h3>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Event</th>
                    <th>Ticket Type</th>
                    <th>Scanned At</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {scanResults.map((result) => (
                    <tr key={result.id}>
                      <td>{result.customerName}</td>
                      <td>{result.eventName}</td>
                      <td>{result.ticketType}</td>
                      <td>{new Date(result.scannedAt).toLocaleString()}</td>
                      <td>
                        <span className={`badge ${
                          result.status === 'valid' ? 'badge-success' :
                          result.status === 'invalid' ? 'badge-danger' :
                          'badge-warning'
                        }`}>
                          {result.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;