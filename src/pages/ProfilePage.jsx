import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaStore, FaMapMarkerAlt, FaPhone } from "react-icons/fa";
import Navbar from "./components/Navbar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

function ProfilePage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const load = async () => {
    try {
      const loadDataUser = await axios.get(
        "https://toko369-be-production.up.railway.app/api/user/profile/fetch",
        { withCredentials: true }
      );
      const { store_name, address, phone } = loadDataUser.data;
      reset({
        namaToko: store_name,
        alamat: address,
        nomorTelepon: phone,
      });
    } catch (e) {
      const message = e?.response?.data?.message || "";

      if (message.toLowerCase().includes("no token provided")) {
        alert(message + " Silakan login terlebih dahulu!");
        navigate("/");
      } else {
        alert(message || "Terjadi kesalahan.");
      }
    }
  };

  const onSubmit = async (data) => {
    const result = await Swal.fire({
      title: 'KONFIRMASI',
      text: "Yakin ingin mengganti informasi anda? Data yang telah diganti tidak dapat kembali.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya',
      cancelButtonText: 'Batal',
      customClass: {
        popup: 'rounded-4',
        title: 'fs-5',
        confirmButton: 'btn btn-danger mx-2',
        cancelButton: 'btn btn-secondary mx-2'
      },
      buttonsStyling: false
    });

    if(result.isConfirmed){
      try {
        const response = await axios.put(
          "https://toko369-be-production.up.railway.app/api/user/update",
          data,
          {withCredentials: true}
        );
        await Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Informasi user berhasil diupdate!',
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            popup: 'rounded-4'
          }
        });
        load();
      } catch (error) {
        console.error(error)
        Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: 'Gagal meng-update informasi user! Silakan coba lagi.',
          customClass: {
            popup: 'rounded-4'
          }
        });
      }
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <Navbar showSearchBar={false}/>
      <div className="container mt-5 d-flex justify-content-center">
        <style>
          {`
            .profile-card {
              border: none;
              border-radius: 15px;
              overflow: hidden;
              box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
              max-width: 500px;
              width: 100%;
            }
            .profile-header {
              background-color: #667eea;
              padding: 20px;
              text-align: center;
              color: #fff;
            }
            .profile-header h3 {
              margin: 0;
              font-family: 'Poppins', sans-serif;
            }
            .profile-body {
              background-color: #fff;
              padding: 30px;
            }
            .profile-icon {
              font-size: 1.2rem;
              margin-right: 8px;
              color: #667eea;
            }
            .form-label {
              font-weight: 600;
            }
            .update-btn {
              background-color: #667eea;
              border: none;
              border-radius: 50px;
              font-weight: bold;
              transition: background-color 0.3s ease;
            }
            .update-btn:hover {
              background-color: #556cd6;
            }
          `}
        </style>
        <div className="card profile-card">
          <div className="profile-header">
            <h3>Profile</h3>
            <p style={{ marginBottom: 0 }}>
              Ubah informasi toko anda dengan mengganti informasi yang ada di bawah, lalu klik tombol "Update Profile"
            </p>
          </div>
          <div className="profile-body">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-3">
                <label htmlFor="namaToko" className="form-label">
                  <FaStore className="profile-icon" /> Nama Toko
                </label>
                <input
                  type="text"
                  id="namaToko"
                  className="form-control"
                  placeholder="Masukkan nama toko"
                  {...register("namaToko", { required: "Nama toko wajib diisi" })}
                />
                {errors.namaToko && <small className="text-danger">{errors.namaToko.message}</small>}
              </div>
              <div className="mb-3">
                <label htmlFor="alamat" className="form-label">
                  <FaMapMarkerAlt className="profile-icon" /> Alamat
                </label>
                <textarea
                  id="alamat"
                  className="form-control"
                  placeholder="Masukkan alamat toko"
                  rows="3"
                  {...register("alamat", { required: "Alamat wajib diisi" })}
                ></textarea>
                {errors.alamat && <small className="text-danger">{errors.alamat.message}</small>}
              </div>
              <div className="mb-3">
                <label htmlFor="nomorTelepon" className="form-label">
                  <FaPhone className="profile-icon" /> Nomor Telepon
                </label>
                <input
                  type="tel"
                  id="nomorTelepon"
                  className="form-control"
                  placeholder="Masukkan nomor telepon"
                  {...register("nomorTelepon", { required: "Nomor telepon wajib diisi" })}
                />
                {errors.nomorTelepon && <small className="text-danger">{errors.nomorTelepon.message}</small>}
              </div>
              <button type="submit" className="btn btn-primary w-100 update-btn">
                Update Profile
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;