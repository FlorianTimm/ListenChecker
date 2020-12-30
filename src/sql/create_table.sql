create schema listchecker;
create table listchecker.projekte(id serial, bezeichnung character varying (60) not null, tabelle character varying (60) not null);


-- Testdaten

insert into listchecker.projekte (bezeichnung, tabelle) values ('Testdaten','testdaten');

create table listchecker.testdaten (gid serial primary key, 
									beschriftung character varying, 
									geom geometry(LineString, 25832), 
									status integer default 0);

insert into listchecker.testdaten (beschriftung, geom) 
select strassenname, geom from sib_import.kanten where (bst-vst) <= 1;