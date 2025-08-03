import { useEffect, useState, useCallback } from "react";
import { supabase } from "../supabaseClient";

// Zeigt alle gespeicherten Dateien eines Meilensteins an
const MilestoneFiles = ({ milestoneId }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("milestone_files")
      .select("id, name, path")
      .eq("milestone_id", milestoneId);

    if (error) {
      console.error("Fehler beim Laden der Dateien:", error.message);
      setFiles([]);
    } else {
      setFiles(data || []);
    }
    setLoading(false);
  }, [milestoneId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleDelete = async (file) => {
    const { error: storageError } = await supabase.storage
      .from("milestone-files")
      .remove([file.path]);

    if (storageError) {
      console.error("Fehler beim Löschen der Datei:", storageError.message);
      return;
    }

    const { error } = await supabase
      .from("milestone_files")
      .delete()
      .eq("id", file.id);

    if (error) {
      console.error("Fehler beim Löschen der Datei:", error.message);
    } else {
      fetchFiles();
    }
  };

  if (loading) return <p>📁 Dateien werden geladen...</p>;

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-2">📂 Meilensteindateien</h2>
      {files.length === 0 && <p>Keine Dateien vorhanden.</p>}
      <ul>
        {files.map((file) => {
          const {
            data: { publicUrl },
          } = supabase.storage
            .from("milestone-files")
            .getPublicUrl(file.path);

          return (
            <li key={file.id} className="mb-1 flex items-center space-x-2">
              <span>{file.name}</span>
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="text-blue-600 text-sm underline"
              >
                Download
              </a>
              <button
                onClick={() => handleDelete(file)}
                className="text-red-500 text-sm"
              >
                Löschen
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default MilestoneFiles;
