import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { submitProject } from "../utils/projectSubmit";

// Formular zur Erstellung oder Bearbeitung eines Projekts
const ProjectForm = ({ user, onProjectSaved, project, onCancel }) => {
  const [name, setName] = useState(project?.name || "");
  const [status, setStatus] = useState(project?.status || "in Arbeit");
  const [startdatum, setStartdatum] = useState(project?.startdatum || "");
  const [meilensteine, setMeilensteine] = useState(project?.meilensteine || "");
  const [file, setFile] = useState(null);

  // Lädt vorhandene Meilensteine, wenn ein Projekt bearbeitet wird
  useEffect(() => {
    const fetchExistingMilestones = async () => {
      if (!project?.id) return;

      const { data, error } = await supabase
        .from("milestones")
        .select("title")
        .eq("project_id", project.id);

      if (error) {
        console.error("Fehler beim Laden vorhandener Meilensteine:", error.message);
      } else {
        const titles = data.map((m) => m.title).join(", ");
        setMeilensteine(titles);
      }
    };

    fetchExistingMilestones();
  }, [project?.id]);

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
    if (meilensteine && projectId) {
      const msList = meilensteine
        .split(/[\n,]+/)
        .map((title) => title.trim())
        .filter((title) => title.length > 0);

      const milestonesToInsert = msList.map((title) => ({
        project_id: projectId,
        title: title,
        description: `Beschreibung zu ${title}`,
        due_date: new Date().toISOString(),
        status: "offen",
        completed: false,
      }));

      // Alte Meilensteine entfernen
      const { error: deleteError } = await supabase
        .from("milestones")
        .delete()
        .eq("project_id", projectId);

      if (deleteError) {
        console.error("Fehler beim Löschen alter Meilensteine:", deleteError.message);
      }

      // Neue Meilensteine einfügen
      if (milestonesToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from("milestones")
          .insert(milestonesToInsert);

        if (insertError) {
          console.error(
            "Fehler beim Einfügen neuer Meilensteine:",
            insertError.message
          );
          alert("Fehler beim Speichern der Meilensteine: " + insertError.message);
        }
      }
    }

    setName("");
    setStatus("in Arbeit");
    setStartdatum("");
    setFile(null);
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

      <textarea
        value={meilensteine}
        onChange={(e) => setMeilensteine(e.target.value)}
        placeholder="Meilensteine (z. B. Analyse, Prototyp, Test...)"
        className="w-full p-2 border rounded mb-3"
      />
      <small className="text-gray-500">
        Trenne Meilensteine mit Komma oder Zeilenumbruch (z.B. MS01, MS02, MS03...)
      </small>


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
