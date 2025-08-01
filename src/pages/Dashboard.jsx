import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import ProjectForm from "../components/ProjectForm";
import CommentsSection from "../components/CommentsSection";

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);

  // Rolle ermitteln oder bei Bedarf anlegen
  const assignRoleIfMissing = async (user) => {
    const { data: existing } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (existing) {
      setRole(existing.role);
      return;
    }

    const newRole = user.email?.includes("@web.de") ? "tutor" : "student";
    const { error: insertError } = await supabase
      .from("user_roles")
      .insert([{ user_id: user.id, role: newRole }]);

    if (insertError) {
      console.error("Fehler beim Rollen-Insert:", insertError.message);
    } else {
      setRole(newRole);
    }
  };

  // Session und Rolle holen
  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        console.error("Keine gültige Session gefunden.");
        return;
      }

      const currentUser = session.user;
      setUser(currentUser);
      await assignRoleIfMissing(currentUser);
    };

    fetchSession();
  }, []);

  // Projekte laden (für Studenten nur eigene)
  const fetchProjects = async () => {
    if (!role || !user?.id) return;

    let query = supabase.from("projects").select("*");
    if (role === "student") {
      query = query.eq("owner_id", user.id);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Fehler beim Abrufen der Projekte:", error.message);
    } else {
      setProjects(data);
    }
  };

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, user]);

  // Account und Daten löschen – ohne Admin-Zugang ist deleteUser nicht möglich
  const handleDeleteAccount = async () => {
    if (!user?.id) return;

    // 1. Projekte löschen
    await supabase.from("projects").delete().eq("owner_id", user.id);

    // 2. Dateien löschen (nur falls du Bucket hast)
    await supabase.storage.from("project-files").remove([`user/${user.id}/`]);

    // 3. user_roles löschen
    await supabase.from("user_roles").delete().eq("user_id", user.id);

    // 4. Benutzer-Session invalidieren (Löschen geht nur mit Service Key!)
    alert("Account-Inhalte gelöscht. Bitte manuell aus Supabase löschen.");
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  // Profil anzeigen
  const [profile, setProfile] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Fehler beim Laden des Profils:", error.message);
      } else {
        setProfile(data);
      }
    };

    fetchProfile();
  }, [user]);

  const handleNew = () => {
    setEditingProject(null);
    setShowForm(true);
  };

  const handleEdit = (proj) => {
    setEditingProject(proj);
    setShowForm(true);
  };

  const handleDeleteProject = async (id) => {
    await supabase.from("projects").delete().eq("id", id);
    await supabase.storage.from("project-files").remove([`project/${id}`]);
    fetchProjects();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {role && (
        <p className="mb-2">
          Angemeldet als: <strong>{role}</strong>
        </p>
      )}

      {profile && (
        <div className="bg-white p-4 rounded shadow mb-4">
          <h2 className="text-lg font-semibold mb-2">👤 Profildaten</h2>
          <p>
            <strong>Vorname:</strong> {profile.vorname}
          </p>
          <p>
            <strong>Nachname:</strong> {profile.nachname}
          </p>
          <p>
            <strong>Geburtsdatum:</strong>{" "}
            {new Date(profile.geburtsdatum).toLocaleDateString()}
          </p>
          <p>
            <strong>Matrikelnummer:</strong> {profile.matrikelnummer}
          </p>
        </div>
      )}

      {profile && (
        <div className="mb-4 text-sm text-gray-600">
          👤 {profile.vorname} {profile.nachname}
          <br />
          🎂 Geburtsdatum: {profile.geburtsdatum}
          <br />
          🎓 Matrikelnummer: {profile.matrikelnummer}
        </div>
      )}

      {user && (
        <>
          {showForm ? (
            <ProjectForm
              user={user}
              project={editingProject}
              onProjectSaved={() => {
                fetchProjects();
                setShowForm(false);
                setEditingProject(null);
              }}
              onCancel={() => {
                setShowForm(false);
                setEditingProject(null);
              }}
            />
          ) : (
            role === "student" && (
              <button
                onClick={handleNew}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Neues Projekt
              </button>
            )
          )}
          <button
            onClick={handleDeleteAccount}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
          >
            🚨 Account löschen
          </button>
        </>
      )}

      {projects.length > 0 ? (
        <ul className="space-y-4 mt-6">
          {projects.map((proj) => (
            <li key={proj.id} className="bg-white rounded shadow p-4">
              <p>
                <strong>📁 Projekt:</strong>{" "}
                <a
                  href={`/project/${proj.id}`}
                  className="text-blue-500 underline"
                >
                  Details ansehen
                </a>
              </p>

              <p>
                <strong>📌 Status:</strong> {proj.status}
              </p>
              <p>
                <strong>🕓 Erstellt:</strong>{" "}
                {new Date(proj.created_at).toLocaleString("de-DE", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </p>
              {role === "student" && proj.owner_id === user.id && (
                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => handleEdit(proj)}
                    className="px-2 py-1 bg-yellow-500 text-white rounded"
                  >
                    Bearbeiten
                  </button>
                  <button
                    onClick={() => handleDeleteProject(proj.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded"
                  >
                    Löschen
                  </button>
                </div>
              )}
              
                <CommentsSection projectId={proj.id} user={user} />
              
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4">
          <p>Keine aktuellen Projekte</p>
          {user && !showForm && role === "student" && (
            <button
              onClick={handleNew}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Neues Projekt
            </button>
          )}
        </div>
      )}
      {user && <ProfileEditor user={user} />}
    </div>
  );
};

export default Dashboard;
