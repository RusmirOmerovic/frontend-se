create table if not exists milestone_files (
  id bigint generated always as identity primary key,
  milestone_id bigint references milestones(id) on delete cascade,
  path text not null,
  name text not null,
  uploaded_at timestamptz default now()
);
