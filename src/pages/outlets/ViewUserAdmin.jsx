import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table,
  Container,
  Button,
  Modal,
  Form,
  Spinner,
} from 'react-bootstrap';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const ViewUsersAdmin = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    hashedPassword: '',
    address: '',
    phone: '',
    role: '',
    store_name: '',
  });
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('https://toko369-be-production.up.railway.app/api/user/fetch', {
        withCredentials: true,
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Gagal fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      username: '',
      hashedPassword: '',
      address: '',
      phone: '',
      role: '',
      store_name: '',
    });
    setSelectedUserId('');
    setIsEdit(false);
  };

  const handleShowAdd = () => {
    setFormData({
      username: '',
      hashedPassword: '',
      address: '',
      phone: '',
      role: '',
      store_name: '',
    });
    setIsEdit(false);
    setShowModal(true);
  };

  const handleShowEdit = (user) => {
    setFormData({
      username: user.username,
      hashedPassword: '', // Kosongkan untuk edit
      address: user.address,
      phone: user.phone,
      role: user.role,
      store_name: user.store_name,
    });
    setSelectedUserId(user.user_id);
    setIsEdit(true);
    setShowModal(true);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    try {
      const dataToSend = { ...formData };

      if (isEdit) {
        if (!dataToSend.hashedPassword) {
          delete dataToSend.hashedPassword;
        }
        await axios.put(
          `https://toko369-be-production.up.railway.app/api/user/update/${selectedUserId}`,
          dataToSend,
          { withCredentials: true }
        );
        Swal.fire({
          title: 'Berhasil Diubah!',
          html: `Informasi user berhasil di ubah!`,
          icon: 'success',
          confirmButtonText: 'OK'
        });
      } else {
        await axios.post('https://toko369-be-production.up.railway.app/api/user/add', dataToSend, {
          withCredentials: true,
        });
        Swal.fire({
          title: 'Berhasil Diubah!',
          html: `Informasi user berhasil di ubah!`,
          icon: 'success',
          confirmButtonText: 'OK'
        });
      }

      fetchUsers();
      handleCloseModal();
    } catch (err) {
      console.error('Gagal simpan user', err);
      alert(err.response.data.message)
    }
  };

  return (
    <Container className="my-4">
      <h3 className="mb-4">👥 Manajemen Pengguna</h3>
      <Button variant="primary" className="mb-3" onClick={handleShowAdd}>
        Tambah User
      </Button>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : (
        <Table bordered hover responsive className="bg-white shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>User ID</th>
              <th>Username</th>
              <th>Store Name</th>
              <th>Address</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.user_id}>
                <td>{u.user_id}</td>
                <td>{u.username}</td>
                <td>{u.store_name}</td>
                <td>{u.address}</td>
                <td>{u.phone}</td>
                <td>{u.role === 'seller' ? 'Customer' : u.role}</td>
                <td>
                  <Button
                    size="sm"
                    variant="warning"
                    onClick={() => handleShowEdit(u)}
                  >
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal Add/Edit */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{isEdit ? 'Edit User' : 'Tambah User'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>{isEdit ? 'New Password' : 'Password'}</Form.Label>
            <Form.Control
              type="text"
              name="hashedPassword"
              placeholder={isEdit ? 'Kosongkan jika tidak ingin mengganti' : ''}
              value={formData.hashedPassword}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Store Name</Form.Label>
            <Form.Control
              type="text"
              name="store_name"
              value={formData.store_name}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Address</Form.Label>
            <Form.Control
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Phone</Form.Label>
            <Form.Control
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Role</Form.Label>
            <Form.Control
              as="select"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="">-- Pilih Role --</option>
              <option value="admin">Admin</option>
              <option value="seller">Customer</option>
            </Form.Control>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Simpan
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ViewUsersAdmin;