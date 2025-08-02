import { useState } from "react";
import { supabase } from "../supabaseClient";

const ProjectForm = ({ user, onProjectSaved, project, onCancel }) => {
  const [name, setName] = useState(project?.name || "");
  const [status, setStatus] = useState(project?.status || "in Arbeit");
  const [startdatum, setStartdatum] = useState(project?.startdatum || "");
  const [meilensteine, setMeilensteine] = useState(project?.meilensteine || "");
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    console.log("Projekt wird gespeichert mit owner_id:", user?.id);

    let projectId = project?.id;
    let error;

    if (projectId) {
      ({ error } = await supabase
        .from("projects")
        .update({ name, status, startdatum })
        .eq("id", projectId));
    } else {
      const { data, error: insertErr } = await supabase
        .from("projects")
        .insert([
          { name, status, startdatum, owner_id: user.id },
        ])
        .select()
        .single();
      error = insertErr;
      projectId = data?.id;
    }

    if (error) {
      alert("❌ Fehler beim Speichern: " + error.message);
      return;
    }

    if (file && projectId) {
      const { error: uploadError } = await supabase.storage
        .from("project-files")
        .upload(`project/${projectId}/${file.name}`, file, { upsert: true });
      if (uploadError) {
        alert("Fehler beim Datei-Upload: " + uploadError.message);
      }
    }

        // ➊ Meilensteine verarbeiten und speichern
    if (meilensteine && projectId) {
      const msList = meilensteine
        .split(/[\n,]+/) // nach Zeilenumbruch ODER Komma trennen
        .map((title) => title.trim())
        .filter((title) => title.length > 0);

      const milestonesToInsert = msList.map((title) => ({
        project_id: projectId,
        title: title,
        completed: false,
      }));

      if (milestonesToInsert.length > 0) {
        const { error: msError } = await supabase
          .from("milestones")
          .insert(milestonesToInsert);

        if (msError) {
          alert("Fehler beim Speichern der Meilensteine: " + msError.message);
        }
      }
    }


    setName("");
    setStatus("in Arbeit");
    setStartdatum("");
    setFile(null);
    if (onProjectSaved) onProjectSaved();
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
