// src/components/POComponents/CategorySection.jsx
import React from "react";
import { ChevronDown, ChevronUp, Settings, Trash2, Plus } from "lucide-react";
import SearchableDropdown from "./SearchableDropdown";
import ItemsTable from "./ItemsTable";

const themeColors = {
  primary: '#1e7a6f',    // Dark Teal
  accent: '#c79100',      // Gold/Amber
  lightBg: '#f8f9fa',    // Very light gray for page background
  textPrimary: '#212529', // Dark charcoal for text
  textSecondary: '#6c757d', // Gray for secondary text
  border: '#dee2e6',      // Neutral border color
  lightBorder: '#e9ecef', // Lighter border for internal elements
};

const CategorySection = ({
  category,
  categoryIndex,
  categories,
  handleCategoryChange,
  handleCreateCategory,
  removeCategory,
  toggleCategory,
  openCategories,
  workItems,
  handleItemChange,
  handleItemDescriptionChange,
  handleCreateWorkItem,
  removeItemRow,
  addItemRow,
  subcategories,
  handleSubcategorySelection,
  newSubcategory,
  setNewSubcategory,
  handleCreateSubcategory,
  handleSubcategoryRateChange,
  loading,
  getRandomColor,
  formDataCategoriesLength
}) => {
  return (
    <div 
      className="bg-white rounded-lg border p-6 space-y-6"
      style={{ borderColor: themeColors.border, backgroundColor: '#ffffff' }}
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <div>
            <label 
              className="block text-sm font-semibold mb-2"
              style={{ color: themeColors.textSecondary }}
            >
              Category Name
            </label>
            <SearchableDropdown
              options={categories.map((cat) => ({
                id: cat.category_id,
                name: cat.category_name,
              }))}
              value={category.categoryName}
              onChange={(value, id) => handleCategoryChange(categoryIndex, value)}
              onCreate={async (name) => {
                const newCategory = await handleCreateCategory(name);
                if (newCategory) {
                  handleCategoryChange(categoryIndex, newCategory.category_name);
                }
              }}
              placeholder="Search or add category"
              disabled={loading.categories}
              isLoading={loading.categories}
            />
          </div>
          <div className="flex items-end justify-end">
            {formDataCategoriesLength > 1 && (
              <button
                type="button"
                onClick={() => removeCategory(categoryIndex)}
                className="group flex items-center gap-2 text-white px-5 py-2.5 rounded-lg shadow-sm font-medium transition-all duration-200 transform hover:opacity-90 focus:outline-none focus:ring-2"
                style={{ 
                  backgroundColor: '#dc2626', // Tailwind red-600
                  ringColor: themeColors.accent 
                }}
              >
                <Trash2 className="w-4 h-4" />
                Remove Category
              </button>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => toggleCategory(categoryIndex)}
          className="ml-4 p-2 rounded-lg transition-colors duration-200"
          style={{ backgroundColor: themeColors.lightBorder }}
          aria-label={
            openCategories[categoryIndex]
              ? "Collapse Category"
              : "Expand Category"
          }
        >
          {openCategories[categoryIndex] ? (
            <ChevronUp 
              className="w-6 h-6"
              style={{ color: themeColors.textSecondary }}
            />
          ) : (
            <ChevronDown 
              className="w-6 h-6"
              style={{ color: themeColors.textSecondary }}
            />
          )}
        </button>
      </div>

      {openCategories[categoryIndex] && category.categoryName && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div 
              className="p-3 rounded-lg"
              style={{ backgroundColor: themeColors.primary }}
            >
              <Settings className="w-6 h-6 text-white" />
            </div>
            <h3 
              className="text-lg font-semibold"
              style={{ color: themeColors.textPrimary }}
            >
              Items
            </h3>
          </div>
          
          <ItemsTable
            category={category}
            categoryIndex={categoryIndex}
            workItems={workItems}
            handleItemChange={handleItemChange}
            handleItemDescriptionChange={handleItemDescriptionChange}
            handleCreateWorkItem={handleCreateWorkItem}
            removeItemRow={removeItemRow}
            subcategories={subcategories}
            handleSubcategorySelection={handleSubcategorySelection}
            newSubcategory={newSubcategory}
            setNewSubcategory={setNewSubcategory}
            handleCreateSubcategory={handleCreateSubcategory}
            handleSubcategoryRateChange={handleSubcategoryRateChange}
            loading={loading}
            getRandomColor={getRandomColor}
          />

          <div className="mt-6">
            <button
              type="button"
              onClick={(e) => addItemRow(categoryIndex, e)}
              className="group flex items-center gap-2 text-white px-5 py-2.5 rounded-lg shadow-sm font-medium transition-all duration-200 transform hover:opacity-90 focus:outline-none focus:ring-2"
              style={{ 
                backgroundColor: themeColors.primary,
                ringColor: themeColors.accent 
              }}
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
              Add Item
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySection;