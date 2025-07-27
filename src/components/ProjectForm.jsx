import { useState } from "react";
import { supabase } from "../supabaseClient";

const ProjectForm = ({ user, onProjectSaved }) => {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("in Arbeit");
  const [startdatum, setStartdatum] = useState("");
  const [meilensteine, setMeilensteine] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase.from("projects").insert([
      {
        name,
        status,
        startdatum,
        meilensteine,
        owner_id: user.id,
      },
    ]);

    if (error) {
      alert("❌ Fehler beim Speichern: " + error.message);
    } else {
      setName("");
      setStatus("in Arbeit");
      setStartdatum("");
      setMeilensteine("");
      if (onProjectSaved) onProjectSaved();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 shadow rounded mb-6">
      <h2 className="text-lg font-bold mb-3">Projekt anlegen</h2>

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

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Projekt speichern
      </button>
    </form>
  );
};

export default ProjectForm;
