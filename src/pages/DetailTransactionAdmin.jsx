import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Table, Button, Container, Form, Row, Col } from 'react-bootstrap';
import Swal from 'sweetalert2';

const DetailTransactionAdmin = () => {
  const { id } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    product_id: '',
    unit: '',
    price: '',
    quantity: 1,
  });
  const navigate = useNavigate();

  const [availableUnits, setAvailableUnits] = useState([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [canConfirm, setCanConfirm] = useState(true); // NEW: kontrol tombol konfirmasi

  useEffect(() => {
    fetchTransaction();
  }, []);

  const fetchTransaction = async () => {
    try {
      const res = await axios.get(`https://toko369-be-production.up.railway.app/api/transaction/fetch/${id}`, { withCredentials: true });
      const productDetails = await axios.get('https://toko369-be-production.up.railway.app/api/product/fetch', { withCredentials: true });
      setTransaction(res.data);
      setProducts(productDetails.data);
      setCanConfirm(false); // NEW: reset tombol konfirmasi saat data diambil
    } catch (err) {
      console.error('Gagal ambil transaksi', err);
    }
  };

  useEffect(() => {
    if (newProduct.product_id) {
      const selectedProduct = products.find(p => p.product_id === newProduct.product_id);
      if (selectedProduct) {
        const units = selectedProduct.units.map(unit => unit.unit);
        setAvailableUnits(units);
        setNewProduct(prevState => ({
          ...prevState,
          unit: units.length > 0 ? units[0] : '',
          price: selectedProduct.units[0]?.price || '',
        }));
      }
    }
  }, [newProduct.product_id, products]);

  const handleProductChange = (productId) => {
    setIsAddingProduct(true);
    setNewProduct({
      ...newProduct,
      product_id: productId,
      unit: '',
      price: '',
    });
    setCanConfirm(false);
  };

  const handleUnitChange = (unit) => {
    const selectedProduct = products.find(p => p.product_id === newProduct.product_id);
    const selectedUnit = selectedProduct?.units.find(u => u.unit === unit);
    const price = selectedUnit ? selectedUnit.price : '';
    setNewProduct({ ...newProduct, unit, price });
  };

  const handleAddProduct = () => {
    if (!newProduct.product_id || !newProduct.unit || !newProduct.price || !newProduct.quantity) return;

    const exists = transaction.items.find(item =>
      item.product_id === newProduct.product_id && item.unit === newProduct.unit
    );

    if (exists) {
      exists.quantity += parseInt(newProduct.quantity);
    } else {
      transaction.items.push({
        product_id: newProduct.product_id,
        unit: newProduct.unit,
        price: parseInt(newProduct.price),
        quantity: parseInt(newProduct.quantity),
      });
    }

    setTransaction({ ...transaction });
    setNewProduct({ product_id: '', unit: '', price: '', quantity: 1 });
    setAvailableUnits([]);
    setCanConfirm(false); // NEW: disable tombol konfirmasi setelah tambah produk
    setIsUpdating(true);
  };

  const handleCancelAddProduct = () => {
    setNewProduct({ product_id: '', unit: '', price: '', quantity: 1 });
    setAvailableUnits([]);
    setIsAddingProduct(false);
    fetchTransaction();
    setCanConfirm(true);
    setIsUpdating(false)
  };

  const getProductName = (id) => {
    return products.find(p => p.product_id === id)?.name || 'Tidak ditemukan';
  };

  const getTotal = () => {
    return transaction.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  };

  const handleQuantityChange = (index, value) => {
    const newItems = [...transaction.items];
    newItems[index].quantity = parseInt(value);
    setTransaction({ ...transaction, items: newItems });
    setIsUpdating(true)
    setCanConfirm(false); // NEW: perubahan data disable tombol konfirmasi
  };

  const handlePriceChange = (index, value) => {
    const newItems = [...transaction.items];
    newItems[index].price = parseInt(value);
    setTransaction({ ...transaction, items: newItems });
    setIsUpdating(true)
    setCanConfirm(false); // NEW: perubahan data disable tombol konfirmasi
  };

  const handleRemoveItem = (index) => {
    const newItems = [...transaction.items];
    newItems.splice(index, 1);
    setTransaction({ ...transaction, items: newItems });
    setCanConfirm(true);
    console.log("done")
    setIsUpdating(true);
  };

  const handleUpdate = async () => {
    const confirm = await Swal.fire({
      title: 'Yakin ingin mengubah detail transaksi?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, ubah',
      cancelButtonText: 'Batal'
    });

    if (confirm.isConfirmed) {
      try {
        await axios.put(`https://toko369-be-production.up.railway.app/api/transaction/update/${id}`, {
          items: transaction.items,
          total: getTotal(),
        }, { withCredentials: true });

        const getName = await axios.get(`https://toko369-be-production.up.railway.app/api/user/fetch/${transaction.user_id}`, { withCredentials: true });
        Swal.fire({
          title: 'Berhasil Diubah!',
          html: `Silakan hubungi customer di nomor <strong>${getName.data.phone}</strong> untuk menginformasikan perubahan transaksi.`,
          icon: 'info',
          confirmButtonText: 'OK'
        });

        setCanConfirm(false); // NEW: hanya enable konfirmasi jika update berhasil
        fetchTransaction();
      } catch (err) {
        console.log('Gagal update transaksi', err);
        Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: `Gagal mengupdate Detail transaksi: ${err.response?.data?.message || err.message}`,
          customClass: {
            popup: 'rounded-4'
          }
        });
      }
    }
  };

  const handleConfirm = async () => {
    try {
      await axios.put(`https://toko369-be-production.up.railway.app/api/transaction/confirm/${id}`, {}, { withCredentials: true });
      Swal.fire({
            icon: 'success',
            title: 'Terkonfirmasi!',
            html: `Transaksi sukses! Status transaksi diupdate menjadi <strong>Success</strong>".`,
            timer: 1500,
            showConfirmButton: false,
            customClass: {
                popup: 'rounded-4'
            }
        });
      fetchTransaction();
    } catch (err) {
      console.error('Gagal konfirmasi transaksi', err);
    }
  };

  if (!transaction) return <p>Memuat detail transaksi...</p>;

  return (
    <Container className="my-4">
        <Button variant="outline-secondary" onClick={() => navigate('../transactions')}>
            ← Kembali ke Transaksi
        </Button>
      <h3>Detail Transaksi #{transaction.transaction_id}</h3>
      <Table bordered responsive hover className="mt-3">
        <thead className="table-dark">
          <tr>
            <th>ID Produk</th>
            <th>Nama Produk</th>
            <th>Unit</th>
            <th>Harga (Rp)</th>
            <th>Qty</th>
            <th>Total Item</th>
            {transaction.status === 'Pending' && <th>Aksi</th>}
          </tr>
        </thead>
        <tbody>
          {transaction.items.map((item, idx) => (
            <tr key={idx}>
              <td>{item.product_id}</td>
              <td>{getProductName(item.product_id)}</td>
              <td>{item.unit}</td>
              <td>
                {transaction.status === 'Pending' ? (
                  <Form.Control
                    type="number"
                    min="0"
                    value={item.price}
                    onChange={(e) => handlePriceChange(idx, e.target.value)}
                  />
                ) : (
                  `Rp ${item.price.toLocaleString('id-ID')}`
                )}
              </td>
              <td>
                {transaction.status === 'Pending' ? (
                  <Form.Control
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(idx, e.target.value)}
                  />
                ) : (
                  item.quantity
                )}
              </td>
              <td>Rp {(item.quantity * item.price).toLocaleString('id-ID')}</td>
              {transaction.status === 'Pending' && (
                <td><Button variant="danger" onClick={() => handleRemoveItem(idx)}>Cancel Item</Button></td>
              )}
            </tr>
          ))}
        </tbody>
      </Table>
      <h5>Catatan dari Customer:</h5>
      <h6 style={{color: "red"}}>{transaction.note}</h6>
      <h5>Total Transaksi: Rp {getTotal().toLocaleString('id-ID')}</h5>

      {transaction.status === 'Pending' && (
        <>
          <hr />
          <h5>Tambah Produk ke Transaksi</h5>
          <Row className="mb-3">
            <Col md={3}>
              <Form.Select
                value={newProduct.product_id}
                onChange={(e) => handleProductChange(e.target.value)}
              >
                <option value="">Pilih Produk</option>
                {products.map((product, idx) => (
                  <option key={idx} value={product.product_id}>{product.name}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select
                value={newProduct.unit}
                onChange={(e) => handleUnitChange(e.target.value)}
                disabled={!newProduct.product_id}
              >
                <option value="">Pilih Unit</option>
                {availableUnits.map((unit, idx) => (
                  <option key={idx} value={unit}>{unit}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Control
                type="number"
                placeholder="Harga"
                value={newProduct.price}
                readOnly
                disabled={!newProduct.unit}
              />
            </Col>
            <Col md={2}>
              <Form.Control
                type="number"
                placeholder="Qty"
                value={newProduct.quantity}
                onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                disabled={!newProduct.unit}
              />
            </Col>
            <Col md={2}>
              <Button
                onClick={handleAddProduct}
                disabled={!newProduct.product_id || !newProduct.unit || !newProduct.price || !newProduct.quantity}
              >
                Tambah
              </Button>
            </Col>
          </Row>
          <Button variant="secondary" onClick={handleCancelAddProduct}>Cancel</Button>
        </>
      )}

      <div className="d-flex justify-content-between mt-4">
        {transaction.status === 'Pending' ? (
          <Button variant="Success" onClick={handleUpdate} disabled={!isUpdating}>Update Transaksi</Button>
        ) : (
          <Button variant="Success" disabled>Transaksi Dikemas</Button>
        )}
        {transaction.status === 'Pending' && (
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={canConfirm || isAddingProduct} // NEW: hanya enable jika update berhasil
          >
            Konfirmasi Transaksi
          </Button>
        )}
      </div>
    </Container>
  );
};

export default DetailTransactionAdmin;