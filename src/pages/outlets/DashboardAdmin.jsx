import React, { useState, useEffect } from "react";
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import "bootstrap/dist/css/bootstrap.min.css";

function DashboardAdmin() {
  const [stats, setStats] = useState({});
  const [transactionData, setTransactionData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  
  const fetchStats = async()=>{
    try{
      const loadDataDashboard = await axios.get('https://toko369-be-production.up.railway.app/api/admin/fetch', {withCredentials: true});
      setStats(loadDataDashboard.data.stats);
      setTransactionData(loadDataDashboard.data.transactionData);
      setRecentTransactions(loadDataDashboard.data.recentTransactions);
    }
    catch(e){
      alert(e.response.data.message);
    }
  }
  useEffect(() => {
    fetchStats();
  }, [])

  return (
    <div className="container mt-4">
      {/* Custom CSS untuk perbaikan tampilan responsif */}
      <style>
        {`
          /* Statistik Card */
          .stat-card {
            margin-bottom: 1rem;
          }
          .stat-card .card {
            border: none;
            border-radius: 15px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
          }
          .stat-card .card:hover {
            transform: translateY(-3px);
          }
          /* Media Query untuk layar kecil */
          @media (max-width: 576px) {
            .stat-card {
              margin-bottom: 1.5rem;
            }
            .stat-card .card h3 {
              font-size: 1.75rem;
            }
            .stat-card .card h5 {
              font-size: 1rem;
            }
          }
          /* Responsive adjustments for chart and recent transactions */
          .chart-card, .recent-transactions-card {
            margin-bottom: 1rem;
          }
        `}
      </style>
      
      <h2 className="mb-4">Admin Dashboard</h2>
      
      {/* Statistik utama */}
      <div className="row">
        {[
          { label: "Products", value: stats.product, icon: "📦" },
          { label: "Transactions", value: stats.transactions, icon: "💰" },
          { label: "Users", value: stats.users, icon: "👤" },
          { label: "Revenue", value: `Rp ${stats.revenue}`, icon: "💵" },
        ].map((stat, index) => (
          <div key={index} className="col-6 col-md-3 stat-card">
            <div className="card shadow-sm p-3 text-center">
              <h5 className="mb-2">
                {stat.icon} {stat.label}
              </h5>
              <h3 className="text-primary">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Grafik transaksi dan daftar transaksi terbaru */}
      <div className="row mt-4">
        <div className="col-12 col-md-8 chart-card">
          <div className="card shadow-sm p-3">
            <h5>Monthly Transactions</h5>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={transactionData}>
                <XAxis dataKey="month" interval={0} tickFormatter={(month) => month.slice(0, 3)}/>
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#007bff" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="col-12 col-md-4 recent-transactions-card">
          <div className="card shadow-sm p-3">
            <h5>Recent Transactions</h5>
            <ul className="list-group">
              {recentTransactions.map((trx) => (
                <li key={trx.id} className="list-group-item d-flex justify-content-between">
                  <span>
                    <strong>{trx.name}</strong> - Rp {trx.total.toLocaleString()}
                  </span>
                  <span className={`badge ${trx.status === "Success" ? "bg-success" : trx.status === "Pending" ? "bg-warning" : "bg-danger"}`}>
                    {trx.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardAdmin;
