import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { useForm } from "react-hook-form";
import { FaUserCircle, FaHome } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const Navbar = ({ setSearchQuery, userRole }) => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const onSubmit = (data) => {
    setSearchQuery(data.search);
  };

  const handleLogout = async () => {
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
        await axios.get("https://toko369-be-production.up.railway.app/api/auth/logout", {
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
        navigate("/");
      } catch (error) {
        console.error("Gagal logout:", error);
      }
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm px-4 py-3">
      <div className="container-fluid">
        {/* Nama Toko */}
        <a
          className="navbar-brand fw-bold fs-3 text-black"
          style={{ fontFamily: "Cormorant Garamond, serif" }}
        >
          Toko 369
        </a>

        {/* Toggle Button for Mobile */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          {/* Search Bar */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="d-flex mx-auto position-relative my-2 my-lg-0"
            style={{ maxWidth: "1000px", width: "100%" }}
          >
            <input
              className="form-control rounded-pill ps-3 pe-5 shadow-sm border-0 bg-light"
              type="search"
              placeholder="Search nama produk.."
              aria-label="Search"
              {...register("search")}
            />
            <button
              className="btn position-absolute end-0 top-0 mt-1 me-2 text-muted border-0"
              type="submit"
            >
              <i className="bi bi-search"></i>
            </button>
          </form>

          {/* Buttons Group: Home, Cart, Check Transaction, & Profile */}
          <div className="d-flex flex-column flex-lg-row gap-2 gap-lg-3 ms-auto">
            {/* Home Button */}
            <button
              className="btn rounded-pill shadow-sm border-0 px-3 d-flex align-items-center justify-content-center"
              style={{
                transition: "all 0.3s",
                backgroundColor: "lightgray",
                color: "black",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "black";
                e.currentTarget.style.color = "white";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "lightgray";
                e.currentTarget.style.color = "black";
              }}
              onClick={() => navigate("/home")}
            >
              <FaHome className="fs-5 me-2" /> Beranda
            </button>

            {/* Cart */}
            <button
              className="btn rounded-pill shadow-sm border-0 px-3 d-flex align-items-center justify-content-center"
              style={{
                transition: "all 0.3s",
                backgroundColor: "lightgray",
                color: "black",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "black";
                e.currentTarget.style.color = "white";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "lightgray";
                e.currentTarget.style.color = "black";
              }}
              onClick={() => navigate("/cart")}
            >
              <i className="bi bi-cart3 fs-5 me-2"></i> Keranjang
            </button>

            {/* Check Transaction */}
            <button
              className="btn rounded-pill shadow-sm border-0 px-3 d-flex align-items-center justify-content-center"
              style={{
                transition: "all 0.3s",
                backgroundColor: "lightgray",
                color: "black",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "black";
                e.currentTarget.style.color = "white";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "lightgray";
                e.currentTarget.style.color = "black";
              }}
              onClick={() => navigate("/transaction")}
            >
              <i className="bi bi-receipt fs-5 me-2"></i> Cek Transaksi
            </button>

            {/* Profile */}
            <button
              className="btn rounded-pill shadow-sm border-0 px-3 d-flex align-items-center justify-content-center"
              style={{
                transition: "all 0.3s",
                backgroundColor: "lightgray",
                color: "black",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "black";
                e.currentTarget.style.color = "white";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "lightgray";
                e.currentTarget.style.color = "black";
              }}
              onClick={() => navigate("/profile")}
            >
              <i className="bi bi-person fs-5 me-2"></i> Profil
            </button>

            {/* Admin Page - Only if Admin */}
            {userRole === "admin" && (
              <button
                className="btn rounded-pill shadow-sm border-0 px-3 d-flex align-items-center justify-content-center"
                style={{
                  transition: "all 0.3s",
                  backgroundColor: "lightgray",
                  color: "black",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "black";
                  e.currentTarget.style.color = "white";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "lightgray";
                  e.currentTarget.style.color = "black";
                }}
                onClick={() => navigate("/admin")}
              >
                <i className="bi bi-gear fs-5 me-2"></i> Admin Page
              </button>
            )}

            {/* Logout */}
            <button
              className="btn btn-danger rounded-pill shadow-sm border-0 px-3 d-flex align-items-center justify-content-center"
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right fs-5 me-2"></i> Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;