-- Ejecutar una sola vez en Supabase > SQL Editor.
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null check (role in ('admin', 'editor')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'editor')
  );
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.is_staff() from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_staff() to authenticated;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
on public.profiles for select to authenticated
using (id = auth.uid());

drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles"
on public.profiles for select to authenticated
using (public.is_admin());

drop policy if exists "Admins can update profiles" on public.profiles;
create policy "Admins can update profiles"
on public.profiles for update to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Registra las cuentas que ya existen. La cuenta más antigua se convierte en
-- el administrador inicial; las demás quedan como editores.
insert into public.profiles (id, email, role)
select id, coalesce(email, ''), 'editor'
from auth.users
on conflict (id) do nothing;

do $$
begin
  if not exists (select 1 from public.profiles where role = 'admin') then
    update public.profiles
    set role = 'admin', updated_at = now()
    where id = (
      select id from auth.users order by created_at asc limit 1
    );
  end if;
end
$$;

create table if not exists public.properties (
  id text primary key,
  title text not null,
  description text not null default '',
  price numeric not null default 0,
  currency text not null default 'USD' check (currency in ('USD', 'GTQ')),
  operation text not null default 'Venta' check (operation in ('Venta', 'Renta')),
  type text not null default 'Casa',
  city text not null default '',
  zone text not null default '',
  address text not null default '',
  bedrooms integer not null default 0,
  bathrooms integer not null default 0,
  parking integer not null default 0,
  area_m2 numeric not null default 0,
  status text not null default 'Disponible' check (status in ('Disponible', 'Reservada', 'Vendida', 'Alquilada')),
  featured boolean not null default false,
  published boolean not null default false,
  images text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.properties enable row level security;

drop policy if exists "Public can read published properties" on public.properties;
create policy "Public can read published properties"
on public.properties for select
using (published = true);

drop policy if exists "Staff can read all properties" on public.properties;
create policy "Staff can read all properties"
on public.properties for select to authenticated
using (public.is_staff());

drop policy if exists "Authenticated users can create properties" on public.properties;
create policy "Authenticated users can create properties"
on public.properties for insert to authenticated
with check (public.is_staff());

drop policy if exists "Authenticated users can update properties" on public.properties;
create policy "Authenticated users can update properties"
on public.properties for update to authenticated
using (public.is_staff()) with check (public.is_staff());

drop policy if exists "Authenticated users can delete properties" on public.properties;
create policy "Authenticated users can delete properties"
on public.properties for delete to authenticated
using (public.is_staff());

insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can view property images" on storage.objects;
create policy "Public can view property images"
on storage.objects for select
using (bucket_id = 'property-images');

drop policy if exists "Authenticated users can upload property images" on storage.objects;
create policy "Authenticated users can upload property images"
on storage.objects for insert to authenticated
with check (bucket_id = 'property-images' and public.is_staff());

drop policy if exists "Authenticated users can update property images" on storage.objects;
create policy "Authenticated users can update property images"
on storage.objects for update to authenticated
using (bucket_id = 'property-images' and public.is_staff())
with check (bucket_id = 'property-images' and public.is_staff());

drop policy if exists "Authenticated users can delete property images" on storage.objects;
create policy "Authenticated users can delete property images"
on storage.objects for delete to authenticated
using (bucket_id = 'property-images' and public.is_staff());

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists properties_updated_at on public.properties;
create trigger properties_updated_at before update on public.properties
for each row execute function public.set_updated_at();

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
