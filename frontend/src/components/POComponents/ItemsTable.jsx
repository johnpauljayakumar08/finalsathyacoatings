// src/components/POComponents/ItemsTable.jsx
import React from "react";
import { Trash2 } from "lucide-react";
import SearchableDropdown from "./SearchableDropdown";
import SubcategorySection from "./SubcategorySection";
import SubcategoryDetailsTable from "./SubcategoryDetailsTable";

const ItemsTable = ({
  category,
  categoryIndex,
  workItems,
  handleItemChange,
  handleItemDescriptionChange,
  handleCreateWorkItem,
  removeItemRow,
  subcategories,
  handleSubcategorySelection,
  newSubcategory,
  setNewSubcategory,
  handleCreateSubcategory,
  handleSubcategoryRateChange,
  loading,
  getRandomColor
}) => {
  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className={`${getRandomColor(categoryIndex + 1)} border-b border-slate-200`}>
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Item No
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Description
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Qty
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
              UOM
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Rate
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Value
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-100">
          {category.items.map((item, itemIndex) => (
            <React.Fragment key={itemIndex}>
              <tr className={itemIndex % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                <td className="px-4 py-3 whitespace-nowrap">
                  <input
                    type="text"
                    name="itemNo"
                    value={item.itemNo}
                    onChange={(e) => handleItemChange(categoryIndex, itemIndex, e)}
                    className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-200 p-2 border text-sm bg-white"
                    required
                    placeholder="Item No"
                  />
                </td>
                <td className="px-4 py-3 w-[250px] whitespace-nowrap">
                  <SearchableDropdown
                    options={workItems.map((item) => ({
                      id: item.desc_id,
                      name: item.desc_name,
                    }))}
                    value={item.descName}
                    onChange={(value) => handleItemDescriptionChange(categoryIndex, itemIndex, value)}
                    onCreate={async (name) => {
                      const newWorkItem = await handleCreateWorkItem(name);
                      if (newWorkItem) {
                        handleItemDescriptionChange(categoryIndex, itemIndex, newWorkItem.desc_name);
                      }
                    }}
                    placeholder="Search or add description"
                    disabled={loading.workItems}
                    isLoading={loading.workItems}
                  />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <input
                    type="number"
                    name="poQuantity"
                    value={item.poQuantity}
                    onChange={(e) => handleItemChange(categoryIndex, itemIndex, e)}
                    className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-200 p-2 border text-sm bg-white"
                    required
                    min="0"
                    step="0.01"
                    placeholder="Qty"
                  />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <input
                    type="text"
                    name="unitOfMeasure"
                    value={item.unitOfMeasure}
                    onChange={(e) => handleItemChange(categoryIndex, itemIndex, e)}
                    className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-200 p-2 border text-sm bg-white"
                    required
                    placeholder="UOM"
                  />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <input
                    type="number"
                    name="rate"
                    value={item.rate}
                    onChange={(e) => handleItemChange(categoryIndex, itemIndex, e)}
                    className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-200 p-2 border text-sm bg-white"
                    required
                    min="0"
                    step="0.01"
                    placeholder="Rate"
                  />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <input
                    type="text"
                    name="value"
                    value={item.value}
                    readOnly
                    className="block w-full rounded-lg border-slate-300 shadow-sm p-2 border bg-slate-100 text-sm"
                  />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => removeItemRow(categoryIndex, itemIndex)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
                    disabled={category.items.length <= 1}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Remove
                  </button>
                </td>
              </tr>
              <tr className="bg-gradient-to-r from-slate-100 to-slate-50">
                <td colSpan="7" className="px-4 py-4">
                  <SubcategorySection
                    subcategories={subcategories}
                    item={item}
                    categoryIndex={categoryIndex}
                    itemIndex={itemIndex}
                    handleSubcategorySelection={handleSubcategorySelection}
                    newSubcategory={newSubcategory}
                    setNewSubcategory={setNewSubcategory}
                    handleCreateSubcategory={handleCreateSubcategory}
                    loading={loading}
                  />
                </td>
              </tr>
              {item.subcategories.length > 0 && (
                <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <td colSpan="7" className="px-4 py-4">
                    <SubcategoryDetailsTable
                      item={item}
                      categoryIndex={categoryIndex}
                      itemIndex={itemIndex}
                      handleSubcategoryRateChange={handleSubcategoryRateChange}
                    />
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ItemsTable;