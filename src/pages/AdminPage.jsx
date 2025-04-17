import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import axios from 'axios';
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

function AdminPage() {
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(false);

  const toggleSidebar = () => {
    setShowSidebar((prev) => !prev);
  };

  // Saat navigasi, sembunyikan sidebar (untuk tampilan mobile)
  const handleNav = (path) => {
    navigate(path);
    setShowSidebar(false);
  };

  useEffect(() => {
    const verifyAdmin = async() => {
      await axios.get('https://toko369-be-production.up.railway.app/api/auth/verifyUser', {withCredentials: true})
      .then(response => {
        if(response.data.role != "admin")
        {
          alert('Anda tidak memiliki akses ke halaman ini!');
          navigate('/home')
        }
      })
      .catch(e => {
        alert(e.response.data.message + " Silahkan login terlebih dahulu.");
        navigate('/')
      })
    }

    verifyAdmin();
  },[]);

  return (
    <div className="d-flex flex-column flex-md-row">
      {/* Header untuk tampilan mobile */}
      <div className="d-md-none bg-dark text-white p-3">
        <button className="btn btn-dark" onClick={toggleSidebar}>
          ☰ Menu
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`sidebar bg-dark text-white p-3 ${
          showSidebar ? "d-block" : "d-none"
        } d-md-block`}
        style={{ width: "250px", minHeight: "100vh" }}
      >
        <h4 className="text-center mb-4">Admin Panel</h4>
        <ul className="nav flex-column">
          <li className="nav-item">
            <button
              className="btn btn-dark w-100 text-start"
              onClick={() => handleNav("/admin/dashboard")}
            >
              Dashboard
            </button>
          </li>
          <li className="nav-item">
            <button
              className="btn btn-dark w-100 text-start"
              onClick={() => handleNav("/admin/products")}
            >
              View Products
            </button>
          </li>
          <li className="nav-item">
            <button
              className="btn btn-dark w-100 text-start"
              onClick={() => handleNav("/admin/transactions")}
            >
              View Transactions
            </button>
          </li>
          <li className="nav-item">
            <button
              className="btn btn-dark w-100 text-start"
              onClick={() => handleNav("/admin/users")}
            >
              View Users
            </button>
          </li>
          {/* Uncomment jika diperlukan */}
          {/* <li className="nav-item">
            <button className="btn btn-dark w-100 text-start" onClick={() => handleNav("/admin/reports")}>
              Reports
            </button>
          </li> */}
          {/* <li className="nav-item">
            <button
              className="btn btn-dark w-100 text-start"
              onClick={() => handleNav("/admin/settings")}
            >
              Settings
            </button>
          </li> */}
          <li className="nav-item">
            <button
              className="btn btn-dark w-100 text-start"
              onClick={() => handleNav("/home")}
            >
              Go to HomePage
            </button>
          </li>
          <li className="nav-item mt-3">
            <button
              className="btn btn-danger w-100"
              onClick={async () => {
                const confirm = await Swal.fire({
                  title: 'KONFIRMASI',
                  text: 'Yakin ingin log out?',
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonColor: '#d33',
                  cancelButtonColor: '#3085d6',
                  confirmButtonText: 'Ya, log out!',
                  cancelButtonText: 'Batal',
                });
                if(confirm.isConfirmed){
                  try {
                    await axios.get('https://toko369-be-production.up.railway.app/api/auth/logout', {
                      withCredentials: true,
                    });
                    await Swal.fire({
                      icon: 'success',
                      title: 'Logout!',
                      text: 'Berhasil logout!',
                      timer: 1500,
                      showConfirmButton: false,
                      customClass: {
                        popup: 'rounded-4'
                      }
                    });
                    navigate('/');
                  } catch (error) {
                    alert('Logout gagal. Silakan coba lagi.');
                    console.error('Logout error:', error);
                  }
                }
              }}
            >
              Logout
            </button>
          </li>
        </ul>
      </div>

      {/* Content */}
      <div className="content p-4" style={{ flex: 1 }}>
        <Outlet />
      </div>
    </div>
  );
}

export default AdminPage;
