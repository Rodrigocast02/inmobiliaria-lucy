-- Ejecutar una sola vez en Supabase > SQL Editor.
create extension if not exists "pgcrypto";

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
using (published = true or auth.role() = 'authenticated');

drop policy if exists "Authenticated users can create properties" on public.properties;
create policy "Authenticated users can create properties"
on public.properties for insert to authenticated
with check (true);

drop policy if exists "Authenticated users can update properties" on public.properties;
create policy "Authenticated users can update properties"
on public.properties for update to authenticated
using (true) with check (true);

drop policy if exists "Authenticated users can delete properties" on public.properties;
create policy "Authenticated users can delete properties"
on public.properties for delete to authenticated
using (true);

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
with check (bucket_id = 'property-images');

drop policy if exists "Authenticated users can update property images" on storage.objects;
create policy "Authenticated users can update property images"
on storage.objects for update to authenticated
using (bucket_id = 'property-images');

drop policy if exists "Authenticated users can delete property images" on storage.objects;
create policy "Authenticated users can delete property images"
on storage.objects for delete to authenticated
using (bucket_id = 'property-images');

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists properties_updated_at on public.properties;
create trigger properties_updated_at before update on public.properties
for each row execute function public.set_updated_at();
