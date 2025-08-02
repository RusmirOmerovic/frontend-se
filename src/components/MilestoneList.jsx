// src/components/MilestoneList.jsx
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const MilestoneList = ({ projectId }) => {
  const [milestones, setMilestones] = useState([]);

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

  return (
    <ul className="mt-2 pl-4 list-disc text-sm text-gray-700">
      {milestones.map((m) => (
        <li key={m.id}>
          {m.completed ? "✅ " : "🔘 "}
          {m.title}
        </li>
      ))}
    </ul>
  );
};

export default MilestoneList;
