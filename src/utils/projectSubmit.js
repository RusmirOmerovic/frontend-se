import { supabase } from "../supabaseClient";

// Speichert oder aktualisiert ein Projekt und ruft onProjectSaved nach Erfolg auf
export const submitProject = async ({
  user,
  project,
  name,
  status,
  startdatum,
  onProjectSaved,
}) => {
  let projectId = project?.id;
  let error;

  if (projectId) {
    const { data, error: updateErr } = await supabase
      .from("projects")
      .update({ name, status, startdatum })
      .eq("id", projectId)
      .select()
      .single();
    error = updateErr;
    projectId = data?.id || projectId;
  } else {
    const { data, error: insertErr } = await supabase
      .from("projects")
      .insert([{ name, status, startdatum, owner_id: user.id }])
      .select()
      .single();
    error = insertErr;
    projectId = data?.id;
  }

  if (error) {
    throw error;
  }

  if (onProjectSaved) onProjectSaved();
  return projectId;
};
