

-- ---------------------------------------------------------------------------------------------------------
\pset pager off
\set ECHO none
begin transaction;


-- ---------------------------------------------------------------------------------------------------------
\pset pager on
select * from U.variables order by key;

-- ---------------------------------------------------------------------------------------------------------
\pset pager on
select MIRAGE.procure_dsk_pathmode( 'pkg', '/media/flow/kamakura/home/flow/jzr/hengist/package.json', 'plain' );
select MIRAGE.procure_dsk_pathmode( 'readme', '/media/flow/kamakura/home/flow/jzr/hengist/README.md', 'plain' );
-- select MIRAGE.procure_dsk_pathmode( 'readme', './README.md', 'plain' );
select MIRAGE.refresh( 'pkg' );
select MIRAGE.refresh();
select * from MIRAGE.mirror order by dsk, dsnr, linenr, mode;




