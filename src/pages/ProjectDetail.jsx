/* eslint-disable react-refresh/only-export-components */
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import MilestoneList from "../components/MilestoneList";
import CommentsSection from "../components/CommentsSection";

// Erstellt oder aktualisiert einen Meilenstein
// eslint-disable-next-line react-refresh/only-export-components
export const addOrUpdateMilestone = async (projectId, milestone) => {
  const payload = {
    title: milestone.title,
    description: milestone.description,
    due_date: milestone.due_date,
    status: milestone.status,
    project_id: projectId,
  };

  if (milestone.id) {
    const { data, error } = await supabase
      .from("milestones")
      .update(payload)
      .eq("id", milestone.id)
      .select()
      .single();

    if (error) {
      console.error("Fehler beim Speichern des Meilensteins:", error);
      return null;
    }
    return data;
  }

  const { data, error } = await supabase
    .from("milestones")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("Fehler beim Speichern des Meilensteins:", error);
    return null;
  }
  return data;
};

// Detailansicht eines Projekts mit Liste der Meilensteine
const ProjectDetail = () => {
  const { id } = useParams(); // Projekt-ID aus der URL
  const [project, setProject] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Holt eingeloggten Nutzer
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
    });
  }, []);

  // Lädt Projektinformationen
  useEffect(() => {
    const fetchProject = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (!error) setProject(data);
    };

    fetchProject();
  }, [id]);

  if (!project) return <p className="p-4">🔄 Lade Projektdetails...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">{project.name}</h1>

      <h2 className="text-lg font-semibold mt-6 mb-2">📍 Meilensteine</h2>
      <MilestoneList projectId={id} />

      {currentUser && (
        <CommentsSection projectId={id} user={currentUser} />
      )}

      <Link to="/dashboard" className="text-blue-600 underline mt-6 inline-block">
        🔙 Zurück zum Dashboard
      </Link>
    </div>
  );
};

export default ProjectDetail;
