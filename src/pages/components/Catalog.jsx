import React, { useEffect, useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Fuse from "fuse.js";
import axios from "axios";
import { useForm, Controller } from "react-hook-form";
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

function Catalog({ searchQuery = "", selectedCategory = "All", dataProduct = [] }) {
  const [filteredProducts, setFilteredProducts] = useState(dataProduct);

  // Default items untuk form
  const defaultItems = useMemo(() => {
    return dataProduct.map((product) => ({
      product_id: product.product_id,
      name: product.name,
      checked: false,
      unit: product.units[0]?.unit ?? "",
      quantity: 1,
    }));
  }, [dataProduct]);

  const { control, handleSubmit, watch, setValue, getValues, reset } = useForm({
    defaultValues: {
      items: defaultItems,
    },
  });

  // Fuse.js untuk pencarian
  const fuse = useMemo(() => {
    return new Fuse(dataProduct, {
      keys: ["name"],
      threshold: 0.4,
    });
  }, [dataProduct]);

  // Handle search
  useEffect(() => {
    if (searchQuery) {
      const results = fuse.search(searchQuery);
      setFilteredProducts(results.map((r) => r.item));
    } else {
      setFilteredProducts(dataProduct);
    }
  }, [searchQuery, fuse, dataProduct]);

  // Filter kategori
  const filteredProductsByCategory = async () => {
    const filtered = [];
    for (let i = 0; i < dataProduct.length; i++) {
      const p = dataProduct[i];
      try {
        const getCategory = await axios.get(`https://toko369-be-production.up.railway.app/api/category/fetch/${p.category_id}`);
        if (getCategory.data.nama === selectedCategory) {
          filtered.push(p);
        }
      } catch (e) {
        console.error("Gagal ambil kategori: ", p.name, e?.response?.data?.message);
      }
    }
    return filtered;
  };

  useEffect(() => {
    const fetchFiltered = async () => {
      if (selectedCategory !== "All") {
        const result = await filteredProductsByCategory();
        setFilteredProducts(result);
      } else {
        setFilteredProducts(dataProduct);
      }
    };
    fetchFiltered();
  }, [selectedCategory, dataProduct]);

  // Watch semua item
  const items = watch("items");

  // Tambahkan product_id dan name ke dalam form state
  useEffect(() => {
    defaultItems.forEach((item, index) => {
      setValue(`items.${index}.product_id`, item.product_id);
      setValue(`items.${index}.name`, item.name);
    });
  }, [defaultItems, setValue]);

  const onSubmit = async (data) => {
    const selected = data.items
      .filter((item) => item.checked)
      .map((item) => {
        const product = dataProduct.find((p) => p.product_id === item.product_id);
        const unitData = product.units.find((u) => u.unit === item.unit);

        return {
          product_id: item.product_id,
          name: item.name,
          unit: item.unit,
          quantity: item.quantity,
          price: unitData.price,
          total: item.quantity * unitData.price,
        };
      });
    
      try{
        const addToCart = await axios.post("https://toko369-be-production.up.railway.app/api/cart/add", selected, {withCredentials: true});
        await Swal.fire({
                  icon: 'success',
                  title: 'Ditambahkan!',
                  text: 'Item berhasil ditambahkan ke keranjang.',
                  timer: 1500,
                  showConfirmButton: false,
                  customClass: {
                    popup: 'rounded-4'
                  }
                });
      } catch(e) {
        alert(e.response.data.message);
      }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="container mt-4">
      <h4 className="mb-3">Daftar Produk</h4>
      <div className="table-responsive">
        <table className="table table-bordered align-middle text-center">
          <thead className="table-light">
            <tr>
              <th>Pilih</th>
              <th>Nama Produk</th>
              <th>Satuan</th>
              <th>Harga</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => {
                const itemIndex = defaultItems.findIndex(
                  (item) => item.product_id === product.product_id
                );
                const item = items?.[itemIndex] ?? {};

                const selectedUnit = item.unit || product.units[0]?.unit;
                const unitData = product.units.find((u) => u.unit === selectedUnit) || product.units[0];

                const updatedItem = {
                  ...item,
                  name: product.name,
                  product_id: product.product_id
                };

                return (
                  <tr key={product.product_id}>
                    <td>
                      <Controller
                        name={`items.${itemIndex}.checked`}
                        control={control}
                        render={({ field }) => (
                          <input type="checkbox" {...field} checked={field.value || false} />
                        )}
                      />
                    </td>
                    <td>{product.name}</td>
                    <td>
                      <Controller
                        name={`items.${itemIndex}.unit`}
                        control={control}
                        defaultValue={product.units[0]?.unit ?? ""}
                        render={({ field }) => (
                          <select className="form-select" {...field} disabled={!item.checked}>
                            {product.units.map((u) => (
                              <option key={u.unit} value={u.unit}>
                                {u.unit}
                              </option>
                            ))}
                          </select>
                        )}
                      />
                    </td>
                    <td>Rp {unitData?.price?.toLocaleString()}</td>
                    <td>
                      <Controller
                        name={`items.${itemIndex}.quantity`}
                        control={control}
                        defaultValue={1}
                        render={({ field }) => (
                          <input
                            type="number"
                            className="form-control"
                            min="1"
                            {...field}
                            // value={field.value || 1}
                            disabled={!item.checked}
                          />
                        )}
                      />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  Produk tidak ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="text-end">
        <button type="submit" className="btn btn-primary">
          Submit Pilihan
        </button>
      </div>
    </form>
  );
}

export default Catalog;
