

-- \set ECHO queries

/* ###################################################################################################### */
\ir './_trm.sql'
-- \ir './set-signal-color.sql'
-- \ir './test-begin.sql'
-- \pset pager on
\timing off
\set filename intershop/100-harfbuzz.sql
\set signal :green

-- ---------------------------------------------------------------------------------------------------------
\echo :signal ———{ :filename 1 }———:reset
drop schema if exists HARFBUZZ cascade;
create schema HARFBUZZ;


/* ###################################################################################################### */
\echo :red ———{ :filename 3 }———:reset
\quit






