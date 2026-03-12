create table if not exists tasks (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users not null,
  text        text not null,
  emoji       text default '🎯',
  col         text default 'todo' check (col in ('todo','doing','done')),
  energy      text check (energy in ('morning','afternoon','lowEnergy')),
  subtasks    jsonb default '[]',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table tasks enable row level security;

create policy "Users see own tasks"
  on tasks for all
  using (auth.uid() = user_id);

