import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

// Komponente zur Anzeige und Erstellung von Projektkommentaren
const CommentsSection = ({ projectId, user }) => {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [ownerId, setOwnerId] = useState(null);

  // Lädt alle Kommentare für das angegebene Projekt
  const fetchComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select("*, user_profiles(vorname, nachname)")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });
    if (data) setComments(data);
  };

  // Holt Besitzer des Projekts
  const fetchOwner = async () => {
    const { data } = await supabase
      .from("projects")
      .select("owner_id")
      .eq("id", projectId)
      .single();
    if (data) setOwnerId(data.owner_id);
  };

  // Aktualisiert die Kommentarübersicht bei Änderung der Projekt-ID
  useEffect(() => {
    fetchComments();
    fetchOwner();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Fügt einen neuen Kommentar hinzu und lädt anschließend die Liste neu
  const handleAdd = async () => {
    if (!text.trim()) return;
    await supabase
      .from("comments")
      .insert([{ project_id: projectId, user_id: user.id, content: text }]);
    setText("");
    fetchComments();
  };

  // Löscht einen Kommentar und aktualisiert die Liste
  const handleDelete = async (id) => {
    await supabase.from("comments").delete().eq("id", id);
    fetchComments();
  };

  return (
    <div className="mt-2">
      <h4 className="font-semibold">Kommentare</h4>
      {comments.map((c) => (
        <p
          key={c.id}
          className="text-sm border-b flex justify-between items-center"
        >
          <span>
            {`${c.user_profiles?.vorname ?? ""} ${c.user_profiles?.nachname ?? ""}`}:
            {" "}
            {c.content}
          </span>
          {(c.user_id === user.id || ownerId === user.id) && (
            <button
              onClick={() => handleDelete(c.id)}
              className="text-xs text-red-600 ml-2"
            >
              Löschen
            </button>
          )}
        </p>
      ))}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full border rounded mt-1"
      />
      <button
        onClick={handleAdd}
        className="mt-1 px-2 py-1 bg-green-600 text-white rounded"
      >
        Kommentar speichern
      </button>
    </div>
  );
};

export default CommentsSection;
