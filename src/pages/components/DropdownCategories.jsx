import React, { useState } from "react";

const DropdownCategories = ({ selectedCategory, setSelectedCategory, dataCategory }) => {

  return (
    <div className="d-flex justify-content-center mt-4">
      <div className="dropdown">
        <button
          className="btn btn-light dropdown-toggle shadow-sm border rounded-pill px-4 py-2"
          type="button"
          id="dropdownMenuButton"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          {selectedCategory}
        </button>
        <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
          {dataCategory.map((category, index) => (
            <li key={index}>
              <button
                className="dropdown-item"
                onClick={() => setSelectedCategory(category.nama)}
              >
                {category.nama}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DropdownCategories;
