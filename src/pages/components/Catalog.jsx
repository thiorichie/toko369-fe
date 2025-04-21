import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Fuse from "fuse.js";
import axios from "axios";
import { useForm, Controller } from "react-hook-form";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import "animate.css";

function Catalog({
  searchQuery,
  selectedCategory,
  onSearch,
  setOnSearch,
  setProductExist,
  setLoadData
}) {
  const [searchResults, setSearchResults] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searching, setSearching] = useState(false);

  const { control, handleSubmit, watch, reset } = useForm({
    defaultValues: { items: [] },
  });
  const items = watch("items");

  useEffect(() => {
    axios
      .get("https://toko369-be-production.up.railway.app/api/category/fetch", {
        withCredentials: true,
      })
      .then((res) => setCategories(res.data))
      .catch((e) => console.error("Gagal fetch kategori:", e));
  }, []);

  useEffect(() => {
    const fetchAndSearch = async () => {
      if (!onSearch) return;
      setSearching(true);

      try {
        const resp = await axios.get(
          "https://toko369-be-production.up.railway.app/api/product/fetch"
        );
        const products = resp.data;

        let results = [];
        if (searchQuery) {
          const fuse = new Fuse(products, { keys: ["name"], threshold: 0.3 });
          results = fuse.search(searchQuery).map((r) => r.item);
        }

        setSearchResults(results);
        setProductExist(results.length > 0);

        reset({
          items: results.map((p) => ({
            product_id: p.product_id,
            name: p.name,
            checked: false,
            unit: p.units[0]?.unit || "",
            quantity: 1,
          })),
        });
      } catch (e) {
        console.error("Gagal fetch data:", e);
      } finally {
        setSearching(false);
        setOnSearch(false);
      }
    };

    fetchAndSearch();
  }, [onSearch, searchQuery, reset, setOnSearch, setProductExist]);

  useEffect(() => {
    if (selectedCategory === "All") {
      setFilteredProducts(searchResults);
    } else {
      const cat = categories.find((c) => c.nama === selectedCategory);
      if (!cat) {
        setFilteredProducts([]);
      } else {
        setFilteredProducts(
          searchResults.filter((p) => p.category_id === cat.category_id)
        );
      }
    }
  }, [selectedCategory, searchResults, categories]);

  const onSubmit = async ({ items }) => {
    const toAdd = items
      .filter((i) => i.checked)
      .map((i) => {
        const prod = filteredProducts.find((p) => p.product_id === i.product_id);
        const unitData = prod.units.find((u) => u.unit === i.unit);
        return {
          product_id: i.product_id,
          name: i.name,
          unit: i.unit,
          quantity: i.quantity,
          price: unitData.price,
          total: unitData.price * i.quantity,
        };
      });

    try {
      await axios.post(
        "https://toko369-be-production.up.railway.app/api/cart/add",
        toAdd,
        { withCredentials: true }
      );
      await Swal.fire({
        icon: "success",
        title: "Ditambahkan!",
        text: "Item berhasil ditambahkan ke keranjang.",
        timer: 1500,
        showConfirmButton: false,
        customClass: { popup: "rounded-4" },
      });
      setLoadData(true);
      reset();
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
  };

  const handleViewProduct = (product) => {
    if (!product.image_link || product.image_link.trim() === "") {
      Swal.fire({
        icon: "info",
        title: product.name,
        text: "Yah, sayangnya tidak ada gambar untuk produk ini",
        confirmButtonText: "Tutup",
        customClass: {
          popup: "rounded-4",
        },
      });
    } else {
      Swal.fire({
        title: product.name,
        imageUrl: product.image_link,
        imageWidth: 300,
        imageAlt: product.name,
        confirmButtonText: "Tutup",
        customClass: {
          popup: "rounded-4",
        },
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="container mt-4">
      <h4 className="mb-3">Daftar Produk</h4>

      {searching && (
        <div className="text-center my-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Sedang mencari produk...</p>
        </div>
      )}

      {!searching && searchResults.length === 0 && searchQuery && (
        <div className="text-center my-4 text-muted animate__animated animate__fadeInDown">
          <img
            src="https://cdn-icons-png.flaticon.com/512/6134/6134065.png"
            alt="Empty"
            width={80}
            className="mb-3"
          />
          <p>Barangnya tidak ketemu nih..</p>
        </div>
      )}

      {!searching && searchResults.length === 0 && !searchQuery && (
        <div className="text-center my-4 text-muted animate__animated animate__fadeInDown">
          <img
            src="https://cdn-icons-png.flaticon.com/512/6134/6134065.png"
            alt="Empty"
            width={80}
            className="mb-3"
          />
          <p>Cari barang yang kamu inginkan dengan mengetik di atas.</p>
        </div>
      )}

      {!searching &&
        searchResults.length > 0 &&
        filteredProducts.length === 0 &&
        selectedCategory !== "All" && (
          <div className="text-center my-4 text-muted animate__animated animate__shakeX">
            <img
              src="https://cdn-icons-png.flaticon.com/512/6134/6134065.png"
              alt="Empty Category"
              width={80}
              className="mb-3"
            />
            <p>Barang yang kamu cari dengan kategori yang kamu pilih tidak ada..</p>
          </div>
        )}

      {!searching && filteredProducts.length > 0 && (
        <div className="table-responsive animate__animated animate__fadeIn">
          <table className="table table-bordered align-middle text-center">
            <thead className="table-light">
              <tr>
                <th>Pilih</th>
                <th>Nama Produk</th>
                <th>Satuan</th>
                <th>Harga</th>
                <th style={{ width: "80px", fontSize: "0.9rem" }}>Quantity</th>
                <th>Lihat</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product, idx) => {
                const item = items[idx] || {};
                const selUnit = item.unit || product.units[0]?.unit;
                const unitData =
                  product.units.find((u) => u.unit === selUnit) ||
                  product.units[0];

                return (
                  <tr key={product.product_id}>
                    <td>
                      <Controller
                        name={`items.${idx}.checked`}
                        control={control}
                        render={({ field }) => (
                          <input type="checkbox" {...field} checked={field.value || false} />
                        )}
                      />
                    </td>
                    <td>{product.name}</td>
                    <td>
                      <Controller
                        name={`items.${idx}.unit`}
                        control={control}
                        defaultValue={product.units[0]?.unit || ""}
                        render={({ field }) => (
                          <select
                            className="form-select w-auto"
                            {...field}
                            disabled={!items[idx]?.checked}
                            style={{ minWidth: "60px" }}
                          >
                            {product.units.map((u) => (
                              <option key={u.unit} value={u.unit}>
                                {u.unit}
                              </option>
                            ))}
                          </select>
                        )}
                      />
                    </td>
                    <td>Rp {unitData.price.toLocaleString()}</td>
                    <td>
                      <Controller
                        name={`items.${idx}.quantity`}
                        control={control}
                        defaultValue={1}
                        render={({ field }) => (
                          <input
                            type="number"
                            className="form-control"
                            min="1"
                            {...field}
                            disabled={!items[idx]?.checked}
                          />
                        )}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleViewProduct(product)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {filteredProducts.length > 0 && (
        <div className="text-end mt-3">
          <button type="submit" className="btn btn-primary">
            Submit Pilihan
          </button>
        </div>
      )}
    </form>
  );
}

export default Catalog;