// // src/App.jsx
// import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
// import AppLayout from './components/AppLayout';
// import Login from './pages/Login';
// import ProtectedRoute from './components/ProtectedRoute';

// // === Existing Pages ===
// import DashboardMain from './pages/dashboard/DashBoardMain';

// import ClientMasterCreation from './pages/contract/ClientMasterCreation';
// import POMasterMain from './pages/contract/POMasterMain';
// import ProjectList from './pages/contract/ProjectList';
// import ProjectProjectionNew from './pages/contract/ProjectProjectionNew';
// import WorkForcePlanning from './pages/contract/WorkForcePlanning';
// import MaterialPlanning from './pages/contract/MaterialPlanning';
// import MaterialDispatch from './pages/contract/MaterialDispatch';
// import DispatchedMaterials from './pages/contract/DispatchedMaterials';

// import DashboardCards from './pages/contract/Reconciliation/DashboardCards';
// import DailyProgress from './pages/contract/Reconciliation/DailyProgress';
// import AreaGraph from './pages/contract/Reconciliation/AreaGraph';
// import MaterialGraph from './pages/contract/Reconciliation/MaterialGraph';
// import ExpenseGraph from './pages/contract/Reconciliation/ExpenseGraph';
// // FIXED: Correct path – it was directly under contract/, not Reconciliation/
// import SiteInchargeEntries from './pages/contract/SiteInchargeEntries';

// import SupplyClientMasterCreation from './pages/supply/SupplyClientMasterCreation';
// import SupplyMasterPoCreation from './pages/supply/SupplyMasterPoCreation';
// import SupplyMaterialPlanning from './pages/supply/SupplyMaterialPlanning';
// import SupplyMaterialDispatch from './pages/supply/SupplyMaterialDispatch';
// import SuppliedMaterials from './pages/supply/SuppliedMaterials';

// import MaterialAcknowledgement from './pages/site-incharge/MaterialAcknowledgement';
// import MaterialUsage from './pages/site-incharge/MaterialUsage';
// import BudgetExpenseEntry from './pages/site-incharge/BudgetExpenseEntry';
// import WorkCompletionEntry from './pages/site-incharge/WorkCompletionEntry';
// import LabourAssign from './pages/site-incharge/LabourAssign';
// import LabourAttendance from './pages/site-incharge/LabourAttendance';
// import AdditionalExpense from './pages/site-incharge/AdditionalExpense';
// import SiteInchargeHistory from './pages/site-incharge/SiteInchargeHistory';

// // === FINANCE PAGES ===
// import Invoices from './pages/finance/Invoices';
// import Creditors from './pages/finance/Creditors';
// import Salary from './pages/finance/Salary';
// import SalaryPayables from './components/FinanceComponents/Salary/SalaryPayables';
// import Transport from './pages/finance/Transport';
// import Scaffolding from './pages/finance/Scaffolding';
// import SiteAccommodation from './pages/finance/SiteAccomodation';
// import Commission from './pages/finance/Commission';
// import Gst from './pages/finance/Gst';
// import Tds from './pages/finance/Tds';
// import TopSheet from './pages/finance/TopSheet';
// import CreditCard from './pages/finance/CreditCard';
// import BilledDebtors from './pages/finance/BilledDebtors';
// import Cfs from './pages/finance/Cfs';
// import CommonPaymentEntry from './pages/finance/CommonPaymentEntry';
// import PaidReceivedDetails from './pages/finance/PaidReceivedDetails';
// import ContractTopSheet from './pages/contract/ContractTopSheet';

// // === RESOURCE PAGES ===
// import EmployeeDetails from './pages/contract/EmployeeDetails';

// // New Consumables Page
// import ConsumablesPage from './pages/resource/ConsumablesPage';
// const Placeholder = ({ title }) => (
//   <div className="p-4">
//     <h1 className="text-xl font-semibold">{title}</h1>
//     <p className="text-gray-600 mt-2">Under Development</p>
//   </div>
// );

// const RedirectToDashboard = () => {
//   const { rolePrefix, encodedUserId } = useParams();
//   return <Navigate to={`/${rolePrefix}/dashboard/${encodedUserId}`} replace />;
// };

// const RedirectToFinanceInvoices = () => {
//   const { rolePrefix, encodedUserId } = useParams();
//   return <Navigate to={`/${rolePrefix}/finance/invoices/${encodedUserId}`} replace />;
// };

// const App = () => {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Login />} />

//         <Route element={<AppLayout />}>
//           {/* Redirect short paths */}
//           <Route
//             path="/:rolePrefix/:encodedUserId"
//             element={<ProtectedRoute roles={['admin', 'superadmin', 'accounts_team']}><RedirectToDashboard /></ProtectedRoute>}
//           />

//           {/* Dashboard */}
//           <Route
//             path="/:rolePrefix/dashboard/:encodedUserId"
//             element={<ProtectedRoute roles={['admin', 'superadmin', 'accounts_team']}><DashboardMain /></ProtectedRoute>}
//           />

//           {/* ====================== FINANCE SECTION ====================== */}
//           <Route
//             path="/:rolePrefix/finance"
//             element={<ProtectedRoute roles={['admin', 'superadmin', 'accounts_team']}><RedirectToFinanceInvoices /></ProtectedRoute>}
//           />

//           <Route path="/:rolePrefix/finance/invoices/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin', 'accounts_team']}><Invoices /></ProtectedRoute>} />
//           <Route path="/:rolePrefix/finance/creditors/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin', 'accounts_team']}><Creditors /></ProtectedRoute>} />
//           <Route path="/:rolePrefix/finance/salary/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin', 'accounts_team']}><Salary /></ProtectedRoute>} />
//           <Route path="/:rolePrefix/finance/salary-payables/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin', 'accounts_team']}><SalaryPayables /></ProtectedRoute>} />
//           <Route path="/:rolePrefix/finance/transport/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin', 'accounts_team']}><Transport /></ProtectedRoute>} />
//           <Route path="/:rolePrefix/finance/scaffolding/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin', 'accounts_team']}><Scaffolding /></ProtectedRoute>} />
//           <Route path="/:rolePrefix/finance/site-accommodation/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin', 'accounts_team']}><SiteAccommodation /></ProtectedRoute>} />
//           <Route path="/:rolePrefix/finance/commission/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin', 'accounts_team']}><Commission /></ProtectedRoute>} />
//           <Route path="/:rolePrefix/finance/gst/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin', 'accounts_team']}><Gst /></ProtectedRoute>} />
//           <Route path="/:rolePrefix/finance/tds/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin', 'accounts_team']}><Tds /></ProtectedRoute>} />
//           <Route path="/:rolePrefix/finance/topsheet/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin', 'accounts_team']}><TopSheet /></ProtectedRoute>} />
//           <Route path="/:rolePrefix/finance/cfs/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin', 'accounts_team']}><Cfs /></ProtectedRoute>} />
//           <Route path="/:rolePrefix/finance/credit-card/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin', 'accounts_team']}><CreditCard /></ProtectedRoute>} />
//           <Route path="/:rolePrefix/finance/billed-debtors/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin', 'accounts_team']}><BilledDebtors /></ProtectedRoute>} />
// <Route 
//   path="/:rolePrefix/finance/paid-received/:encodedUserId" 
//   element={
//     <ProtectedRoute roles={['admin', 'superadmin', 'accounts_team']}>
//       <PaidReceivedDetails />
//     </ProtectedRoute>
//   } 
// />
//           {/* NEW: Payments Route */}
//           <Route 
//             path="/:rolePrefix/finance/payments/:encodedUserId" 
//             element={<ProtectedRoute roles={['admin', 'superadmin', 'accounts_team']}><CommonPaymentEntry /></ProtectedRoute>} 
//           />

//           {/* ====================== CONTRACTS ====================== */}
//           <Route path="/:rolePrefix/contracts/master-client/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin']}><ClientMasterCreation /></ProtectedRoute>} />
//           <Route path="/:rolePrefix/contracts/master-po/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin']}><POMasterMain /></ProtectedRoute>} />
//           <Route path="/:rolePrefix/contracts/projects/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin']}><ProjectList /></ProtectedRoute>} />
//           <Route path="/:rolePrefix/contracts/projects/projections/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin']}><ProjectProjectionNew /></ProtectedRoute>} />
//           <Route path="/:rolePrefix/contracts/projects/work-force-planning/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin']}><WorkForcePlanning /></ProtectedRoute>} />
//           <Route path="/:rolePrefix/contracts/projects/material-planning/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin']}><MaterialPlanning /></ProtectedRoute>} />
//           <Route path="/:rolePrefix/contracts/projects/material-dispatch/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin']}><MaterialDispatch /></ProtectedRoute>} />
//           <Route path="/:rolePrefix/contracts/projects/dispatched-materials/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin']}><DispatchedMaterials /></ProtectedRoute>} />

//           {/* Reconciliation */}
//           <Route 
//   path="/:rolePrefix/contracts/reconciliation/top-sheet/:encodedUserId" 
//   element={
//     <ProtectedRoute roles={['admin', 'superadmin', 'accounts_team']}>
//       <ContractTopSheet />
//     </ProtectedRoute>
//   } 
// />
//           <Route path="/:rolePrefix/contracts/reconciliation/overall-progress/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin']}><DashboardCards /></ProtectedRoute>} />
//           <Route path="/:rolePrefix/contracts/reconciliation/daily-progress/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin']}><DailyProgress /></ProtectedRoute>} />
//           <Route path="/:rolePrefix/contracts/reconciliation/area-completion/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin']}><AreaGraph /></ProtectedRoute>} />
//           <Route path="/:rolePrefix/contracts/reconciliation/material-consumption/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin']}><MaterialGraph /></ProtectedRoute>} />
//           <Route path="/:rolePrefix/contracts/reconciliation/expense/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin']}><ExpenseGraph /></ProtectedRoute>} />
//           <Route path="/:rolePrefix/contracts/reconciliation/site-incharge-entries/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin']}><SiteInchargeEntries /></ProtectedRoute>} />

//           {/* Supply */}
//           <Route path="/:rolePrefix/supply/master-client/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin']}><SupplyClientMasterCreation /></ProtectedRoute>} />
//           <Route path="/:rolePrefix/supply/master-po/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin']}><SupplyMasterPoCreation /></ProtectedRoute>} />
//           <Route path="/:rolePrefix/supply/material-planning/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin']}><SupplyMaterialPlanning /></ProtectedRoute>} />
//           <Route path="/:rolePrefix/supply/material-dispatch/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin']}><SupplyMaterialDispatch /></ProtectedRoute>} />
//           <Route path="/:rolePrefix/supply/supplied-materials/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin']}><SuppliedMaterials /></ProtectedRoute>} />

//           {/* Resources */}
//           <Route path="/:rolePrefix/resource/employee-details/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin']}><EmployeeDetails /></ProtectedRoute>} />
//           {/* NEW: Consumables Route */}
//           <Route path="/:rolePrefix/resource/consumables/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin']}><ConsumablesPage /></ProtectedRoute>} />

//           {/* Site Incharge */}
//           <Route path="/site-incharge/:encodedUserId" element={<ProtectedRoute roles={['site-incharge', 'superadmin']}><Placeholder title="Site Incharge Home" /></ProtectedRoute>} />
//           <Route path="/site-incharge/material-acknowledgment/:encodedUserId" element={<ProtectedRoute roles={['site-incharge', 'superadmin']}><MaterialAcknowledgement /></ProtectedRoute>} />
//           <Route path="/site-incharge/material-usage/:encodedUserId" element={<ProtectedRoute roles={['site-incharge', 'superadmin']}><MaterialUsage /></ProtectedRoute>} />
//           <Route path="/site-incharge/expense-entry/:encodedUserId" element={<ProtectedRoute roles={['site-incharge', 'superadmin']}><BudgetExpenseEntry /></ProtectedRoute>} />
//           <Route path="/site-incharge/work-completion/:encodedUserId" element={<ProtectedRoute roles={['site-incharge', 'superadmin']}><WorkCompletionEntry /></ProtectedRoute>} />
//           <Route path="/site-incharge/labor-assignment/:encodedUserId" element={<ProtectedRoute roles={['site-incharge', 'superadmin']}><LabourAssign /></ProtectedRoute>} />
//           <Route path="/site-incharge/labor-attendance/:encodedUserId" element={<ProtectedRoute roles={['site-incharge', 'superadmin']}><LabourAttendance /></ProtectedRoute>} />
//           <Route path="/site-incharge/additional-expense/:encodedUserId" element={<ProtectedRoute roles={['site-incharge', 'superadmin']}><AdditionalExpense /></ProtectedRoute>} />
//           <Route path="/site-incharge/siteincharge-history/:encodedUserId" element={<ProtectedRoute roles={['site-incharge', 'superadmin']}><SiteInchargeHistory /></ProtectedRoute>} />
//         </Route>
//       </Routes>
//     </BrowserRouter>
//   );
// };

// export default App;





















// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

// === Existing Pages ===
import DashboardMain from './pages/dashboard/DashBoardMain';

import ClientMasterCreation from './pages/contract/ClientMasterCreation';
import POMasterMain from './pages/contract/POMasterMain';
import ProjectList from './pages/contract/ProjectList';
import ProjectProjectionNew from './pages/contract/ProjectProjectionNew';
import WorkForcePlanning from './pages/contract/WorkForcePlanning';
import MaterialPlanning from './pages/contract/MaterialPlanning';
import MaterialDispatch from './pages/contract/MaterialDispatch';
import DispatchedMaterials from './pages/contract/DispatchedMaterials';

import DashboardCards from './pages/contract/Reconciliation/DashboardCards';
import DailyProgress from './pages/contract/Reconciliation/DailyProgress';
import AreaGraph from './pages/contract/Reconciliation/AreaGraph';
import MaterialGraph from './pages/contract/Reconciliation/MaterialGraph';
import ExpenseGraph from './pages/contract/Reconciliation/ExpenseGraph';
import SiteInchargeEntries from './pages/contract/SiteInchargeEntries';

import SupplyClientMasterCreation from './pages/supply/SupplyClientMasterCreation';
import SupplyMasterPoCreation from './pages/supply/SupplyMasterPoCreation';
import SupplyMaterialPlanning from './pages/supply/SupplyMaterialPlanning';
import SupplyMaterialDispatch from './pages/supply/SupplyMaterialDispatch';
import SuppliedMaterials from './pages/supply/SuppliedMaterials';

import MaterialAcknowledgement from './pages/site-incharge/MaterialAcknowledgement';
import WorkAndMaterialEntry from './pages/site-incharge/WorkAndMaterialEntry';
import BudgetExpenseEntry from './pages/site-incharge/BudgetExpenseEntry';
import LabourAssign from './pages/site-incharge/LabourAssign';
import LabourAttendance from './pages/site-incharge/LabourAttendance';
import AdditionalExpense from './pages/site-incharge/AdditionalExpense';
import SiteInchargeHistory from './pages/site-incharge/SiteInchargeHistory';

// === FINANCE PAGES - UPDATED ===
import BankStatementConsolidation from './components/FinanceComponents/New/BankStatementConsolidation';
import PurchaseRegister from './components/FinanceComponents/New/PurchaseRegister';
import PurchaseRegisterWithoutGST from './components/FinanceComponents/New/PurchaseRegisterWithoutGST';
import SalesRegister from './components/FinanceComponents/New/SalesRegister';
import MaterialRegister from './components/FinanceComponents/New/MaterialRegister';

// === RESOURCE PAGES ===
import EmployeeDetails from './pages/contract/EmployeeDetails';
import ConsumablesPage from './pages/resource/ConsumablesPage';

const Placeholder = ({ title }) => (
  <div className="p-4">
    <h1 className="text-xl font-semibold">{title}</h1>
    <p className="text-gray-600 mt-2">Under Development</p>
  </div>
);

const RedirectToDashboard = () => {
  const { rolePrefix, encodedUserId } = useParams();
  return <Navigate to={`/${rolePrefix}/dashboard/${encodedUserId}`} replace />;
};

const RedirectToFinanceBankStatement = () => {
  const { rolePrefix, encodedUserId } = useParams();
  return <Navigate to={`/${rolePrefix}/finance/bank-statement-consolidation/${encodedUserId}`} replace />;
};

const RedirectToWorkAndMaterialEntry = () => {
  const { encodedUserId } = useParams();
  return <Navigate to={`/site-incharge/work-and-material-entry/${encodedUserId}`} replace />;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<AppLayout />}>
          {/* Redirect short paths */}
          <Route
            path="/:rolePrefix/:encodedUserId"
            element={<ProtectedRoute roles={['admin', 'superadmin', 'accounts_team']}><RedirectToDashboard /></ProtectedRoute>}
          />

          {/* Dashboard */}
          <Route
            path="/:rolePrefix/dashboard/:encodedUserId"
            element={<ProtectedRoute roles={['admin', 'superadmin', 'accounts_team']}><DashboardMain /></ProtectedRoute>}
          />

          {/* ====================== FINANCE SECTION - UPDATED ====================== */}
          <Route
            path="/:rolePrefix/finance"
            element={<ProtectedRoute roles={['admin', 'superadmin', 'accounts_team']}><RedirectToFinanceBankStatement /></ProtectedRoute>}
          />

          <Route 
            path="/:rolePrefix/finance/bank-statement-consolidation/:encodedUserId" 
            element={<ProtectedRoute roles={['admin', 'superadmin', 'accounts_team']}><BankStatementConsolidation /></ProtectedRoute>} 
          />
          <Route 
            path="/:rolePrefix/finance/purchase-register/:encodedUserId" 
            element={<ProtectedRoute roles={['admin', 'superadmin', 'accounts_team']}><PurchaseRegister /></ProtectedRoute>} 
          />
          <Route
            path="/:rolePrefix/finance/purchase-register-without-gst/:encodedUserId"
            element={<ProtectedRoute roles={['admin', 'superadmin', 'accounts_team']}><PurchaseRegisterWithoutGST /></ProtectedRoute>}
          />
          <Route 
            path="/:rolePrefix/finance/sales-register/:encodedUserId" 
            element={<ProtectedRoute roles={['admin', 'superadmin', 'accounts_team']}><SalesRegister /></ProtectedRoute>} 
          />
          <Route 
            path="/:rolePrefix/finance/material-register/:encodedUserId" 
            element={<ProtectedRoute roles={['admin', 'superadmin', 'accounts_team']}><MaterialRegister /></ProtectedRoute>} 
          />

          {/* ====================== CONTRACTS ====================== */}
          <Route path="/:rolePrefix/contracts/master-client/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin']}><ClientMasterCreation /></ProtectedRoute>} />
          <Route path="/:rolePrefix/contracts/master-po/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin']}><POMasterMain /></ProtectedRoute>} />
          <Route path="/:rolePrefix/contracts/projects/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin']}><ProjectList /></ProtectedRoute>} />
          <Route path="/:rolePrefix/contracts/projects/projections/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin']}><ProjectProjectionNew /></ProtectedRoute>} />
          <Route path="/:rolePrefix/contracts/projects/work-force-planning/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin']}><WorkForcePlanning /></ProtectedRoute>} />
          <Route path="/:rolePrefix/contracts/projects/material-planning/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin']}><MaterialPlanning /></ProtectedRoute>} />
          <Route path="/:rolePrefix/contracts/projects/material-dispatch/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin']}><MaterialDispatch /></ProtectedRoute>} />
          <Route path="/:rolePrefix/contracts/projects/dispatched-materials/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin']}><DispatchedMaterials /></ProtectedRoute>} />

          {/* Reconciliation */}
          <Route 
            path="/:rolePrefix/contracts/reconciliation/top-sheet/:encodedUserId" 
            element={<ProtectedRoute roles={['admin', 'superadmin', 'accounts_team']}><DashboardCards /></ProtectedRoute>} 
          />
          <Route path="/:rolePrefix/contracts/reconciliation/overall-progress/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin']}><DashboardCards /></ProtectedRoute>} />
          <Route path="/:rolePrefix/contracts/reconciliation/daily-progress/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin']}><DailyProgress /></ProtectedRoute>} />
          <Route path="/:rolePrefix/contracts/reconciliation/area-completion/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin']}><AreaGraph /></ProtectedRoute>} />
          <Route path="/:rolePrefix/contracts/reconciliation/material-consumption/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin']}><MaterialGraph /></ProtectedRoute>} />
          <Route path="/:rolePrefix/contracts/reconciliation/expense/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin']}><ExpenseGraph /></ProtectedRoute>} />
          <Route path="/:rolePrefix/contracts/reconciliation/site-incharge-entries/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin']}><SiteInchargeEntries /></ProtectedRoute>} />

          {/* Supply */}
          <Route path="/:rolePrefix/supply/master-client/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin']}><SupplyClientMasterCreation /></ProtectedRoute>} />
          <Route path="/:rolePrefix/supply/master-po/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin']}><SupplyMasterPoCreation /></ProtectedRoute>} />
          <Route path="/:rolePrefix/supply/material-planning/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin']}><SupplyMaterialPlanning /></ProtectedRoute>} />
          <Route path="/:rolePrefix/supply/material-dispatch/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin']}><SupplyMaterialDispatch /></ProtectedRoute>} />
          <Route path="/:rolePrefix/supply/supplied-materials/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin']}><SuppliedMaterials /></ProtectedRoute>} />

          {/* Resources */}
          <Route path="/:rolePrefix/resource/employee-details/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin']}><EmployeeDetails /></ProtectedRoute>} />
          <Route path="/:rolePrefix/resource/consumables/:encodedUserId" element={<ProtectedRoute roles={['admin', 'superadmin']}><ConsumablesPage /></ProtectedRoute>} />

          {/* Site Incharge */}
          <Route path="/site-incharge/:encodedUserId" element={<ProtectedRoute roles={['site-incharge', 'superadmin']}><Placeholder title="Site Incharge Home" /></ProtectedRoute>} />
          <Route path="/site-incharge/material-acknowledgment/:encodedUserId" element={<ProtectedRoute roles={['site-incharge', 'superadmin']}><MaterialAcknowledgement /></ProtectedRoute>} />
          <Route path="/site-incharge/expense-entry/:encodedUserId" element={<ProtectedRoute roles={['site-incharge', 'superadmin']}><BudgetExpenseEntry /></ProtectedRoute>} />
          <Route path="/site-incharge/work-and-material-entry/:encodedUserId" element={<ProtectedRoute roles={['site-incharge', 'superadmin']}><WorkAndMaterialEntry /></ProtectedRoute>} />
          <Route path="/site-incharge/material-usage/:encodedUserId" element={<ProtectedRoute roles={['site-incharge', 'superadmin']}><RedirectToWorkAndMaterialEntry /></ProtectedRoute>} />
          <Route path="/site-incharge/work-completion/:encodedUserId" element={<ProtectedRoute roles={['site-incharge', 'superadmin']}><RedirectToWorkAndMaterialEntry /></ProtectedRoute>} />
          <Route path="/site-incharge/labor-assignment/:encodedUserId" element={<ProtectedRoute roles={['site-incharge', 'superadmin']}><LabourAssign /></ProtectedRoute>} />
          <Route path="/site-incharge/labor-attendance/:encodedUserId" element={<ProtectedRoute roles={['site-incharge', 'superadmin']}><LabourAttendance /></ProtectedRoute>} />
          <Route path="/site-incharge/additional-expense/:encodedUserId" element={<ProtectedRoute roles={['site-incharge', 'superadmin']}><AdditionalExpense /></ProtectedRoute>} />
          <Route path="/site-incharge/siteincharge-history/:encodedUserId" element={<ProtectedRoute roles={['site-incharge', 'superadmin']}><SiteInchargeHistory /></ProtectedRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;