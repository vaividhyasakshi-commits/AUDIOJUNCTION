import { useState, useEffect } from "react";
import { X, Search, RotateCcw } from "lucide-react";

import {
  getCategories,
  getSubcategories,
  normalizeCategory,
  formatCategory,
} from "../data/categories";

export default function SearchModal({
  enquiries,
  filters,
  onSearch,
  onClose,
}) {
  const [category, setCategory] = useState(
    filters.category || ""
  );

  const [subcategory, setSubcategory] = useState(
    filters.subcategory || ""
  );

  const categories = getCategories(enquiries);

  const subcategories = getSubcategories(
    enquiries,
    category
  );

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  function handleSearch(e) {
    e.preventDefault();

    onSearch({
      category: normalizeCategory(category),
      subcategory: normalizeCategory(subcategory),
    });

    onClose();
  }

  function resetFilters() {
    onSearch({
      category: "",
      subcategory: "",
    });

    onClose();
  }

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <section
        className="modal-card search-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">

          <div>
            <h2 id="search-title">
              Search Customers
            </h2>

            <p>
              Find customers by category and subcategory.
            </p>
          </div>

          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={22} />
          </button>

        </div>

        <div className="modal-body">

          <form
            onSubmit={handleSearch}
            className="form-stack"
          >

            <div className="form-group">
              <label htmlFor="search-category">
                Category
              </label>

              <input
                id="search-category"
                className="plain-input"
                placeholder="Select or type category"
                list="search-category-list"
                value={category}
                maxLength={100}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setSubcategory("");
                }}
              />

              <datalist id="search-category-list">
                {categories.map((item) => (
                  <option
                    key={item}
                    value={formatCategory(item)}
                  />
                ))}
              </datalist>

            </div>

            <div className="form-group">
              <label htmlFor="search-subcategory">
                Subcategory
              </label>

              <input
                id="search-subcategory"
                className="plain-input"
                placeholder="Select or type subcategory"
                list="search-subcategory-list"
                value={subcategory}
                maxLength={100}
                onChange={(e) =>
                  setSubcategory(e.target.value)
                }
              />

              <datalist id="search-subcategory-list">
                {subcategories.map((item) => (
                  <option
                    key={item}
                    value={formatCategory(item)}
                  />
                ))}
              </datalist>
            </div>

            <p className="field-hint">
              Search by category, subcategory or both.
              Leave a field empty to search all its values.
            </p>

            <button
              type="submit"
              className="primary-button"
            >
              <Search size={18} />
              Search Customers
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={resetFilters}
            >
              <RotateCcw size={17} />
              Reset Filters
            </button>

          </form>

        </div>
      </section>
    </div>
  );
}