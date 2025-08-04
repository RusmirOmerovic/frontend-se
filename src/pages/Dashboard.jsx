import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import ProjectForm from "../components/ProjectForm";
import CommentsSection from "../components/CommentsSection";
import ProfileEditor from "../components/ProfileEditor";
import MilestoneList from "../components/MilestoneList";


// Dashboard zeigt Projekte und verwaltet Rollen- und Profilinformationen
const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);

  // Ermittelt die Rolle des Nutzers und legt sie bei Bedarf an
  const assignRoleIfMissing = async (user) => {
    const { data: existing, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();
  // Wenn Rolle bereits existiert, setze sie
    if (existing) {
      setRole(existing.role);
      return;
    }

    if (error) {
      console.error("Fehler beim Abrufen der Rolle:", error.message);
      return;
    }
  //Wenn keine Rolle vorhanden ist, dann anlegen
    const newRole = user.email?.includes("@web.de") ? "tutor" : "student";

    const { error: insertError } = await supabase
      .from("user_roles")
      .insert([{ user_id: user.id, role: newRole }]);

    if (insertError) {
      if (insertError.code === "23505") {
        // Duplikat-Fehler, Rolle existiert bereits
        console.warn("Rolle existiert bereits, überspringe Insert:", insertError.message);
      } else {
        console.error("Fehler beim Rollen-Insert:", insertError.message);
      }
    } else {
        setRole(newRole);
    }
  };
  // Sicherheitsmechanismus einmal assignRoleIfMissing aufzurufen
  const [roleChecked, setRoleChecked] = useState(false);
  // Holt Session und initialisiert Rolle sowie Nutzer
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
      if (!roleChecked) {
        await assignRoleIfMissing(currentUser);
        setRoleChecked(true);
      }
    };

    fetchSession();
  }, [roleChecked]);

  // Lädt Projekte aus der Datenbank; Studenten sehen nur eigene Projekte
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

  // Entfernt alle eigenen Daten des Nutzers und meldet ihn ab
const handleDeleteAccount = async () => {
  if (!user?.id) return;
  const userId = user.id;

  try {
    // 🔁 1. Lösche Daten aus Datenbank (RLS basiert auf auth.uid())
    const { data: userProjects } = await supabase
      .from("projects")
      .select("id")
      .eq("owner_id", userId);

    const projectIds = userProjects?.map((p) => p.id) || [];

    await Promise.all([
      supabase.from("comments").delete().eq("user_id", userId),
      projectIds.length > 0 &&
        supabase.from("comments").delete().in("project_id", projectIds),
      projectIds.length > 0 &&
        supabase.from("milestones").delete().in("project_id", projectIds),
      supabase.from("projects").delete().eq("owner_id", userId),
      supabase.storage.from("project-files").remove([`user/${userId}/`]),
      supabase.from("user_roles").delete().eq("user_id", userId),
      supabase.from("user_profiles").delete().eq("id", userId),
    ]);

    // ✅ 2. Auth-User löschen (admin-Zugriff auf Server)
    const response = await fetch("/api/deleteUser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      console.error("Fehler beim Löschen des Auth-Users");
      alert("⚠️ Fehler beim Löschen des Accounts");
      return;
    }

    // 🚪 3. Abmelden
    await supabase.auth.signOut();

    // ✅ 4. Weiterleitung
    alert("✅ Ihr Account wurde vollständig gelöscht.");
    window.location.href = "/";
  } catch (err) {
    console.error("Fehler beim Löschen des Accounts:", err.message);
    alert("❌ Es gab ein Problem beim Löschen. Bitte erneut versuchen.");
  }
};



  // Profilzustand und Formularsteuerung
  const [profile, setProfile] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  // Lädt Profildaten des angemeldeten Nutzers
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

  // Öffnet das Formular zum Anlegen eines neuen Projekts
  const handleNew = () => {
    setEditingProject(null);
    setShowForm(true);
  };

  // Öffnet das Formular zum Bearbeiten eines bestehenden Projekts
  const handleEdit = (proj) => {
    setEditingProject(proj);
    setShowForm(true);
  };

  // Löscht ein Projekt samt zugehörigen Dateien
  const handleDeleteProject = async (id) => {
    await supabase.from("projects").delete().eq("id", id);

    const { data: files, error: listError } = await supabase
      .storage
      .from("project-files")
      .list(`project/${id}`);

    if (listError) {
      console.error(
        "Fehler beim Auflisten der Dateien:",
        listError.message,
      );
    } else if (files && files.length > 0) {
      const paths = files.map((file) => `project/${id}/${file.name}`);
      const { error: removeError } = await supabase
        .storage
        .from("project-files")
        .remove(paths);

      if (removeError) {
        console.error(
          "Fehler beim Löschen der Dateien:",
          removeError.message,
        );
      }
    } else {
      console.warn(`Keine Dateien zum Löschen für Projekt ${id}.`);
    }

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
                {proj.name ? (
                  <>
                    {proj.name} (
                <a
                  href={`/project/${proj.id}`}
                  className="text-blue-500 underline"
                >
                  Details ansehen
                </a>)
                </>
                ) : (
                  <a href={`/projekt/${proj.id}`} className="text-blue-600 underline">
                    Details ansehen
                  </a>
                )}
              </p>

              <p>
                <strong>📌 Status:</strong> {proj.status}
              </p>
              <p>
                <strong>🕓 Erstellt:</strong>{" "}
                {proj.created_at
                  ? new Date(proj.created_at).toLocaleString("de-DE", {
                  dateStyle: "short",
                  timeStyle: "short",
                  })
                  : "Kein Datum verfügbar"}
              </p>
              {/* <MilestoneList projectId={proj.id} /> Meilensteine werden nur in der Detailansicht angezeigt */}
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
          <p>{role === "tutor"
            ? "Keine Projekte verfügbar. Studierende haben noch keine Projekte angelegt."
            : "Keine Projekte verfügbar. Du kannst jetzt dein erstes Projekt anlegen!"}
            </p>
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
    </div>
  );
};

export default Dashboard;
