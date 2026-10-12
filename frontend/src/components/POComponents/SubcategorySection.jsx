// src/components/POComponents/SubcategorySection.jsx
import React from "react";
import { Settings, Save } from "lucide-react";

const SubcategorySection = ({
  subcategories,
  item,
  categoryIndex,
  itemIndex,
  handleSubcategorySelection,
  newSubcategory,
  setNewSubcategory,
  handleCreateSubcategory,
  loading
}) => {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-semibold text-slate-700">
          Select Subcategories
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newSubcategory}
            onChange={(e) => setNewSubcategory(e.target.value)}
            placeholder="Add subcategory"
            className="rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-200 p-2 border text-sm bg-white"
          />
          {newSubcategory && (
            <button
              type="button"
              onClick={() => handleCreateSubcategory(categoryIndex, itemIndex)}
              className="inline-flex items-center p-2 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg"
            >
              <Save className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <div className="max-h-32 overflow-y-auto border border-slate-300 rounded-xl p-3 bg-white shadow-inner">
        {subcategories
          .reduce((acc, subcat, index) => {
            const chunkIndex = Math.floor(index / 7);
            if (!acc[chunkIndex]) {
              acc[chunkIndex] = [];
            }
            acc[chunkIndex].push(subcat);
            return acc;
          }, [])
          .map((chunk, chunkIndex) => (
            <div
              key={`chunk-${chunkIndex}`}
              className="flex flex-wrap mb-2"
            >
              {chunk.map((subcat) => (
                <div
                  key={subcat.subcategory_id}
                  className="flex items-center mb-2 w-1/4 pr-4"
                >
                  <input
                    type="checkbox"
                    id={`subcat-${categoryIndex}-${itemIndex}-${subcat.subcategory_id}`}
                    checked={item.subcategories.some(
                      (sc) => sc.subcategoryId === subcat.subcategory_id
                    )}
                    onChange={(e) =>
                      handleSubcategorySelection(
                        categoryIndex,
                        itemIndex,
                        subcat.subcategory_id,
                        e.target.checked
                      )
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                    disabled={loading.subcategories || !item.descName}
                  />
                  <label
                    htmlFor={`subcat-${categoryIndex}-${itemIndex}-${subcat.subcategory_id}`}
                    className="ml-2 text-sm text-slate-700 truncate"
                  >
                    {subcat.subcategory_name}
                  </label>
                </div>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
};

export default SubcategorySection;