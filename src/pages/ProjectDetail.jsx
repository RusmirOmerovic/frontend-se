import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

const ProjectDetail = () => {
  const { id } = useParams(); // Projekt-ID aus der URL
  const [project, setProject] = useState(null);
  const [milestones, setMilestones] = useState([]);

  useEffect(() => {
    const fetchProject = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (!error) setProject(data);
    };

    const fetchMilestones = async () => {
      const { data, error } = await supabase
        .from("milestones")
        .select("*")
        .eq("project_id", id) // ✅ wichtig: KEIN "s" am Ende
        .order("due_date", { ascending: true });

      console.log("Geladene Milestones:", data);  
      if (!error) setMilestones(data);
    };

    fetchProject();
    fetchMilestones();
  }, [id]);

  if (!project) return <p className="p-4">🔄 Lade Projektdetails...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">{project.name}</h1>

      <h2 className="text-lg font-semibold mt-6 mb-2">📍 Meilensteine</h2>
      {milestones.length > 0 ? (
        <table className="w-full text-left border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Titel</th>
              <th className="p-2 border">Beschreibung</th>
              <th className="p-2 border">Fällig bis</th>
              <th className="p-2 border">Status</th>
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
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-600">Keine Meilensteine vorhanden.</p>
      )}

      <Link to="/dashboard" className="text-blue-600 underline mt-6 inline-block">
        🔙 Zurück zum Dashboard
      </Link>
    </div>
  );
};

export default ProjectDetail;
