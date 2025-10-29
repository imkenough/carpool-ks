-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.profiles (
  id uuid NOT NULL,
  updated_at timestamp with time zone,
  full_name text CHECK (char_length(full_name) >= 3),
  avatar_url text,
  phone_number text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.rides (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text,
  destination text,
  date timestamp without time zone,
  from text,
  user_id uuid,
  CONSTRAINT rides_pkey PRIMARY KEY (id),
  CONSTRAINT rides_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);