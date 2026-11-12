import { API_BASE_URL } from "../../config/api.js";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Select from "react-select";
import { Save } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LabourTeamMapping = () => {
  const [labours, setLabours] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [selectedHead, setSelectedHead] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const labourOptions = useMemo(
    () => labours.map(labour => ({ value: labour.id, label: labour.full_name })),
    [labours]
  );
  const headMemberMap = useMemo(() => {
    const result = new Map();
    mappings.forEach(mapping => {
      if (!result.has(Number(mapping.head_labour_id))) result.set(Number(mapping.head_labour_id), []);
      result.get(Number(mapping.head_labour_id)).push(mapping);
    });
    return result;
  }, [mappings]);
  const authConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` }
  });

  const loadMappings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/admin/labour-team-mappings`, authConfig());
      setLabours(response.data.data.labourEmployees || []);
      setMappings(response.data.data.mappings || []);
    } catch (error) {
      console.error("Failed to load labour team mappings:", error);
      toast.error(error.response?.data?.message || "Failed to load labour team mappings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMappings();
  }, [loadMappings]);

  const handleHeadChange = head => {
    setSelectedHead(head);
    const members = head ? headMemberMap.get(Number(head.value)) || [] : [];
    setSelectedMembers(members.map(member => ({
      value: Number(member.member_labour_id),
      label: member.member_name
    })));
  };

  const handleSave = async event => {
    event.preventDefault();
    if (!selectedHead) {
      toast.error("Select a labour head");
      return;
    }
    try {
      setSaving(true);
      const response = await axios.post(
        `${API_BASE_URL}/admin/labour-team-mappings`,
        {
          head_labour_id: selectedHead.value,
          member_labour_ids: selectedMembers.map(member => member.value)
        },
        authConfig()
      );
      toast.success(response.data.message || "Labour team mapping saved");
      await loadMappings();
    } catch (error) {
      console.error("Failed to save labour team mapping:", error);
      toast.error(error.response?.data?.message || "Failed to save labour team mapping");
    } finally {
      setSaving(false);
    }
  };

  const memberOptions = labourOptions.filter(labour => labour.value !== selectedHead?.value);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="mx-auto max-w-4xl space-y-5">
        <header>
          <h1 className="text-xl font-bold text-gray-900">Labour Head & Team Mapping</h1>
          <p className="mt-1 text-sm text-gray-600">
            Select one labour head and map the labourers who report to that head.
          </p>
        </header>

        <form onSubmit={handleSave} className="space-y-4 rounded-lg bg-white p-5 shadow-sm">
          <label className="block text-sm font-medium text-gray-700">
            Labour Head
            <Select
              className="mt-1"
              classNamePrefix="react-select"
              options={labourOptions}
              value={selectedHead}
              onChange={handleHeadChange}
              isLoading={loading}
              placeholder="Select one labour head"
            />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Team Labourers
            <Select
              className="mt-1"
              classNamePrefix="react-select"
              options={memberOptions}
              value={selectedMembers}
              onChange={options => setSelectedMembers(options || [])}
              isMulti
              isLoading={loading}
              isDisabled={!selectedHead}
              closeMenuOnSelect={false}
              placeholder="Select one or more labourers"
            />
          </label>
          <button
            type="submit"
            disabled={loading || saving || !selectedHead}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save team mapping"}
          </button>
        </form>

        <section className="rounded-lg bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-semibold text-gray-800">Current Labour Teams</h2>
          {loading ? (
            <p className="text-sm text-gray-500">Loading labour teams...</p>
          ) : mappings.length === 0 ? (
            <p className="text-sm text-gray-500">No labour team mappings have been added.</p>
          ) : (
            <div className="space-y-3">
              {[...headMemberMap.entries()].map(([headId, members]) => (
                <article key={headId} className="rounded-md border border-gray-200 p-3">
                  <div className="font-medium text-gray-800">{members[0].head_name}</div>
                  <div className="mt-1 text-sm text-gray-600">
                    Team: {members.map(member => member.member_name).join(", ")}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default LabourTeamMapping;
