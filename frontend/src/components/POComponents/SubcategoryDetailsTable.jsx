  // src/components/POComponents/SubcategoryDetailsTable.jsx
  import React from "react";
  import { Settings } from "lucide-react";

  const SubcategoryDetailsTable = ({
    item,
    categoryIndex,
    itemIndex,
    handleSubcategoryRateChange
  }) => {
    if (item.subcategories.length === 0) return null;

    return (
      <div className="mb-2">
        <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Subcategory Details
        </h4>
        <table className="min-w-full divide-y divide-slate-200 bg-white rounded-lg shadow-sm border border-slate-200">
          <thead className="bg-gradient-to-r from-slate-200 to-slate-100">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Subcategory
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Qty
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Rate
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Value
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {item.subcategories.map((subcat, subcatIndex) => (
              <tr
                key={subcatIndex}
                className={subcatIndex % 2 === 0 ? "bg-white" : "bg-slate-50/50"}
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900 font-medium">
                  {subcat.subcategoryName}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">
                  {subcat.poQuantity}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <input
                    type="number"
                    value={subcat.rate}
                    onChange={(e) =>
                      handleSubcategoryRateChange(
                        categoryIndex,
                        itemIndex,
                        subcatIndex,
                        e
                      )
                    }
                    className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-200 p-2 border text-sm bg-white"
                    min="0"
                    step="0.01"
                  />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700 font-mono">
                  {subcat.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  export default SubcategoryDetailsTable;