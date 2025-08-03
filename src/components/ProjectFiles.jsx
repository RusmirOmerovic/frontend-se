import { useEffect, useState, useCallback } from "react";
import { supabase } from "../supabaseClient";

// Zeigt alle gespeicherten Dateien eines Projekts an
const ProjectFiles = ({ projectId }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.storage
      .from("project-files")
      .list(`project/${projectId}`);

    if (error) {
      console.error("Fehler beim Laden der Dateien:", error.message);
      setFiles([]);
    } else {
      // filtert nur echte Dateien, keine Unterordner
      setFiles((data || []).filter((f) => f.id));
    }
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleDelete = async (path) => {
    const { error } = await supabase.storage
      .from("project-files")
      .remove([path]);
    if (error) {
      console.error("Fehler beim Löschen der Datei:", error.message);
    } else {
      fetchFiles();
    }
  };

  if (loading) return <p>📁 Dateien werden geladen...</p>;

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-2">📂 Projektdateien</h2>
      {files.length === 0 && <p>Keine Dateien vorhanden.</p>}
      <ul>
        {files.map((file) => {
          const path = `project/${projectId}/${file.name}`;
          const {
            data: { publicUrl },
          } = supabase.storage
            .from("project-files")
            .getPublicUrl(path);

          return (
            <li key={file.name} className="mb-1 flex items-center space-x-2">
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
                onClick={() => handleDelete(path)}
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

export default ProjectFiles;
