import React from "react";
import Select from "react-select";

const ProjectSelection = ({
  companies,
  projects,
  sites,
  workDescriptions,
  selectedCompany,
  selectedProject,
  selectedSite,
  selectedWorkDescription,
  loading,
  onCompanyChange,
  onProjectChange,
  onSiteChange,
  onWorkDescriptionChange,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Project Selection</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
          <Select
            value={selectedCompany}
            onChange={onCompanyChange}
            options={companies}
            placeholder="Select a company..."
            isLoading={loading}
            isClearable
            classNamePrefix="text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
          <Select
            value={selectedProject}
            onChange={onProjectChange}
            options={projects}
            placeholder="Select a project..."
            isLoading={loading}
            isDisabled={!selectedCompany}
            isClearable
            classNamePrefix="text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Site</label>
          <Select
            value={selectedSite}
            onChange={onSiteChange}
            options={sites}
            placeholder="Select a site..."
            isLoading={loading}
            isDisabled={!selectedProject}
            isClearable
            classNamePrefix="text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Work Description</label>
          <Select
            value={selectedWorkDescription}
            onChange={onWorkDescriptionChange}
            options={workDescriptions}
            placeholder="Select work description..."
            isLoading={loading}
            isDisabled={!selectedSite}
            isClearable
            classNamePrefix="text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectSelection;