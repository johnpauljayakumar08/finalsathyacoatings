// src/components/POComponents/ReckonerForm.jsx
import React from "react";
import { FileText, Plus, Check } from "lucide-react";
import CategorySection from "./CategorySection";

const themeColors = {
  primary: '#1e7a6f',    // Dark Teal
  accent: '#c79100',      // Gold/Amber
  lightBg: '#f8f9fa',    // Very light gray for page background
  textPrimary: '#212529', // Dark charcoal for text
  textSecondary: '#6c757d', // Gray for secondary text
  border: '#dee2e6',      // Neutral border color
  lightBorder: '#e9ecef', // Lighter border for internal elements
};

const ReckonerForm = ({
  formData,
  handleSubmit,
  categories,
  handleCategoryChange,
  handleCreateCategory,
  removeCategory,
  addCategory,
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
  isSubmitDisabled,
  setCreatingReckonerSiteId
}) => {
  return (
    <form 
      onSubmit={handleSubmit} 
      className="space-y-6"
      style={{ backgroundColor: '#ffffff' }}
    >
      <input type="hidden" name="poNumber" value={formData.poNumber} />
      <input type="hidden" name="siteId" value={formData.siteId} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div 
              className="p-3 rounded-lg"
              style={{ backgroundColor: themeColors.primary }}
            >
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h2 
              className="text-xl font-semibold"
              style={{ color: themeColors.textPrimary }}
            >
              Categories
            </h2>
          </div>
          <button
            type="button"
            onClick={addCategory}
            className="group flex items-center gap-2 text-white px-5 py-2.5 rounded-lg shadow-sm font-medium transition-all duration-200 transform hover:opacity-90 focus:outline-none focus:ring-2"
            style={{ 
              backgroundColor: themeColors.primary,
              ringColor: themeColors.accent 
            }}
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
            Add Category
          </button>
        </div>

        {/* Category Sections */}
        {formData.categories.map((category, categoryIndex) => (
          <CategorySection
            key={categoryIndex}
            category={category}
            categoryIndex={categoryIndex}
            categories={categories}
            handleCategoryChange={handleCategoryChange}
            handleCreateCategory={handleCreateCategory}
            removeCategory={removeCategory}
            toggleCategory={toggleCategory}
            openCategories={openCategories}
            workItems={workItems}
            handleItemChange={handleItemChange}
            handleItemDescriptionChange={handleItemDescriptionChange}
            handleCreateWorkItem={handleCreateWorkItem}
            removeItemRow={removeItemRow}
            addItemRow={addItemRow}
            subcategories={subcategories}
            handleSubcategorySelection={handleSubcategorySelection}
            newSubcategory={newSubcategory}
            setNewSubcategory={setNewSubcategory}
            handleCreateSubcategory={handleCreateSubcategory}
            handleSubcategoryRateChange={handleSubcategoryRateChange}
            loading={loading}
            getRandomColor={getRandomColor}
            formDataCategoriesLength={formData.categories.length}
          />
        ))}
      </div>

      {/* Form Actions */}
      <div 
        className="pt-6 flex justify-end space-x-4 border-t"
        style={{ borderColor: themeColors.border }}
      >
        <button
          type="button"
          onClick={() => setCreatingReckonerSiteId(null)}
          className="px-5 py-2.5 rounded-lg font-medium transition-all duration-200 hover:opacity-90 focus:outline-none focus:ring-2"
          style={{ 
            backgroundColor: themeColors.lightBorder,
            color: themeColors.textSecondary,
            ringColor: themeColors.accent 
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="group flex items-center gap-2 text-white px-5 py-2.5 rounded-lg shadow-sm font-medium transition-all duration-200 transform hover:opacity-90 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ 
            backgroundColor: themeColors.primary,
            ringColor: themeColors.accent 
          }}
          disabled={isSubmitDisabled()}
        >
          {loading.submitting || loading.processing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              {loading.submitting ? "Submitting..." : "Processing..."}
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              Submit
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ReckonerForm;