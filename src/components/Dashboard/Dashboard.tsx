import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../services/apiClient';
import { DashboardStats } from '../../types/api';
import { DollarSign, Calendar, Users, UserCheck, TrendingUp, Activity } from 'lucide-react';
import '../../styles/dashboard.css';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const fetchStats = async () => {
  //     try {
  //       const data = await apiClient.getDashboardStats();
  //       setStats(data);
  //     } catch (error) {
  //       console.error('Failed to fetch dashboard stats:', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchStats();
  // }, []);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const mockStats = {
    totalRevenue: 125000,
    totalEvents: 45,
    totalCustomers: 2850,
    totalStaff: 120,
    revenueGrowth: 12.5,
    eventGrowth: 8.3,
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="dashboard-subtitle">
          Here's what's happening with your {user?.userType === 'super_admin' ? 'entire platform network' : 'club'} today.
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Revenue</span>
            <DollarSign size={20} style={{ color: '#20c997' }} />
          </div>
          <div className="stat-value">${mockStats.totalRevenue.toLocaleString()}</div>
          <div className="stat-change positive">
            <TrendingUp size={14} />
            +{mockStats.revenueGrowth}% from last month
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Events</span>
            <Calendar size={20} style={{ color: '#405189' }} />
          </div>
          <div className="stat-value">{mockStats.totalEvents}</div>
          <div className="stat-change positive">
            <TrendingUp size={14} />
            +{mockStats.eventGrowth}% from last month
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Customers</span>
            <Users size={20} style={{ color: '#ffc107' }} />
          </div>
          <div className="stat-value">{mockStats.totalCustomers.toLocaleString()}</div>
          <div className="stat-change positive">
            <TrendingUp size={14} />
            +15.2% from last month
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Staff Members</span>
            <UserCheck size={20} style={{ color: '#ef4444' }} />
          </div>
          <div className="stat-value">{mockStats.totalStaff}</div>
          <div className="stat-change positive">
            <TrendingUp size={14} />
            +5 new hires this month
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Revenue Overview</h3>
            <p className="chart-subtitle">Monthly revenue trends and projections</p>
          </div>
          <div className="chart-placeholder">
            Revenue Chart Placeholder
          </div>
        </div>

        <div className="recent-activity">
          <div className="recent-activity-header">
            <h3 className="recent-activity-title">
              <Activity size={20} style={{ display: 'inline-block', marginRight: '8px', color: '#405189' }} />
              Recent Activity
            </h3>
          </div>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-details">
                <div className="activity-title">New Event Created</div>
                <div className="activity-description">Saturday Night Fever - VIP Experience</div>
              </div>
              <div className="activity-time">2 hours ago</div>
            </div>
            <div className="activity-item">
              <div className="activity-details">
                <div className="activity-title">Staff Check-in</div>
                <div className="activity-description">5 staff members checked in for tonight</div>
              </div>
              <div className="activity-time">4 hours ago</div>
            </div>
            <div className="activity-item">
              <div className="activity-details">
                <div className="activity-title">Revenue Milestone</div>
                <div className="activity-description">Reached $10K in monthly sales</div>
              </div>
              <div className="activity-time">1 day ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;