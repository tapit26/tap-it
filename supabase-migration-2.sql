-- Run this after the first schema file — adds fields the UI already expects.

alter table links add column icon text default '';
alter table links add column badge text default '';
alter table links add column type text default 'link';
alter table links add column clicks int default 0;

-- Links get client-generated ids (crypto.randomUUID()), so text is simplest
-- and keeps things consistent with the foreign key in analytics_events.
alter table links alter column id set data type text using id::text;
alter table links alter column id drop default;
alter table analytics_events alter column link_id set data type text using link_id::text;
