import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "./components/Navbar";
import axios from 'axios';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { useNavigate } from "react-router-dom";

function CartPage() {
  const [cartItems, setCartItems] = useState({ items: [] });
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const navigate = useNavigate();

  const load = async () => {
    try {
      const res = await axios.get("https://toko369-be-production.up.railway.app/api/cart/fetch", {
        withCredentials: true,
      });

      const itemsWithQuantity = res.data.items.map(item => ({
        ...item,
        quantity: item.quantity || 1
      }));
      setCartItems({ user_id: res.data.user_id, items: itemsWithQuantity });
    } catch (e) {
      alert(e.response?.data?.message + " Hubungi admin apabila error!");
      if(e.response.data.message.includes("No token provided")){
        navigate('/')
      }
    }
  };

  const removeItem = async (id) => {
    const result = await Swal.fire({
      title: 'Yakin ingin menghapus produk ini?',
      text: "Tindakan ini tidak dapat dibatalkan.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal',
      customClass: {
        popup: 'rounded-4',
        title: 'fs-5',
        confirmButton: 'btn btn-danger mx-2',
        cancelButton: 'btn btn-secondary mx-2'
      },
      buttonsStyling: false
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`https://toko369-be-production.up.railway.app/api/cart/item/${id}`, {withCredentials: true})
        await Swal.fire({
          icon: 'success',
          title: 'Dihapus!',
          text: 'Item berhasil dihapus dari keranjang.',
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            popup: 'rounded-4'
          }
        });
        load()
      } catch (e) {
        console.log(e)
        Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: 'Gagal menghapus item. Silakan coba lagi.',
          customClass: {
            popup: 'rounded-4'
          }
        });
      }
    }
  };

  const showPopUp = async(name) => {
    const result = await Swal.fire({
      title: 'PERINGATAN!',
      text: `Quantity harus di isi minimal 1! Quantity produk "${name}" akan otomatis dirubah menjadi 1 karena inputan tidak sesuai.`,
      icon: 'warning',
      showCancelButton: false,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, saya mengerti.',
      customClass: {
        popup: 'rounded-4',
        title: 'fs-5',
        confirmButton: 'btn btn-danger mx-2',
      },
      buttonsStyling: false
    });
  }

  const updateQuantity = async(id, newQuantity) => {
    setCartItems((prevCart) => ({
      ...prevCart,
      items: prevCart.items.map((item) =>
        item.product_id === id ? { ...item, quantity: newQuantity } : item
      )
    }));

    try {
      await axios.put(`https://toko369-be-production.up.railway.app/api/cart/item/${id}/quantity`, {quantity: newQuantity}, {withCredentials: true});
    }
    catch (e) {
      alert(e.response.data.message);
    }
  };
  const updateQuantity2 = async(id, newQuantity) => {
    setCartItems((prevCart) => ({
      ...prevCart,
      items: prevCart.items.map((item) =>
        item.product_id === id ? { ...item, quantity: newQuantity } : item
      )
    }));
  };

  const totalPrice = cartItems.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const handleCheckout = async () => {
    // if (!paymentMethod) {
    //   alert("Silakan pilih metode pembayaran terlebih dahulu!");
    //   return;
    // }

    // alert(`Checkout berhasil dengan metode pembayaran: ${paymentMethod}`);

    const result = await Swal.fire({
      title: 'KONFIRMASI',
      text: "Yakin ingin melanjutkan transaksi ini? Tindakan ini tidak dapat dibatalkan.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'green',
      cancelButtonColor: 'red',
      confirmButtonText: 'Ya',
      cancelButtonText: 'Batal',
      customClass: {
        popup: 'rounded-4',
        title: 'fs-5',
        confirmButton: 'btn btn-success mx-2',
        cancelButton: 'btn btn-danger mx-2'
      },
      buttonsStyling: true
    });

    if (result.isConfirmed) {
      try {
        const createTransaction = await axios.post(`https://toko369-be-production.up.railway.app/api/transaction/add`, {}, {withCredentials: true}); 
        const clearCart = await axios.put('https://toko369-be-production.up.railway.app/api/cart/item/clear', {}, {withCredentials: true});
        load();
        await Swal.fire({
          icon: 'success',
          title: 'Berhasil Check Out!',
          text: 'Transaksi berhasil dibuat!',
          html: '<div style="margin-top: 8px; color: gray;">\nTerima kasih telah berbelanja di toko kami. Untuk cek status & informasi transaksi, silahkan cek di halaman Cek Transaksi.\nKonfirmasi ke admin apabila transaksi belum di proses setelah 24 Jam.</div>',
          timer: 3500,
          showConfirmButton: false,
          customClass: {
            popup: 'rounded-4'
          }
        });
      } catch (e) {
        console.log(e)
        Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: 'Gagal melanjutkan transaksi! Silakan coba lagi.',
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
      <Navbar />
      <div className="container my-5">
        <style>
          {`
            .cart-item {
                border: 1px solid #e0e0e0;
                border-radius: 10px;
                transition: box-shadow 0.3s ease;
                padding: 15px;
                margin-bottom: 20px;
            }
            .cart-item:hover {
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            .quantity-input {
                width: 70px;
                text-align: center;
            }
            .order-summary {
                border: 1px solid #e0e0e0;
                border-radius: 10px;
                padding: 20px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            }
          `}
        </style>

        <h2 className="mb-4 text-center">Your Cart</h2>
        {cartItems.items.length === 0 ? (
          <p className="text-center">Your cart is empty.</p>
        ) : (
          <div className="row">
            <div className="col-lg-8 col-md-12">
              {cartItems.items.map((item) => (
                <div key={item.product_id} className="cart-item">
                  <div className="row align-items-center">
                    <div className="col-6 col-sm-4">
                      <h5 className="mb-1">{item.name}</h5>
                      <p className="mb-0 text-muted">
                        Price: Rp {item.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="col-3 col-sm-3 d-flex align-items-center">
                      <input
                        type="number"
                        className="form-control quantity-input"
                        value={item.quantity}
                        min={1}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (value > 0 || !isNaN(value)) {
                            updateQuantity(item.product_id, value);
                          }
                          else if(isNaN(value)){
                            updateQuantity2(item.product_id, value)
                          }
                        }}
                        onBlur={(e) => {
                          if (parseInt(e.target.value) <= 0 || isNaN(e.target.value) || e.target.value == "") {
                            showPopUp(item.name);
                            updateQuantity(item.product_id, 1);
                            e.target.value = 1;
                          }
                        }}
                      />
                    </div>
                    <div className="col-3 col-sm-3 text-end">
                      <p className="mb-0 fw-bold">
                        Rp {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                    <div className="col-12 col-sm-2 text-end mt-2 mt-sm-0">
                      <button
                        className="btn btn-outline-danger btn-sm w-100"
                        onClick={() => removeItem(item.product_id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="col-lg-4 col-md-12 mt-4 mt-lg-0">
              <div className="order-summary">
                <h4 className="mb-3 text-center">Order Summary</h4>
                <hr />
                <div className="mb-3">
                  <label className="form-label">Metode Pembayaran</label>
                  <select
                    className="form-select"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    disabled
                  >
                    <option value="COD">Cash on Delivery (COD)</option>
                  </select>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span>Total Price:</span>
                  <strong>Rp {totalPrice.toLocaleString()}</strong>
                </div>
                <button
                  className="btn btn-success w-100 py-2"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartPage;