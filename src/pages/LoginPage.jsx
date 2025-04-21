import React, { useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useForm } from 'react-hook-form';
import { FaUser, FaLock } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try{
      const login = await axios.post("https://toko369-be-production.up.railway.app/api/auth/login", data, {withCredentials: true});
      if(login.data.admin){
        navigate('/admin');
      }
      else {
        navigate('/catalog');
      }
    }
    catch (e){
      alert(e.response.data.message + " Apabila belum punya akun, silahkan hubungi admin untuk pembuatan akun!");
    }
  };

  useEffect(() => {
    const verifyUser = async()=>{
      await axios.get('https://toko369-be-production.up.railway.app/api/auth/verifyUser', {withCredentials: true})
      .then(response => {
        if(response.data.role == "admin"){
          navigate('/admin')
        }
        else{
          navigate('/catalog')
        }
      })
      .catch(e=>{
        alert(e.response.data.message);
      })
    }
    verifyUser();
  }, [])

  return (
    <div
      className="d-flex align-items-center justify-content-center vh-100"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <style>
        {`
          .btn-signin:hover {
            background-color: #556cd6 !important;
          }
        `}
      </style>

      <div
        className="card p-4 shadow"
        style={{
          width: '400px',
          borderRadius: '15px',
          backgroundColor: 'rgba(255,255,255,0.9)',
        }}
      >
        <h2
          className="text-center mb-4"
          style={{ fontFamily: 'Poppins, sans-serif', color: '#333' }}
        >
          Toko 369
        </h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <div className="input-group">
              <span
                className="input-group-text"
                style={{
                  backgroundColor: '#667eea',
                  color: '#fff',
                  border: 'none',
                }}
              >
                <FaUser />
              </span>
              <input
                type="text"
                id="username"
                className="form-control"
                placeholder="Enter username"
                {...register('username', { required: 'Username wajib diisi' })}
                style={{ borderLeft: 'none' }}
              />
            </div>
            {errors.username && (
              <small className="text-danger">{errors.username.message}</small>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="input-group">
              <span
                className="input-group-text"
                style={{
                  backgroundColor: '#667eea',
                  color: '#fff',
                  border: 'none',
                }}
              >
                <FaLock />
              </span>
              <input
                type="password"
                id="password"
                className="form-control"
                placeholder="Enter password"
                {...register('password', { required: 'Password wajib diisi' })}
                style={{ borderLeft: 'none' }}
              />
            </div>
            {errors.password && (
              <small className="text-danger">{errors.password.message}</small>
            )}
          </div>

          <button
            type="submit"
            className="btn w-100 btn-signin"
            style={{
              backgroundColor: '#667eea',
              border: 'none',
              borderRadius: '50px',
              color: '#fff',
              padding: '10px',
              fontWeight: 'bold',
              transition: 'background-color 0.3s ease',
            }}
          >
            Sign In
          </button>
        </form>

        <div className="text-center mt-2">
          <span style={{ fontSize: '0.9rem', color: '#666' }}>
            Don't have an account?{' '}
            <a href="#" style={{ textDecoration: 'none', color: '#667eea' }}>
              Contact admin or Click here!
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;