import React, {useState} from 'react'
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import 'sweetalert2/dist/sweetalert2.min.css';
function SearchBar({setSelectedCategory, setSearchQuery, setOnSearch, selectedCategory}) {
    const { register, handleSubmit } = useForm();
    const navigate = useNavigate();
    const onSubmit = (data) => {
        if (selectedCategory !== "All") {
            setSelectedCategory("All");
        }
        setSearchQuery(data.search);
        setOnSearch(true);
        // navigate('/catalog');
    };
  return (
    <div className='mt-4'>
      <form onSubmit={handleSubmit(onSubmit)}
        className="d-flex mx-auto position-relative my-2 my-lg-0"
        style={{ maxWidth: "1000px", width: "100%" }}>
            <input
            className="form-control rounded-pill ps-3 pe-5 shadow-sm border-0 bg-light"
            type="search"
            placeholder="Search nama produk.."
            aria-label="Search"
            {...register("search")}
            />
            <button
            className="btn position-absolute end-0 top-0 mt-1 me-2 text-muted border-0"
            type="submit"
            >
                <i className="bi bi-search"></i>
            </button>
        </form>
    </div>
  )
}

export default SearchBar
