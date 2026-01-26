create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_decisions_updated_at on public.decisions;

create trigger set_decisions_updated_at
before update on public.decisions
for each row
execute function public.set_updated_at();
