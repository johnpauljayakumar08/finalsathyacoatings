// src/components/POComponents/SearchableDropdown.jsx
import React, { useState, useEffect, useRef } from "react";

const SearchableDropdown = ({ options, value, onChange, placeholder, disabled, isLoading, onCreate }) => {
  const [searchTerm, setSearchTerm] = useState(value || "");
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setSearchTerm(value || "");
    setFilteredOptions(
      options.filter((option) =>
        option.name.toLowerCase().includes((value || "").toLowerCase())
      )
    );
  }, [value, options]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setFilteredOptions(
      options.filter((option) =>
        option.name.toLowerCase().includes(term.toLowerCase())
      )
    );
    setIsOpen(true);
  };

  const handleSelect = (option) => {
    onChange(option.name, option.id);
    setSearchTerm(option.name);
    setIsOpen(false);
  };

  const handleCreate = async () => {
    if (onCreate && searchTerm && !filteredOptions.some(opt => opt.name.toLowerCase() === searchTerm.toLowerCase())) {
      try {
        await onCreate(searchTerm);
        setSearchTerm("");
        setIsOpen(false);
      } catch (error) {
        console.error("Error creating new option:", error);
      }
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearch}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-200 p-3 border text-sm bg-white hover:bg-slate-50 transition-all duration-200"
        disabled={disabled || isLoading}
      />
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option.id}
                className="px-4 py-3 text-sm cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl"
                onClick={() => handleSelect(option)}
              >
                {option.name}
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-slate-500">
              {onCreate && searchTerm ? (
                <button
                  onClick={handleCreate}
                  className="w-full text-left hover:text-blue-600 transition-colors duration-200"
                >
                  + Create "{searchTerm}"
                </button>
              ) : (
                "No options found"
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;