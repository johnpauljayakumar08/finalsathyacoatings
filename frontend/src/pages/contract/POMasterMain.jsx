import { API_BASE_URL } from "../../config/api.js";
import { useEffect, useState } from 'react';
import POMasterCreation from './POMasterCreation'
import axios from 'axios';
import ProjectCreation from '../../components/ProjectCreation';

const POMasterMain = () => {

      const [companies, setCompanies] = useState([]);
      const [showProjectModal, setShowProjectModal] = useState(false);

      const selectedCompanyId = localStorage.getItem("selectedCompanyId")


      const fetchCompanies = async () => {
        try {
        const response = await axios.get(`${API_BASE_URL}/project/companies`);
        setCompanies(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
        console.error("Error fetching companies:", error);
        setCompanies([]);
        }
      };

        useEffect(() => {
            fetchCompanies();
        }, []);

       const handleProjectCreated = () => {
          fetchCompanies();
          setShowProjectModal(false);
          Swal.fire({
            position: "top-end",
            icon: "success",
            title: "Project created successfully!",
            showConfirmButton: false,
            timer: 2000,
            toast: true,
            background: "#ecfdf5",
            iconColor: "#10b981",
          });
        };


      
  return (
    <>
        <POMasterCreation
          onShowProjectModal={() => setShowProjectModal(true)} 
          companies={companies}
        />

        {showProjectModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 sm:p-0 animate-fade-in"
          onClick={() => setShowProjectModal(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Create Project Modal"
        >
          <div
            className="w-full max-w-[90%] sm:max-w-md md:max-w-lg transform transition-all duration-300 animate-slide-in-up bg-white rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <ProjectCreation
              companyId={selectedCompanyId}
              onProjectCreated={handleProjectCreated}
              onClose={() => setShowProjectModal(false)}
            />
          </div>
        </div>
      )}
    </>
  )
}

export default POMasterMain