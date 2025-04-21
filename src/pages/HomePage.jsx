import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DropdownCategories from './components/DropdownCategories';
import Catalog from './components/Catalog';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SearchBar from './components/SearchBar';
import CartPage from './CartPage';
import { Offcanvas } from 'react-bootstrap';
import './css/HomePage.css'; // custom styling

function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [userRole, setUserRole] = useState("admin");
  const [dataProduct, setDataProduct] = useState([]);
  const [dataCategory, setDataCategory] = useState([]);
  const [dataCart, setDataCart] = useState({ items: [] });
  const [onSearch, setOnSearch] = useState(false);
  const [productExist, setProductExist] = useState(false);
  const [loadData, setLoadData] = useState(false);
  const [showCart, setShowCart] = useState(false);

  // Fungsi untuk update cart
  const updateCart = async () => {
    try {
      const cartRes = await axios.get(
        "https://toko369-be-production.up.railway.app/api/cart/fetch",
        { withCredentials: true }
      );
      setDataCart({
        user_id: cartRes.data.user_id,
        items: cartRes.data.items.map(i => ({ ...i, quantity: i.quantity || 1 }))
      });
    } catch (e) {
      console.error("Error fetching cart:", e);
    }
  };

  // Load produk dan kategori awal + verifikasi user
  useEffect(() => {
    const loadInitial = async () => {
      try {
        const verifyToken = await axios.get(
          "https://toko369-be-production.up.railway.app/api/auth/verifyUser",
          { withCredentials: true }
        );
        setUserRole(verifyToken.data.role);

        const [prodRes, catRes] = await Promise.all([
          axios.get(
            "https://toko369-be-production.up.railway.app/api/product/fetch/status",
            { withCredentials: true }
          ),
          axios.get(
            "https://toko369-be-production.up.railway.app/api/category/fetch",
            { withCredentials: true }
          )
        ]);

        setDataProduct(prodRes.data);
        setDataCategory(catRes.data);
      } catch (e) {
        const msg = e.response?.data?.message || e.message;
        if (msg.includes("No token provided")) {
          alert(msg + " Silahkan login terlebih dahulu!");
          navigate('/');
        } else {
          alert("Error while fetching data: " + msg);
        }
      }
    };
    loadInitial();
  }, [navigate]);

  // Update cart setiap loadData berubah
  useEffect(() => {
    updateCart();
  }, [loadData]);

  return (
    <>
      <Navbar
        setSearchQuery={setSearchQuery}
        setSelectedCategory={setSelectedCategory}
        selectedCategory={selectedCategory}
        setOnSearch={setOnSearch}
        userRole={userRole}
        showSearchBar={false}
      />

      <SearchBar
        setSearchQuery={setSearchQuery}
        setSelectedCategory={setSelectedCategory}
        selectedCategory={selectedCategory}
        setOnSearch={setOnSearch}
      />

      {productExist && (
        <DropdownCategories
          setSelectedCategory={setSelectedCategory}
          selectedCategory={selectedCategory}
          dataCategory={dataCategory}
        />
      )}

      <Catalog
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        dataProduct={dataProduct}
        onSearch={onSearch}
        setOnSearch={setOnSearch}
        setProductExist={setProductExist}
        setLoadData={prev => setLoadData(!prev)}
        updateCart={updateCart}
      />

      {/* Spacer untuk menghindari tumpang tindih tombol keranjang */}
      <div style={{ height: '60px' }} />

      {/* Tombol Keranjang (tampil di semua layar) */}
      <button
        className="btn btn-primary position-fixed bottom-0 sticky-cart-btn"
        style={{ zIndex: 1050 }}
        onClick={() => setShowCart(true)}
      >
        🛒 Lihat Keranjang ({dataCart.items.length})
      </button>

      {/* Offcanvas Keranjang */}
      <Offcanvas
        show={showCart}
        onHide={() => setShowCart(false)}
        placement="bottom"
        backdrop={true}
        scroll={true}
        style={{ height: '90vh' }}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Keranjang Kamu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body style={{ maxHeight: '85vh', overflowY: 'auto' }}>
          <CartPage
            loadData={loadData}
            setLoadData={setLoadData}
            updateCart={updateCart}
          />
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default HomePage;
