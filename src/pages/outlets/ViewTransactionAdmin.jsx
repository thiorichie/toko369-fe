import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table, Badge, Container, Spinner, Button, Form, Row, Col,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaStore } from 'react-icons/fa';
import { MdPerson } from 'react-icons/md';

const ViewTransactionsAdmin = () => {
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const loadDataTransaction = await axios.get('https://toko369-be-production.up.railway.app/api/transaction/fetch', { withCredentials: true });
      const loadDataUser = await axios.get('https://toko369-be-production.up.railway.app/api/user/fetch', { withCredentials: true });
      setTransactions(loadDataTransaction.data);
      setUsers(loadDataUser.data);
    } catch (err) {
      console.error('Gagal ambil transaksi', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variant = {
      success: 'success',
      pending: 'warning',
      failed: 'danger',
    }[status.toLowerCase()] || 'secondary';

    return <Badge bg={variant} className="text-capitalize">{status}</Badge>;
  };

  const handleSearch = (e) => setSearchTerm(e.target.value);
  const handleStatusFilter = (e) => setStatusFilter(e.target.value);

  const filteredTransactions = transactions.filter((trx) => {
    const user = users.find((u) => u.user_id === trx.user_id);
    const storeName = user?.store_name?.toLowerCase() || '';
    const username = user?.username?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();

    const matchesSearch = storeName.includes(search) || username.includes(search);
    const matchesStatus = statusFilter === 'all' || trx.status.toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <Container className="my-4">
      <h3 className="mb-4">📋 Daftar Transaksi</h3>

      {/* Filter & Search */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Control
            type="text"
            placeholder="Cari berdasarkan nama toko atau username..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </Col>
        <Col md={3}>
          <Form.Select value={statusFilter} onChange={handleStatusFilter}>
            <option value="all">Semua Status</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </Form.Select>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center"><Spinner animation="border" /></div>
      ) : (
        <Table hover responsive bordered className="shadow-sm rounded bg-white">
          <thead className="table-dark">
            <tr>
              <th>ID Transaksi</th>
              <th><FaStore className="me-1" />Nama Toko & <MdPerson className="me-1" />Username</th>
              <th>Total (Rp)</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-muted">
                  Tidak ada transaksi yang ditemukan.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((trx) => {
                const user = users.find((u) => u.user_id === trx.user_id);
                return (
                  <tr key={trx.transaction_id}>
                    <td>{trx.transaction_id}</td>
                    <td>
                      <strong>{user?.store_name || 'Nama Toko Tidak Ditemukan'}</strong><br />
                      <small className="text-muted">{user?.username || 'Username Tidak Ditemukan'}</small>
                    </td>
                    <td>Rp {trx.total.toLocaleString('id-ID')}</td>
                    <td>{getStatusBadge(trx.status)}</td>
                    <td>
                      <Button
                        variant="info"
                        size="sm"
                        onClick={() => navigate(`./${trx.transaction_id}`)}
                      >
                        Detail
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default ViewTransactionsAdmin;