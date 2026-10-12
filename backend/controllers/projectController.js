// projectController.js
const projectModel = require('../models/projectModel');

exports.createCompany = async (req, res) => {
    try {
        const {
            company_name,
            address,
            gst_number,
            vendor_code,
            city_id,
            state_id,
            pincode,
            spoc_name,
            spoc_contact_no,
            created_by // Assume this comes from the frontend or auth middleware
        } = req.body;

        if (!company_name || !address || !spoc_name || !spoc_contact_no || !created_by) {
            return res.status(400).json({ error: "Company name, address, SPOC name, SPOC contact number, and created_by are required" });
        }

        const company_id = await projectModel.generateNewCompanyId();

        await projectModel.insertCompany(
            company_id,
            company_name,
            address,
            gst_number,
            vendor_code,
            city_id ? parseInt(city_id) : null,
            state_id ? parseInt(state_id) : null,
            pincode,
            spoc_name,
            spoc_contact_no,
            created_by,
            created_by // Initially, created_by and updated_by are the same
        );

        // Fetch the created_at after insertion
        const createdCompany = await projectModel.getCompanyById(company_id);
        const created_at = createdCompany.created_at;

        // Log the creation in company_updation_history
        await projectModel.insertCompanyUpdateHistory(
            company_id,
            company_name,
            address,
            spoc_name,
            spoc_contact_no,
            gst_number,
            vendor_code,
            city_id ? parseInt(city_id) : null,
            state_id ? parseInt(state_id) : null,
            pincode,
            created_at,
            created_by
        );

        res.status(201).json({ message: "Company created successfully", company_id });
    } catch (error) {
        console.error("Error creating company:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// New endpoints
exports.getStates = async (req, res) => {
    try {
        const states = await projectModel.getStates();
        res.status(200).json({ data: states });
    } catch (error) {
        console.error("Error fetching states:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.getCities = async (req, res) => {
    try {
        const cities = await projectModel.getCities();
        res.status(200).json({ data: cities });
    } catch (error) {
        console.error("Error fetching cities:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.createState = async (req, res) => {
    try {
        const { state_name } = req.body;
        if (!state_name) {
            return res.status(400).json({ error: "State name is required" });
        }
        const id = await projectModel.addState(state_name);
        res.status(201).json({ message: "State created successfully", id });
    } catch (error) {
        console.error("Error creating state:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.createCity = async (req, res) => {
    try {
        const { city_name } = req.body;
        if (!city_name) {
            return res.status(400).json({ error: "City name is required" });
        }
        const id = await projectModel.addCity(city_name);
        res.status(201).json({ message: "City created successfully", id });
    } catch (error) {
        console.error("Error creating city:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.getAllCompanies = async (req, res) => {
    try {
        const companies = await projectModel.fetchAllCompanies();
        res.status(200).json(companies);
    } catch (error) {
        console.error("Error fetching companies:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.getCompanyById = async (req, res) => {
    try {
        const { companyId } = req.params;

        if (!companyId) {
            return res.status(400).json({ error: "Company ID is required" });
        }

        const company = await projectModel.fetchCompanyById(companyId);
        if (!company) {
            return res.status(404).json({ error: "Company not found" });
        }

        res.status(200).json(company);
    } catch (error) {
        console.error("Error fetching company by ID:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.getProjectsByCompanyId = async (req, res) => {
    try {
        const { companyId } = req.params;

        if (!companyId) {
            return res.status(400).json({ error: "Company ID is required" });
        }

        const projects = await projectModel.fetchProjectsByCompanyId(companyId);
        res.status(200).json(projects);
    } catch (error) {
        console.error("Error fetching projects by company ID:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.getReckonerTypes = async (req, res) => {
    try {
        const reckonerTypes = await projectModel.getReckonerTypes();
        console.log("Fetched reckoner types:", reckonerTypes);
        res.status(200).json(reckonerTypes);
    } catch (error) {
        console.error("Error fetching reckoner types:", error);
        res.status(500).json({ error: "Failed to fetch reckoner types" });
    }
};

exports.getNextPoNumber = async (req, res) => {
    try {
        const { reckoner_type_id } = req.params;
        console.log(`Received request for next PO number with reckoner_type_id: ${reckoner_type_id}`);
        const nextPoNumber = await projectModel.getNextPoNumber(reckoner_type_id);
        if (!nextPoNumber) {
            console.error(`Failed to generate PO number for reckoner_type_id: ${reckoner_type_id}`);
            return res.status(400).json({ error: "Invalid reckoner type or not applicable for auto-generation" });
        }
        res.status(200).json({ po_number: nextPoNumber });
    } catch (error) {
        console.error("Error in getNextPoNumber:", error);
        res.status(500).json({ error: "Failed to fetch next PO number" });
    }
};

exports.createProjectWithSite = async (req, res) => {
  const db = require("../config/db"); // Assuming your DB connection
  let connection;
  try {
    const {
      project_type,
      company_id,
      project_name,
      site_name,
      po_number: providedPoNumber,
      po_date,                      // NEW
      start_date,
      end_date,
      incharge_type,
      location_id,
      new_location_name,
      reckoner_type_id,
      incharge_assignments,
      created_by
    } = req.body;

    console.log("Received createProjectWithSite request:", req.body);

    // Validate required fields (updated to include created_by)
    if (!project_type || !company_id || !project_name || !site_name ||
        !start_date || !incharge_type ||
        (!location_id && !new_location_name) || !reckoner_type_id || !created_by) {
      console.error("Validation failed: Missing required fields");
      return res.status(400).json({ error: "All fields are required, including created_by, either location_id or new_location_name, and reckoner_type_id" });
    }

    if (project_type !== "service") {
      console.error(`Invalid project type: ${project_type}`);
      return res.status(400).json({ error: "Project type must be 'service'" });
    }

    // Start a transaction
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Validate project type
    const project_type_id = await projectModel.getProjectTypeId(project_type);
    if (!project_type_id) {
      console.error(`Invalid project type ID for: ${project_type}`);
      await connection.rollback();
      return res.status(400).json({ error: "Invalid project type" });
    }

    // Handle location
    let finalLocationId = location_id;
    if (new_location_name && !location_id) {
      const existingLocationId = await projectModel.getLocationId(new_location_name);
      if (existingLocationId) {
        finalLocationId = existingLocationId;
      } else {
        finalLocationId = await projectModel.generateNewLocationId();
        await projectModel.insertLocation(finalLocationId, new_location_name);
      }
    }

    if (!finalLocationId) {
      console.error("No location ID provided or generated");
      await connection.rollback();
      return res.status(400).json({ error: "Location ID is required" });
    }

    // Handle project (updated: pass created_by)
    let project = await projectModel.getProjectByNameAndType(project_name, project_type_id);
    let project_id;
    if (project) {
      project_id = project.pd_id;
    } else {
      project_id = await projectModel.generateNewProjectId();
      await projectModel.insertProject(project_id, project_type_id, company_id, project_name, created_by);
    }

    // Validate incharge type
    const incharge_id = await projectModel.getInchargeId(incharge_type);
    if (!incharge_id) {
      console.error(`Invalid incharge type: ${incharge_type}`);
      await connection.rollback();
      return res.status(400).json({ error: "Invalid incharge type" });
    }

    // Validate reckoner type
    const reckonerTypes = await projectModel.getReckonerTypes();
    const reckonerType = reckonerTypes.find(type => type.type_id == reckoner_type_id);
    if (!reckonerType) {
      console.error(`Invalid reckoner type ID: ${reckoner_type_id}`);
      await connection.rollback();
      return res.status(400).json({ error: "Invalid reckoner type" });
    }

    // Auto-generate PO number for reckoner_type_id: 3 if not provided
    let finalPoNumber = providedPoNumber;
    if (!providedPoNumber && reckoner_type_id === '3') {
      finalPoNumber = await projectModel.getNextPoNumber(reckoner_type_id);
    }

    if (!finalPoNumber) {
      console.error("No PO number provided or generated for reckoner_type_id: 3");
      await connection.rollback();
      return res.status(400).json({ error: "PO number is required" });
    }

    // NEW: validate po_date format if provided
    let finalPoDate = po_date || null;
    if (finalPoDate && !/^\d{4}-\d{2}-\d{2}$/.test(finalPoDate)) {
      console.error(`Invalid po_date format: ${finalPoDate}`);
      await connection.rollback();
      return res.status(400).json({ error: "po_date must be in YYYY-MM-DD format" });
    }

    // Insert into site_details table (updated: pass created_by and po_date)
    const site_id = await projectModel.generateNewSiteId();
    await projectModel.insertSite(
      site_id,
      site_name,
      finalPoNumber,
      finalPoDate,        // NEW
      start_date,
      end_date,
      incharge_id,
      null, // workforce_id
      project_id,
      finalLocationId,
      reckoner_type_id,
      created_by,
      created_by // Initially, created_by and updated_by are the same
    );

    // Handle incharge assignments if provided
    const insertedIds = [];
    if (incharge_assignments && Array.isArray(incharge_assignments) && incharge_assignments.length > 0) {
      for (const { emp_id, from_date, to_date } of incharge_assignments) {
        if (!emp_id || !from_date || !to_date) {
          console.error("Missing required fields in incharge assignment");
          await connection.rollback();
          return res.status(400).json({
            status: 'error',
            message: 'Missing required fields: emp_id, from_date, and to_date are required'
          });
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(from_date) || !/^\d{4}-\d{2}-\d{2}$/.test(to_date)) {
          console.error(`Invalid date format: from_date=${from_date}, to_date=${to_date}`);
          await connection.rollback();
          return res.status(400).json({
            status: 'error',
            message: 'Invalid date format: from_date and to_date must be in YYYY-MM-DD format'
          });
        }

        const fromDate = new Date(from_date);
        const toDate = new Date(to_date);
        if (toDate < fromDate) {
          console.error("to_date is before from_date");
          await connection.rollback();
          return res.status(400).json({
            status: 'error',
            message: 'to_date must be after from_date'
          });
        }

        const [employee] = await connection.query('SELECT emp_id FROM employee_master WHERE emp_id = ?', [emp_id]);
        if (!employee || employee.length === 0) {
          console.error(`Invalid emp_id: ${emp_id}`);
          await connection.rollback();
          return res.status(400).json({
            status: 'error',
            message: `Invalid emp_id: ${emp_id} does not exist in employee_master`
          });
        }

        const [result] = await connection.query(
          'INSERT INTO siteincharge_assign (from_date, to_date, pd_id, site_id, emp_id, created_by) VALUES (?, ?, ?, ?, ?, ?)',
          [from_date, to_date, project_id, site_id, emp_id, created_by]
        );
        insertedIds.push(result.insertId);
      }
    }

    // Commit transaction
    await connection.commit();

    res.status(201).json({
      status: 'success',
      message: "Project, site, and incharge assignments created successfully",
      project_id,
      site_id,
      incharge_assignment_ids: insertedIds.length > 0 ? insertedIds : undefined
    });
  } catch (error) {
    console.error("Error in createProjectWithSite:", error);
    if (connection) {
      await connection.rollback();
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid pd_id, site_id, or emp_id: referenced record does not exist'
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
      error: error.message
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

exports.fetchWorkforceTypes = async (req, res) => {
    try {
        const workforceTypes = await projectModel.getWorkforceTypes();
        res.status(200).json(workforceTypes);
    } catch (error) {
        console.error("Error fetching workforce types:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.fetchSiteIncharges = async (req, res) => {
    try {
        const siteIncharges = await projectModel.getSiteIncharges();
        res.status(200).json(siteIncharges);
    } catch (error) {
        console.error("Error fetching site incharges:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.projectType = async (req, res) => {
    try {
        const projectType = await projectModel.getProjectType();
        res.status(200).json(projectType);
    } catch (error) {
        console.error("Error fetching project types:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.getAllProjectsWithSites = async (req, res) => {
    try {
        const projects = await projectModel.getAllProjectsWithSites();
        const transformedProjects = projects.reduce((acc, project) => {
            const existingProject = acc.find(p => p.project_id === project.project_id);
            if (existingProject) {
                if (project.site_id) {
                    existingProject.sites.push({
                        site_id: project.site_id,
                        site_name: project.site_name,
                        po_number: project.po_number,
                        start_date: project.start_date,
                        end_date: project.end_date,
                        incharge_type: project.incharge_type || "N/A",
                        location_name: project.location_name || "N/A"
                    });
                }
            } else {
                const newProject = {
                    project_id: project.project_id,
                    project_name: project.project_name,
                    project_type: project.project_type,
                    company_id: project.company_id,
                    company_name: project.company_name,
                    sites: project.site_id ? [{
                        site_id: project.site_id,
                        site_name: project.site_name,
                        po_number: project.po_number,
                        start_date: project.start_date,
                        end_date: project.end_date,
                        incharge_type: project.incharge_type || "N/A",
                        location_name: project.location_name || "N/A"
                    }] : []
                };
                acc.push(newProject);
            }
            return acc;
        }, []);
        res.status(200).json(transformedProjects);
    } catch (error) {
        console.error("Detailed error in getAllProjectsWithSites:", error.message, error.stack);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

exports.getAllProjectsWithSitesByCompanyId = async (req, res) => {
    try {
        const { companyId } = req.params;
        
        if (!companyId) {
            return res.status(400).json({ error: "Company ID is required" });
        }

        const projects = await projectModel.getAllProjectsWithSitesByCompanyId(companyId);
        
        if (projects.length === 0) {
            return res.status(404).json({ error: "No projects found for this company" });
        }

        const transformedProjects = projects.reduce((acc, project) => {
            const existingProject = acc.find(p => p.project_id === project.project_id);
            
            if (existingProject) {
                if (project.site_id) {
                    existingProject.sites.push({
                        site_id: project.site_id,
                        site_name: project.site_name,
                        po_number: project.po_number,
                        start_date: project.start_date,
                        end_date: project.end_date,
                        incharge_type: project.incharge_type || "N/A",
                        location_name: project.location_name || "N/A"
                    });
                }
            } else {
                const newProject = {
                    project_id: project.project_id,
                    project_name: project.project_name,
                    project_type: project.project_type,
                    company_id: project.company_id,
                    company_name: project.company_name,
                    sites: project.site_id ? [{
                        site_id: project.site_id,
                        site_name: project.site_name,
                        po_number: project.po_number,
                        start_date: project.start_date,
                        end_date: project.end_date,
                        incharge_type: project.incharge_type || "N/A",
                        location_name: project.location_name || "N/A"
                    }] : []
                };
                acc.push(newProject);
            }
            
            return acc;
        }, []);
        
        res.status(200).json(transformedProjects);
    } catch (error) {
        console.error("Error fetching projects with sites by company ID:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.getAllLocations = async (req, res) => {
    try {
        const locations = await projectModel.getAllLocations();
        res.status(200).json(locations);
    } catch (error) {
        console.error("Error fetching locations:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.createProject = async (req, res) => {
    try {
        const { company_id, project_name, created_by } = req.body;

        if (!company_id || !project_name || !created_by) {
            return res.status(400).json({ error: "Company ID, project name, and created_by are required" });
        }

        // Verify company exists
        const company = await projectModel.fetchCompanyById(company_id);
        if (!company) {
            return res.status(404).json({ error: "Company not found" });
        }

        const newProject = await projectModel.createProject(company_id, project_name, created_by);

        res.status(201).json({
            message: "Project created successfully",
            project_id: newProject.project_id,
            project_name: newProject.project_name,
        });
    } catch (error) {
        console.error("Error creating project:", error);
        res.status(500).json({ error: "Failed to create project", details: error.message });
    }
};

// New function in projectController.js
exports.getWorkDescriptionsBySite = async (req, res) => {
    try {
        const { site_id } = req.params;

        if (!site_id) {
            return res.status(400).json({ error: "site_id is required" });
        }

        // Assuming projectModel has a function getWorkDescriptionsBySite(site_id)
        const descriptions = await projectModel.getWorkDescriptionsBySite(site_id);

        res.status(200).json(descriptions);
    } catch (error) {
        console.error("Error fetching work descriptions by site:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.updateCompany = async (req, res) => {
    try {
        const {
            company_id,
            company_name,
            address,
            gst_number,
            vendor_code,
            city_id,
            state_id,
            pincode,
            spoc_name,
            spoc_contact_no,
            updated_by
        } = req.body;

        // Validate required fields
        const missingFields = [];
        if (!company_id) missingFields.push("company_id");
        if (!company_name) missingFields.push("company_name");
        if (!address) missingFields.push("address");
        if (!spoc_name) missingFields.push("spoc_name");
        if (!spoc_contact_no) missingFields.push("spoc_contact_no");
        if (!updated_by) missingFields.push("updated_by");

        if (missingFields.length > 0) {
            return res.status(400).json({ error: `Missing required fields: ${missingFields.join(", ")}` });
        }

        // Validate city_id and state_id
        if (city_id && (isNaN(parseInt(city_id)) || parseInt(city_id) <= 0)) {
            return res.status(400).json({ error: "city_id must be a valid positive integer" });
        }
        if (state_id && (isNaN(parseInt(state_id)) || parseInt(state_id) <= 0)) {
            return res.status(400).json({ error: "state_id must be a valid positive integer" });
        }

        // Validate spoc_contact_no (10-digit phone number)
        if (spoc_contact_no && !/^\d{10}$/.test(spoc_contact_no)) {
            return res.status(400).json({ error: "spoc_contact_no must be a valid 10-digit phone number" });
        }

        // Fetch current company data
        const currentCompany = await projectModel.getCompanyById(company_id);
        if (!currentCompany) {
            return res.status(404).json({ error: "Company not found" });
        }

        // Start a transaction-like operation (using try-catch for simplicity, assuming db supports transactions)
        try {
            // Insert previous data into company_updation_history
            await projectModel.insertCompanyUpdateHistory(
                currentCompany.company_id,
                currentCompany.company_name,
                currentCompany.address,
                currentCompany.spoc_name,
                currentCompany.spoc_contact_no,
                currentCompany.gst_number,
                currentCompany.vendor_code,
                currentCompany.city_id,
                currentCompany.state_id,
                currentCompany.pincode,
                currentCompany.created_at,
                updated_by
            );

            // Update company details
            await projectModel.updateCompany(
                company_id,
                company_name,
                address,
                gst_number,
                vendor_code,
                city_id ? parseInt(city_id) : null,
                state_id ? parseInt(state_id) : null,
                pincode,
                spoc_name,
                spoc_contact_no,
                updated_by
            );

            res.status(200).json({ message: "Company updated successfully" });
        } catch (error) {
            console.error("Error during company update transaction:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    } catch (error) {
        console.error("Error updating company:", error);
        if (error.code === 'ER_WARN_DATA_OUT_OF_RANGE') {
            return res.status(400).json({ error: "Invalid data type for city_id or state_id; must be valid positive integers" });
        }
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.updateSite = async (req, res) => {
    const db = require("../config/db");
    let connection;
    try {
        const {
            site_name,
            po_number,
            start_date,
            end_date,
            incharge_id,
            workforce_id,
            pd_id,
            location_id,
            reckoner_type_id,
            updated_by
        } = req.body;
        const { siteId } = req.params;

        if (!siteId || !site_name || !po_number || !start_date || !incharge_id || !pd_id || !location_id || !reckoner_type_id || !updated_by) {
            return res.status(400).json({ error: "Site ID, required fields, and updated_by are required" });
        }

        // Validate numeric fields
        const reckonerTypeIdNum = Number(reckoner_type_id);
        if (isNaN(reckonerTypeIdNum)) {
            return res.status(400).json({ error: "reckoner_type_id must be a valid number" });
        }

        // Start transaction
        connection = await db.getConnection();
        await connection.beginTransaction();

        // Fetch current site data
        const currentSite = await projectModel.getSiteById(siteId);
        if (!currentSite) {
            await connection.rollback();
            return res.status(404).json({ error: "Site not found" });
        }

        // Insert previous data into site_updation_history (only the original data, no extra updated_by)
        await projectModel.insertSiteUpdateHistory(
            currentSite.site_id,
            currentSite.site_name,
            currentSite.po_number,
            currentSite.start_date,
            currentSite.end_date,
            currentSite.incharge_id,
            currentSite.workforce_id,
            currentSite.pd_id,
            currentSite.location_id,
            currentSite.reckoner_type_id,
            currentSite.created_by,
            currentSite.created_at,
            updated_by
        );

        // Update site_details
        await projectModel.updateSite(
            siteId,
            site_name,
            po_number,
            start_date,
            end_date,
            incharge_id,
            workforce_id || null,
            pd_id,
            location_id, // Keep as string, no parseInt
            reckonerTypeIdNum,
            updated_by
        );

        await connection.commit();

        res.status(200).json({ message: "Site updated successfully" });
    } catch (error) {
        console.error("Error updating site:", error);
        if (connection) {
            await connection.rollback();
        }
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

// Optional: Similar for project update if needed
exports.updateProject = async (req, res) => {
    const db = require("../config/db");
    let connection;
    try {
        const {
            company_id,
            project_type_id,
            project_name,
            updated_by
        } = req.body;
        const { pdId } = req.params;

        if (!pdId || !company_id || !project_type_id || !project_name || !updated_by) {
            return res.status(400).json({ error: "Project ID, required fields, and updated_by are required" });
        }

        // Start transaction
        connection = await db.getConnection();
        await connection.beginTransaction();

        // Fetch current project data (assuming getProjectById function exists; add if not)
        const currentProject = await db.query("SELECT * FROM project_details WHERE pd_id = ?", [pdId]);
        const projectData = currentProject[0];
        if (!projectData.length) {
            await connection.rollback();
            return res.status(404).json({ error: "Project not found" });
        }
        const current = projectData[0];

        // Insert previous data into project_updation_history
        await projectModel.insertProjectUpdateHistory(
            current.pd_id,
            current.company_id,
            current.project_type_id,
            current.project_name,
            current.created_by,
            current.created_at,
            updated_by
        );

        // Update project_details (add updated_by to table if not present)
        await db.query(
            "UPDATE project_details SET company_id = ?, project_type_id = ?, project_name = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE pd_id = ?",
            [company_id, project_type_id, project_name, updated_by, pdId]
        );

        await connection.commit();

        res.status(200).json({ message: "Project updated successfully" });
    } catch (error) {
        console.error("Error updating project:", error);
        if (connection) {
            await connection.rollback();
        }
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};