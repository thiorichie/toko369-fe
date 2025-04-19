import React, { useEffect, useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import '../css/swal.css';
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useForm, useFieldArray } from 'react-hook-form';
import { Edit, Delete, Add } from '@mui/icons-material';
import axios from 'axios';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const ProductViewAdvanced = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedUnits, setSelectedUnits] = useState({});
  const [openEdit, setOpenEdit] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);const [searchQuery, setSearchQuery] = useState('');
  const [editUnits, setEditUnits] = useState([]);


  //search bar setting
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredProducts = products.filter((prod) => 
    prod.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add Product Form
  const { register, handleSubmit, reset, control } = useForm({
    defaultValues: {
      name: '',
      stock: '',
      category_id: '',
      units: [{ unit: '', price: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'units' });

  // Add Category Form
  const { register: registerCategory, handleSubmit: handleSubmitCategory, reset: resetCategory } = useForm();

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    setValue,
  } = useForm();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const [productRes, categoryRes] = await Promise.all([
        axios.get('https://toko369-be-production.up.railway.app/api/product/fetch', { withCredentials: true }),
        axios.get('https://toko369-be-production.up.railway.app/api/category/fetch', { withCredentials: true }),
      ]);

      categoryRes.data.splice(0,1)
      setProducts(productRes.data);
      setCategories(categoryRes.data);

      const unitDefaults = {};
      productRes.data.forEach((prod) => {
        if (prod.units && prod.units.length > 0) {
          unitDefaults[prod.product_id] = prod.units[0].unit;
        }
      });
      setSelectedUnits(unitDefaults);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleUnitChange = (productId, newUnit) => {
    setSelectedUnits((prev) => ({
      ...prev,
      [productId]: newUnit,
    }));
  };

  const getPriceForUnit = (product) => {
    const selectedUnit = selectedUnits[product.product_id];
    const unitItem = product.units.find((u) => u.unit === selectedUnit);
    return unitItem ? unitItem.price : '-';
  };

  const handleOpenEdit = (product) => {
    setCurrentProduct(product);
    setValue('product_id', product.product_id)
    setValue('name', product.name);
    setValue('stock', product.stock);
    setValue('category_id', product.category_id);
    setValue('image_link', product.image_link) // untuk default kategori
    // setValue('units', product.units);
    setOpenEdit(true);
  };

  const onEditProduct = async(data) => {
    // Validasi: minimal 1 unit
    if (editUnits.length === 0) {
      alert('Minimal harus ada 1 unit!');
      return;
    }
  
    // Validasi: semua harga harus diisi dan > 0
    for (let i = 0; i < editUnits.length; i++) {
      const unit = editUnits[i];
      if (!unit.price || isNaN(unit.price) || unit.price <= 0) {
        alert(`Harga untuk unit "${unit.unit}" harus lebih dari 0!`);
        return;
      }
    }
  
    // Jika lolos validasi, lanjutkan simpan
    const updatedProduct = {
      ...data,
      units: editUnits,
    };
    
    const confirm = await Swal.fire({
      title: 'Yakin ingin mengubah data produk ini?',
      text: 'Data yang terubah tidak dapat kembali.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, update!',
      cancelButtonText: 'Batal',
      customClass: {
        popup: 'custom-swal-zindex',
      }
    });
    // Lanjutkan ke API atau update state...
    if(confirm.isConfirmed){
      await axios.put(`https://toko369-be-production.up.railway.app/api/product/update/${data.product_id}`, updatedProduct, {withCredentials: true})
      .then(response => {
        Swal.fire({
          icon: 'success',
          title: 'Ditambahkan!',
          text: 'Item berhasil diupdate ke database.',
          timer: 1500,
          showConfirmButton: false,
          customClass: { popup: 'rounded-4', popup: 'custom-swal-zindex' },
        });
        load();
        setOpenEdit(false);
        resetEdit();
      })
      .catch(e => {
        Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: `Gagal mengupdate product: ${e.response.data.message}.`,
          customClass: {
            popup: 'rounded-4',
            popup: 'custom-swal-zindex'
          }
        });
        load();
        setOpenEdit(false);
        resetEdit();
      })
    }
  };  

  const handleDelete = async (productId) => {
    // setProducts((prev) => prev.filter((prod) => prod.product_id !== productId));
    const confirm = await Swal.fire({
      title: 'Yakin ingin menghapus produk ini?',
      text: 'Data produk akan dihilangkan dari database.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    });

    if(confirm.isConfirmed){
      await axios.delete(`https://toko369-be-production.up.railway.app/api/product/delete/${productId}`, {withCredentials: true});
      load();
      await Swal.fire({
        icon: 'success',
        title: 'Produk berhasil dihapus!',
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  const toggleStatus = async (productId) => {
    const confirm = await Swal.fire({
      title: 'Yakin ingin mengubah status produk ini?',
      text: 'Status produk akan diubah.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, ubah!',
      cancelButtonText: 'Batal',
    });

    if (confirm.isConfirmed) {
      try {
        // Gantilah URL API di bawah sesuai dengan kebutuhan Anda
        await axios.put(`https://toko369-be-production.up.railway.app/api/product/status/${productId}`, { status: false }, { withCredentials: true });

        // Mengupdate status produk di UI
        load();

        Swal.fire({
          icon: 'success',
          title: 'Status produk berhasil diubah!',
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (e) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal mengubah status produk',
          text: e.response?.data?.message || 'Terjadi kesalahan.',
        });
      }
    }
  };

  const onAddProduct = async (data) => {
    try {
      await axios.post('https://toko369-be-production.up.railway.app/api/product/add', data, { withCredentials: true });
      Swal.fire({
        icon: 'success',
        title: 'Ditambahkan!',
        text: 'Item berhasil ditambahkan ke database.',
        timer: 1500,
        showConfirmButton: false,
        customClass: { popup: 'rounded-4' },
      });
      load();
      reset();
    } catch (e) {
      console.log(e);
    }
  };

  const onAddCategory = async (data) => {
    try {
      await axios.post('https://toko369-be-production.up.railway.app/api/category/add', data, { withCredentials: true });
      Swal.fire({
        icon: 'success',
        title: 'Kategori Ditambahkan!',
        timer: 1500,
        showConfirmButton: false,
      });
      resetCategory();
      load();
    } catch (e) {
      Swal.fire({
        icon: 'error',
        title: 'Oops!',
        text: `Gagal menambahkan kategori: ${e.response.data.message}.`,
        customClass: {
          popup: 'rounded-4'
        }
      });
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    const confirm = await Swal.fire({
      title: 'Yakin ingin menghapus kategori ini?',
      text: 'Semua produk dengan kategori ini akan tetap ada tetapi tanpa kategori.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    });
  
    if (confirm.isConfirmed) {
      let deleteCategory = true;
      products.map((prod) => {
        if(prod.category_id == categoryId){
          deleteCategory = false;
        }
      })
      if (!deleteCategory){
        Swal.fire({
          icon: 'error',
          title: 'Gagal Menghapus',
          text: 'Harap hapus / ganti kategori product yang memakai kategori ini sebelum menghapus kategorinya.',
          timer: 2000
        });
      }
      else {
        try {
          await axios.delete(`https://toko369-be-production.up.railway.app/api/category/delete/${categoryId}`, {
            withCredentials: true,
          });
    
          Swal.fire({
            icon: 'success',
            title: 'Kategori Dihapus!',
            timer: 1500,
            showConfirmButton: false,
          });
    
          load(); // refresh data
        } catch (e) {
          Swal.fire({
            icon: 'error',
            title: 'Gagal Menghapus',
            text: e.response?.data?.message || 'Terjadi kesalahan.',
            timer: 1500
          });
        }
      }
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.category_id === categoryId);
    return category ? category.nama : 'No Category';
  };
  
  useEffect(() => {
    if (openEdit && currentProduct?.units) {
      setEditUnits(currentProduct.units.map(unit => ({ ...unit })));
    }
  }, [openEdit, currentProduct]);
  

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>Product Management</Typography>

      {/* Add Category Form */}
      <Box
        component="form"
        onSubmit={handleSubmitCategory(onAddCategory)}
        sx={{
          mb: 4,
          p: 2,
          border: '1px solid #ddd',
          borderRadius: 2,
          backgroundColor: '#f0f0f0',
        }}
      >
        <Typography variant="h6" gutterBottom>Tambah Kategori Baru</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <TextField
            label="Nama Kategori"
            {...registerCategory('nama', { required: true })}
            size="small"
          />
          <Button type="submit" variant="contained">Tambah</Button>
        </Box>

        {/* List kategori dengan tombol delete */}
        <Box>
          {categories.length > 0 && (
            <>
              <Typography variant="subtitle1" sx={{ mt: 2 }}>Daftar Kategori</Typography>
              <Box sx={{ maxHeight: '200px', overflowY: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nama</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {categories.map((cat) => (
                      <TableRow key={cat.category_id}>
                        <TableCell>{cat.nama}</TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleDeleteCategory(cat.category_id)}
                          >
                            Hapus
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </>
          )}
        </Box>

      </Box>

      {/* Add Product Form */}
      <Box
        component="form"
        onSubmit={handleSubmit(onAddProduct)}
        sx={{
          mb: 4,
          p: 2,
          border: '1px solid #ddd',
          borderRadius: 2,
          backgroundColor: '#f7f7f7',
        }}
      >
        <Typography variant="h6" gutterBottom>Tambah Produk Baru</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField label="Name" {...register('name', { required: true })} size="small" />
          <TextField label="Link Product Image" {...register('image_link', { required: true })} size="small" />
          <TextField label="Stock" type="number" {...register('stock', { required: true })} size="small" />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Category</InputLabel>
            <Select defaultValue="" {...register('category_id', { required: true })} label="Category">
              {categories.map((cat) => (
                <MenuItem key={cat.category_id} value={cat.category_id}>
                  {cat.nama}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1">Units & Prices</Typography>
          {fields.map((field, index) => (
            <Box key={field.id} sx={{ display: 'flex', gap: 2, mb: 1, alignItems: 'center' }}>
              <TextField label="Unit" {...register(`units.${index}.unit`, { required: true })} size="small" />
              <TextField label="Price" type="number" {...register(`units.${index}.price`, { required: true })} size="small" />
              
              {/* Button to remove unit will be hidden for the first unit */}
              {index > 0 && (
                <IconButton onClick={() => remove(index)} size="small">
                  <Delete />
                </IconButton>
              )}
            </Box>
          ))}
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => append({ unit: '', price: '' })}
          >
            Add Unit
          </Button>
        </Box>
        <Button type="submit" variant="contained" sx={{ mt: 2 }}>
          Add Product
        </Button>
      </Box>

      {/* Search Bar */}
      <Box>
        <TextField
          label="Search Products"
          variant="outlined"
          value={searchQuery}
          onChange={handleSearchChange}
          fullWidth
          sx={{ mb: 2 }}
        />

        {/* Product Table */}
        <TableContainer component={Paper} sx={{ maxHeight: '500px', overflow: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product Name</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.map((prod) => (
                <TableRow key={prod.product_id}>
                  <TableCell>{prod.name}</TableCell>
                  <TableCell>{prod.stock}</TableCell>
                  <TableCell>{getCategoryName(prod.category_id)}</TableCell>
                  
                  <TableCell>
                    <Select
                      size="small"
                      value={selectedUnits[prod.product_id] || ''}
                      onChange={(e) => handleUnitChange(prod.product_id, e.target.value)}
                      displayEmpty
                      sx={{ minWidth: 100 }}
                    >
                      {prod.units.map((u, idx) => (
                        <MenuItem key={idx} value={u.unit}>
                          {u.unit}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>

                  <TableCell>
                    {getPriceForUnit(prod)}
                  </TableCell>

                  <TableCell>
                    <Switch
                      checked={prod.status}
                      onChange={() => toggleStatus(prod.product_id)}
                      color="primary"
                    />
                  </TableCell>

                  <TableCell>
                    <Box display="flex" gap={1}>
                      <IconButton color="primary" onClick={() => handleOpenEdit(prod)}>
                        <Edit />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(prod.product_id)}>
                        <Delete />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>


      {/* Edit Product Modal */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Produk</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmitEdit(onEditProduct)} sx={{ mt: 1 }}>
            {/* Nama Produk */}
            <TextField
              label="Nama Produk"
              {...registerEdit('name')}
              size="small"
              fullWidth
              sx={{ mb: 2 }}
            />

            {/* Stok */}
            <TextField
              label="Stok"
              type="number"
              {...registerEdit('stock')}
              size="small"
              fullWidth
              sx={{ mb: 2 }}
            />
            
            <TextField
            label="Link Product Image"
            {...registerEdit('image_link')}
            size="small"
            fullWidth
            sx={{ mb: 2 }}
          />

            {/* Dropdown Kategori */}
            <FormControl fullWidth sx={{ mb: 2 }} size="small">
              <InputLabel>Kategori</InputLabel>
              <Select
                label="Kategori"
                {...registerEdit('category_id')}
                defaultValue={currentProduct?.category_id || ''}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.category_id} value={cat.category_id}>
                    {cat.nama}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Unit dan Harga */}
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Unit & Harga</Typography>
            {editUnits.map((unitItem, index) => (
              <Box key={index} display="flex" gap={1} alignItems="center" mb={1}>
                <TextField
                  label="Unit"
                  value={unitItem.unit}
                  size="small"
                  onChange={(e) => {
                    const newUnits = [...editUnits];
                    newUnits[index].unit = e.target.value;
                    setEditUnits(newUnits);
                  }}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Harga"
                  type="number"
                  size="small"
                  value={unitItem.price}
                  onChange={(e) => {
                    const newUnits = [...editUnits];
                    newUnits[index].price = parseInt(e.target.value);
                    setEditUnits(newUnits);
                  }}
                  sx={{ flex: 1 }}
                />
                <IconButton
                  color="error"
                  onClick={() => {
                    const filtered = editUnits.filter((_, i) => i !== index);
                    setEditUnits(filtered);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}

            {/* Tombol untuk Menambah Unit */}
            <Button
              variant="outlined"
              onClick={() => {
                setEditUnits([
                  ...editUnits,
                  { unit: '', price: 0 }, // Menambahkan unit kosong dengan harga 0
                ]);
              }}
              sx={{ mb: 2 }}
            >
              Tambah Unit
            </Button>

            <DialogActions sx={{ mt: 2 }}>
              <Button onClick={() => setOpenEdit(false)}>Batal</Button>
              <Button type="submit" variant="contained">Simpan</Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>

    </Container>
  );
};

export default ProductViewAdvanced;