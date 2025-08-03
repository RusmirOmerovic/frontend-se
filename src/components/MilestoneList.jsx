// src/components/MilestoneList.jsx
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

// Löscht einen Meilenstein
// eslint-disable-next-line react-refresh/only-export-components
export const removeMilestone = async (id) => {
  const { error } = await supabase.from("milestones").delete().eq("id", id);
  if (error) {
    console.error("Fehler beim Löschen des Meilensteins:", error.message);
    return false;
  }
  return true;
};

// Zeigt alle Meilensteine eines Projekts an
const MilestoneList = ({ projectId }) => {
  const [milestones, setMilestones] = useState([]);

  // Lädt Meilensteine beim Rendern oder Wechsel der Projekt-ID
  useEffect(() => {
    const fetchMilestones = async () => {
      const { data, error } = await supabase
        .from("milestones")
        .select("*")
        .eq("project_id", projectId);

      if (error) {
        console.error("Fehler beim Laden der Meilensteine:", error.message);
      } else {
        setMilestones(data);
      }
    };

    fetchMilestones();
  }, [projectId]);

  const handleEdit = async (m) => {
    const title = prompt("Titel", m.title);
    const description = prompt("Beschreibung", m.description || "");
    const due_date = prompt(
      "Fälligkeitsdatum (YYYY-MM-DD)",
      m.due_date ? m.due_date.split("T")[0] : ""
    );
    const status = prompt("Status", m.status || "");

    const updates = { title, description, due_date, status };
    const { error } = await supabase
      .from("milestones")
      .update(updates)
      .eq("id", m.id);

    if (error) {
      console.error("Fehler beim Aktualisieren des Meilensteins:", error.message);
    } else {
      setMilestones((prev) =>
        prev.map((ms) => (ms.id === m.id ? { ...ms, ...updates } : ms))
      );
    }
  };

  const handleDelete = async (id) => {
    const success = await removeMilestone(id);
    if (success) {
      setMilestones((prev) => prev.filter((m) => m.id !== id));
    }
  };

  return (
    <table className="w-full text-left border mt-2">
      <thead>
        <tr className="bg-gray-200">
          <th className="p-2 border">Titel</th>
          <th className="p-2 border">Beschreibung</th>
          <th className="p-2 border">Fällig bis</th>
          <th className="p-2 border">Status</th>
          <th className="p-2 border">Aktionen</th>
        </tr>
      </thead>
      <tbody>
        {milestones.map((m) => (
          <tr key={m.id}>
            <td className="p-2 border">{m.title}</td>
            <td className="p-2 border">{m.description}</td>
            <td className="p-2 border">
              {m.due_date ? new Date(m.due_date).toLocaleDateString() : "-"}
            </td>
            <td className="p-2 border">{m.status}</td>
            <td className="p-2 border space-x-2">
              <button
                className="text-blue-600 underline"
                onClick={() => handleEdit(m)}
              >
                Bearbeiten
              </button>
              <button
                className="text-red-600 underline"
                onClick={() => handleDelete(m.id)}
              >
                Löschen
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default MilestoneList;
