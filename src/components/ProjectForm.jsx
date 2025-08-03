import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { submitProject } from "../utils/projectSubmit";

// Formular zur Erstellung oder Bearbeitung eines Projekts
const ProjectForm = ({ user, onProjectSaved, project, onCancel }) => {
  const [name, setName] = useState(project?.name || "");
  const [status, setStatus] = useState(project?.status || "in Arbeit");
  const [startdatum, setStartdatum] = useState(project?.startdatum || "");
  const [milestones, setMilestones] = useState([]);
  const [deletedMilestoneIds, setDeletedMilestoneIds] = useState([]);
  const [file, setFile] = useState(null);

  // Lädt vorhandene Meilensteine, wenn ein Projekt bearbeitet wird
  useEffect(() => {
    const fetchExistingMilestones = async () => {
      if (!project?.id) return;

      const { data, error } = await supabase
        .from("milestones")
        .select("id, title")
        .eq("project_id", project.id);

      if (error) {
        console.error("Fehler beim Laden vorhandener Meilensteine:", error.message);
      } else {
        setMilestones(data);
      }
    };

    fetchExistingMilestones();
  }, [project?.id]);

  const handleAddMilestone = () => {
    const title = prompt("Titel des Meilensteins");
    if (title) {
      setMilestones([...milestones, { title }]);
    }
  };

  const handleEditMilestone = (index) => {
    const title = prompt("Neuer Titel", milestones[index].title);
    if (title) {
      setMilestones(
        milestones.map((m, i) => (i === index ? { ...m, title } : m))
      );
    }
  };

  const handleDeleteMilestone = (index) => {
    const m = milestones[index];
    if (m.id) {
      setDeletedMilestoneIds([...deletedMilestoneIds, m.id]);
    }
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  // Speichert das Projekt und verarbeitet optional Dateien sowie Meilensteine
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Projekt wird gespeichert mit owner_id:", user?.id);

    let projectId;
    try {
      projectId = await submitProject({
        user,
        project,
        name,
        status,
        startdatum,
        onProjectSaved,
      });
    } catch (error) {
      alert("❌ Fehler beim Speichern: " + error.message);
      return;
    }

    // Datei-Upload zum Projektbucket
    if (file && projectId) {
      const { error: uploadError } = await supabase.storage
        .from("project-files")
        .upload(`project/${projectId}/${file.name}`, file, { upsert: true });
      if (uploadError) {
        alert("Fehler beim Datei-Upload: " + uploadError.message);
      }
    }

    // Meilensteine verarbeiten und speichern
    if (projectId) {
      for (const m of milestones) {
        if (m.id) {
          const { error } = await supabase
            .from("milestones")
            .update({ title: m.title })
            .eq("id", m.id);
          if (error) {
            console.error("Fehler beim Aktualisieren eines Meilensteins:", error.message);
          }
        } else {
          const { error } = await supabase
            .from("milestones")
            .insert({
              project_id: projectId,
              title: m.title,
              description: `Beschreibung zu ${m.title}`,
              due_date: new Date().toISOString(),
              status: "offen",
              completed: false,
            });
          if (error) {
            console.error("Fehler beim Einfügen eines Meilensteins:", error.message);
          }
        }
      }

      if (deletedMilestoneIds.length > 0) {
        const { error } = await supabase
          .from("milestones")
          .delete()
          .in("id", deletedMilestoneIds);
        if (error) {
          console.error("Fehler beim Löschen von Meilensteinen:", error.message);
        }
      }
    }

    setName("");
    setStatus("in Arbeit");
    setStartdatum("");
    setFile(null);
    setMilestones([]);
    setDeletedMilestoneIds([]);
    if (onCancel) onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 shadow rounded mb-6">
      <h2 className="text-lg font-bold mb-3">
        {project ? "Projekt bearbeiten" : "Projekt anlegen"}
      </h2>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Projektname"
        className="w-full p-2 border rounded mb-2"
        required
      />

      <input
        type="date"
        value={startdatum}
        onChange={(e) => setStartdatum(e.target.value)}
        className="w-full p-2 border rounded mb-2"
        required
      />

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      >
        <option value="in Arbeit">in Arbeit</option>
        <option value="abgeschlossen">abgeschlossen</option>
      </select>

      <div className="mb-3">
        <ul className="mb-2">
          {milestones.map((m, index) => (
            <li
              key={m.id ?? index}
              className="flex items-center justify-between mb-1"
            >
              <span>{m.title}</span>
              <div className="space-x-2">
                <button
                  type="button"
                  className="text-blue-600 underline"
                  onClick={() => handleEditMilestone(index)}
                >
                  Bearbeiten
                </button>
                <button
                  type="button"
                  className="text-red-600 underline"
                  onClick={() => handleDeleteMilestone(index)}
                >
                  Löschen
                </button>
              </div>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={handleAddMilestone}
          className="bg-gray-200 px-2 py-1 rounded"
        >
          Meilenstein hinzufügen
        </button>
      </div>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-3"
      />

      <div className="space-x-2">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Speichern
        </button>
        {project && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border rounded"
          >
            Abbrechen
          </button>
        )}
      </div>
    </form>
  );
};

export default ProjectForm;
