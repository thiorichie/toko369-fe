import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function Settings() {
  const [profile, setProfile] = useState({
    namaToko: "Toko Gading Murni", // ini statis
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Proses update profile, misalnya panggil API
    console.log("Profile updated:", profile);
    alert("Profile berhasil diperbarui!");
  };

  return (
    <div className="container my-5">
      <h2 className="mb-4">Profile Settings</h2>
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">Edit Profile</h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* Nama Toko: tampilkan statis */}
            <div className="mb-3">
              <label className="form-label">Nama Toko</label>
              <p className="form-control-plaintext">{profile.namaToko}</p>
            </div>
            {/* Editable Username */}
            <div className="mb-3">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                className="form-control"
                placeholder="Masukkan username"
                value={profile.username}
                onChange={handleChange}
              />
            </div>
            {/* Editable Password */}
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-control"
                placeholder="Masukkan password baru"
                value={profile.password}
                onChange={handleChange}
              />
            </div>
            <button type="submit" className="btn btn-success w-100">
              Save Profile
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Settings;
