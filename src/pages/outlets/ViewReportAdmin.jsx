import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function ViewReportAdmin() {
  // Data dummy laporan
  const [reports] = useState([
    {
      id: "RPT001",
      title: "Monthly Sales Report",
      date: "2023-08-01",
      description: "Laporan penjualan bulanan untuk bulan Juli.",
    },
    {
      id: "RPT002",
      title: "User Activity Report",
      date: "2023-08-05",
      description: "Laporan aktivitas pengguna selama 30 hari terakhir.",
    },
    {
      id: "RPT003",
      title: "Inventory Report",
      date: "2023-08-10",
      description: "Laporan stok dan inventory produk.",
    },
  ]);

  return (
    <div className="container my-5">
      <h2 className="mb-4">View Reports</h2>
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Reports List</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col">Report ID</th>
                  <th scope="col">Title</th>
                  <th scope="col">Date</th>
                  <th scope="col">Description</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id}>
                    <th scope="row">{report.id}</th>
                    <td>{report.title}</td>
                    <td>{report.date}</td>
                    <td>{report.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card-footer text-muted text-end">
          Total Reports: {reports.length}
        </div>
      </div>
    </div>
  );
}

export default ViewReportAdmin;