

-- \set ECHO queries

/* ###################################################################################################### */
\ir './_trm.sql'
-- \ir './set-signal-color.sql'
-- \ir './test-begin.sql'
-- \pset pager on
\timing off
-- ---------------------------------------------------------------------------------------------------------
begin transaction;

\ir '../080-intertext.sql'
\ir '../100-harfbuzz.sql'
\set filename interplot/db/tests/100-harfbuzz.tests.sql
\set signal :red

-- ---------------------------------------------------------------------------------------------------------
\echo :signal ———{ :filename 1 }———:reset
drop schema if exists HARFBUZZ_X cascade; create schema HARFBUZZ_X;




-- =========================================================================================================
--
-- ---------------------------------------------------------------------------------------------------------
create function HARFBUZZ_X.measure_widths( ¶slab text )
  returns float strict immutable language plpgsql as $$
  declare
  begin
    end; $$;




-- ---------------------------------------------------------------------------------------------------------
-- select * from HARFBUZZ._positions_from_text( 'some text' );
-- select * from HARFBUZZ_X.measure_widths( 'some text' );
-- select * from HARFBUZZ.positions_from_text( 'somewhere' );
-- select * from HARFBUZZ.metrics_from_text( 'super' );

create table HARFBUZZ_X.slabjoints_01_probes as
  select * from INTERTEXT_SLABS.shyphenate(
    'supercoherent amazingly eloquent f i fi f. V A W VA VW WA'::text ) as slabjoint;

-- insert into HARFBUZZ_X.slabjoints_01_probes ( vnr, slab, joint ) values
--   ( '{1,1}', 'amazingly', '°' ),
--   ( '{3,1}', 'eloquent', '°' );

create view HARFBUZZ_X.slabwidths as ( select
    d1.vnr        as vnr,
    d1.slab       as slab,
    d1.joint      as joint,
    d3.width      as width
  from HARFBUZZ_X.slabjoints_01_probes                      as d1,
  -- lateral ( select '/home/flow/jzr/hengist/assets/jizura-fonts/FandolKai-Regular.otf' as font_path ) as d12,
  lateral ( select '/home/flow/jzr/hengist/assets/jizura-fonts/lmroman10-italic.otf' as font_path ) as d12,
  lateral HARFBUZZ.metrics_from_text( d12.font_path, d1.slab )  as d3 ( width )
  -- lateral to_char( d2.width, '99,990.000' )                 as d3 ( width )
  order by vnr );

/* ###################################################################################################### */
select * from HARFBUZZ_X.slabwidths;
-- select * from HARFBUZZ.get_detailed_metrics( u&'abc' );
-- -- select * from HARFBUZZ.get_detailed_metrics( u&'布列塔尼语' );
-- select * from HARFBUZZ.get_detailed_metrics( u&'布列塔尼语（Brezhoneg，法文叫Breton）。' );





/* ###################################################################################################### */
\echo :red ———{ :filename 7 }———:reset
\quit




-- do $$ begin perform INVARIANTS.validate(); end; $$;

-- -- instead.








