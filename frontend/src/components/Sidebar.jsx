// import React, { useMemo, useState } from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import { sidebarConfig, miscIcons } from '../utils/menuData';

// const Sidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
//   const { pathname } = useLocation();
//   const sectionKey = useMemo(() => {
//     // Choose the longest matching base path
//     const bases = Object.keys(sidebarConfig);
//     const match = bases
//       .filter((b) => pathname === b || (b !== '/' && pathname.startsWith(b)))
//       .sort((a, b) => b.length - a.length)[0] || '/';
//     return match;
//   }, [pathname]);

//   const items = sidebarConfig[sectionKey] || [];
//   const [openAccordions, setOpenAccordions] = useState({});

//   const toggleAccordion = (title) =>
//     setOpenAccordions((prev) => ({ ...prev, [title]: !prev[title] }));

//   const { PanelLeftClose, PanelLeftOpen, ChevronDown } = miscIcons;

//   const base = (
//     <aside
//       className={`flex flex-col h-full bg-[#FAF9F6] shadow-lg transition-all duration-300 ${
//         collapsed ? 'w-16' : 'w-64'
//       }`}
//     >
//       <div
//         className={`flex items-center justify-between p-3 border-b ${
//           collapsed ? 'justify-center' : ''
//         }`}
//       >
//         {!collapsed && <span className="text-sm font-semibold text-gray-700">Navigation</span>}
//         <button 
//           className="p-1 rounded hover:bg-gray-100 cursor-pointer"
//           onClick={() => setCollapsed((c) => !c)}
//           aria-label="Toggle collapse"
//           title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
//         >
//           {collapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
//         </button>
//       </div>

//       <nav className="flex-1 p-2 overflow-y-auto">
//         {items.map((group) => {
//           const GroupIcon = group.icon;
//           const hasAccordion = !!group.accordion;

//           return (
//             <div key={group.title} className="mb-2">
//               <div
//                 className={`px-2 py-2 text-white bg-[#1e7a6f] uppercase text-xs font-semibold flex items-center gap-2 ${
//                   collapsed ? 'justify-center relative group' : ''
//                 }`}
//                 title={collapsed ? group.title : undefined}
//               >
//                 <GroupIcon className="w-4 h-4" />
//                 {!collapsed && <span>{group.title}</span>}
//                 {/* Optional Custom Tooltip */}
//                 {/* {collapsed && (
//                   <div className="absolute left-full ml-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 z-50">
//                     {group.title}
//                   </div>
//                 )} */}
//               </div>

//               <div className="space-y-1">
//                 {group.items?.map((it) => {
//                   const ItemIcon = it.icon;
//                   const active = pathname === it.to;
//                   return (
//                     <Link
//                       key={it.label}
//                       to={it.to}
//                       className={`flex items-center gap-3 rounded-md px-2 py-2 my-1 hover:bg-emerald-50 ${
//                         active ? 'bg-emerald-100 text-emerald-800' : 'text-gray-700'
//                       } ${collapsed ? 'justify-center relative group' : ''}`}
//                       title={collapsed ? it.label : undefined}
//                     >
//                       <ItemIcon className="w-5 h-5" />
//                       {!collapsed && <span className="text-sm">{it.label}</span>}
//                       {/* Optional Custom Tooltip */}
//                       {/* {collapsed && (
//                         <div className="absolute left-full ml-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 z-50">
//                           {it.label}
//                         </div>
//                       )} */}
//                     </Link>
//                   );
//                 })}

//                 {hasAccordion && (
//                   <div>
//                     <button
//                       onClick={() => toggleAccordion(group.accordion.label)}
//                       className={`w-full flex items-center gap-3 rounded-md px-2 py-2 hover:bg-emerald-50 text-gray-700 ${
//                         collapsed ? 'justify-center relative group' : ''
//                       }`}
//                       title={collapsed ? group.accordion.label : undefined}
//                     >
//                       <group.accordion.icon className="w-5 h-5" />
//                       {!collapsed && (
//                         <>
//                           <span className="text-sm">{group.accordion.label}</span>
//                           <ChevronDown
//                             className={`ml-auto w-4 h-4 transition-transform ${
//                               openAccordions[group.accordion.label] ? 'rotate-180' : ''
//                             }`}
//                           />
//                         </>
//                       )}
//                       {/* Optional Custom Tooltip */}
//                       {/* {collapsed && (
//                         <div className="absolute left-full ml-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 z-50">
//                           {group.accordion.label}
//                         </div>
//                       )} */}
//                     </button>

//                     <div
//                       className={`${
//                         openAccordions[group.accordion.label] ? 'max-h-96' : 'max-h-0'
//                       } overflow-hidden transition-all`}
//                     >
//                       {!collapsed && (
//                         <div className="pl-6 py-1 space-y-1">
//                           {group.accordion.children.map((child) => {
//                             const ChildIcon = child.icon;
//                             const active = pathname === child.to;
//                             return (
//                               <Link
//                                 key={child.label}
//                                 to={child.to}
//                                 className={`flex items-center gap-3 rounded-md px-2 py-2 hover:bg-emerald-50 ${
//                                   active ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700'
//                                 }`}
//                               >
//                                 <ChildIcon className="w-4 h-4" />
//                                 <span className="text-sm">{child.label}</span>
//                               </Link>
//                             );
//                           })}
//                           {group.accordion.allowAdd && (
//                             <Link
//                               to={group.accordion.allowAdd.to}
//                               className="flex items-center gap-2 text-emerald-700 hover:underline px-2 py-1"
//                             >
//                               <group.accordion.allowAdd.icon className="w-4 h-4" />
//                               <span className="text-sm">{group.accordion.allowAdd.label}</span>
//                             </Link>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           );
//         })}
//       </nav>
//     </aside>
//   );

//   return (
//     <>
//       {/* Desktop */}
//       <div className="hidden lg:block h-[calc(100vh-56px)] sticky z-50 top-14">
//         {base}
//       </div>

//       {/* Mobile overlay */}
//       {mobileOpen && (
//         <div
//           className="fixed inset-0 bg-black/40 z-40 lg:hidden"
//           onClick={() => setMobileOpen(false)}
//         />
//       )}
//       <div
//         className={`fixed inset-y-14 left-0 z-50 lg:hidden transition-transform duration-300 ${
//           mobileOpen ? 'translate-x-0' : '-translate-x-full'
//         }`}
//       >
//         <div className="h-[calc(100vh-56px)]">
//           {base}
//         </div>
//       </div>
//     </>
//   );
// };

// export default Sidebar;


import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getSidebarConfig, miscIcons } from '../utils/menuData';

const Sidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
  const { pathname } = useLocation();
  const user = JSON.parse(sessionStorage.getItem('user')) || {};
  const role = user.role;
  const encodedUserId = localStorage.getItem('encodedUserId');
  const sidebarConfig = getSidebarConfig(role, encodedUserId);
  const sectionKey = useMemo(() => {
    // Choose the longest matching base path
    const bases = Object.keys(sidebarConfig);
    const match = bases
      .filter((b) => pathname === b || (b !== '/' && pathname.startsWith(b)))
      .sort((a, b) => b.length - a.length)[0] || '/';
    return match;
  }, [pathname]);

  const items = sidebarConfig[sectionKey] || [];
  const [openAccordions, setOpenAccordions] = useState({});

  const toggleAccordion = (title) =>
    setOpenAccordions((prev) => ({ ...prev, [title]: !prev[title] }));

  const { PanelLeftClose, PanelLeftOpen, ChevronDown } = miscIcons;

  const base = (
    <aside
      className={`flex flex-col h-full bg-[#FAF9F6] shadow-lg transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div
        className={`flex items-center justify-between p-3 border-b ${
          collapsed ? 'justify-center' : ''
        }`}
      >
        {!collapsed && <span className="text-sm font-semibold text-gray-700">Navigation</span>}
        <button 
          className="p-1 rounded hover:bg-gray-100 cursor-pointer"
          onClick={() => setCollapsed((c) => !c)}
          aria-label="Toggle collapse"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>
      </div>

      <nav className="flex-1 p-2 overflow-y-auto">
        {items.map((group) => {
          const GroupIcon = group.icon;
          const hasAccordion = !!group.accordion;

          return (
            <div key={group.title} className="mb-2">
              <div
                className={`px-2 py-2 text-white bg-[#1e7a6f] uppercase text-xs font-semibold flex items-center gap-2 ${
                  collapsed ? 'justify-center relative group' : ''
                }`}
                title={collapsed ? group.title : undefined}
              >
                <GroupIcon className="w-4 h-4" />
                {!collapsed && <span>{group.title}</span>}
                {/* Optional Custom Tooltip */}
                {/* {collapsed && (
                  <div className="absolute left-full ml-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 z-50">
                    {group.title}
                  </div>
                )} */}
              </div>

              <div className="space-y-1">
                {group.items?.map((it) => {
                  const ItemIcon = it.icon;
                  const active = pathname === it.to;
                  return (
                    <Link
                      key={it.label}
                      to={it.to}
                      className={`flex items-center gap-3 rounded-md px-2 py-2 my-1 hover:bg-emerald-50 ${
                        active ? 'bg-emerald-100 text-emerald-800' : 'text-gray-700'
                      } ${collapsed ? 'justify-center relative group' : ''}`}
                      title={collapsed ? it.label : undefined}
                    >
                      <ItemIcon className="w-5 h-5" />
                      {!collapsed && <span className="text-sm">{it.label}</span>}
                      {/* Optional Custom Tooltip */}
                      {/* {collapsed && (
                        <div className="absolute left-full ml-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 z-50">
                          {it.label}
                        </div>
                      )} */}
                    </Link>
                  );
                })}

                {hasAccordion && (
                  <div>
                    <button
                      onClick={() => toggleAccordion(group.accordion.label)}
                      className={`w-full flex items-center gap-3 rounded-md px-2 py-2 hover:bg-emerald-50 text-gray-700 ${
                        collapsed ? 'justify-center relative group' : ''
                      }`}
                      title={collapsed ? group.accordion.label : undefined}
                    >
                      <group.accordion.icon className="w-5 h-5" />
                      {!collapsed && (
                        <>
                          <span className="text-sm">{group.accordion.label}</span>
                          <ChevronDown
                            className={`ml-auto w-4 h-4 transition-transform ${
                              openAccordions[group.accordion.label] ? 'rotate-180' : ''
                            }`}
                          />
                        </>
                      )}
                      {/* Optional Custom Tooltip */}
                      {/* {collapsed && (
                        <div className="absolute left-full ml-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 z-50">
                          {group.accordion.label}
                        </div>
                      )} */}
                    </button>

                    <div
                      className={`${
                        openAccordions[group.accordion.label] ? 'max-h-96' : 'max-h-0'
                      } overflow-hidden transition-all`}
                    >
                      {!collapsed && (
                        <div className="pl-6 py-1 space-y-1">
                          {group.accordion.children.map((child) => {
                            const ChildIcon = child.icon;
                            const active = pathname === child.to;
                            return (
                              <Link
                                key={child.label}
                                to={child.to}
                                className={`flex items-center gap-3 rounded-md px-2 py-2 hover:bg-emerald-50 ${
                                  active ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700'
                                }`}
                              >
                                <ChildIcon className="w-4 h-4" />
                                <span className="text-sm">{child.label}</span>
                              </Link>
                            );
                          })}
                          {group.accordion.allowAdd && (
                            <Link
                              to={group.accordion.allowAdd.to}
                              className="flex items-center gap-2 text-emerald-700 hover:underline px-2 py-1"
                            >
                              <group.accordion.allowAdd.icon className="w-4 h-4" />
                              <span className="text-sm">{group.accordion.allowAdd.label}</span>
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:block h-[calc(100vh-56px)] sticky z-50 top-14">
        {base}
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div
        className={`fixed inset-y-14 left-0 z-50 lg:hidden transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-[calc(100vh-56px)]">
          {base}
        </div>
      </div>
    </>
  );
};

export default Sidebar;