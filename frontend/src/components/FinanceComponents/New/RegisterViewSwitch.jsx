import React from 'react';
import { ChartNoAxesCombined, TableProperties } from 'lucide-react';

const RegisterViewSwitch = ({ value, onChange }) => (
  <div className="flex items-center gap-1 rounded border border-gray-300 bg-white p-1" role="group" aria-label="Register view">
    <button type="button" onClick={() => onChange('table')} aria-pressed={value === 'table'} className={`inline-flex items-center gap-2 rounded px-3 py-2 text-sm ${value === 'table' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
      <TableProperties size={16} /> Table
    </button>
    <button type="button" onClick={() => onChange('dashboard')} aria-pressed={value === 'dashboard'} className={`inline-flex items-center gap-2 rounded px-3 py-2 text-sm ${value === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
      <ChartNoAxesCombined size={16} /> Dashboard
    </button>
  </div>
);

export default RegisterViewSwitch;
