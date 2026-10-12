// src/components/POComponents/SearchableClientDropdown.jsx
import React, { useState, useEffect, useRef } from "react";

const SearchableClientDropdown = ({
  options,
  value,
  onChange,
  placeholder,
  disabled,
  isLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setFilteredOptions(
      options.filter((option) =>
        option.company_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, options]);

  // Reset search term when value changes externally
  useEffect(() => {
    if (!value || !searchTerm) {
      setSearchTerm("");
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        // Reset search term when closing if no value is selected
        if (!value) {
          setSearchTerm("");
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setIsOpen(true);
  };

  const handleSelect = (option) => {
    onChange(option.company_id);
    setSearchTerm(option.company_name); // Set the display name
    setIsOpen(false);
  };

  const getCurrentDisplayValue = () => {
    if (searchTerm) {
      return searchTerm;
    }
    if (value) {
      const selectedOption = options.find((opt) => opt.company_id === value);
      return selectedOption ? selectedOption.company_name : "";
    }
    return "";
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <input
        type="text"
        value={getCurrentDisplayValue()}
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
                key={option.company_id}
                className="px-4 py-3 text-sm cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl"
                onClick={() => handleSelect(option)}
              >
                {option.company_name}
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-slate-500">
              No clients found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableClientDropdown;