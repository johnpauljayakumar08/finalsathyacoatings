import React from 'react';
import { FileText } from 'lucide-react';

const PurchaseRegisterWithoutGST = () => (
  <main className="flex min-h-[70vh] items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
    <section className="w-full max-w-xl rounded-2xl bg-white p-8 text-center shadow-lg">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-700">
        <FileText className="h-7 w-7" />
      </div>
      <h1 className="mt-5 text-2xl font-bold text-gray-800">Purchase Register - WG</h1>
      <p className="mt-2 text-sm font-medium text-gray-600">Without GST</p>
      <p className="mt-4 text-gray-600">
        This register will use a separate workflow. Its fields and approval steps will be added after that workflow is provided.
      </p>
    </section>
  </main>
);

export default PurchaseRegisterWithoutGST;
