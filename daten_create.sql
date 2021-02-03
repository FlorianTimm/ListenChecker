alter table listchecker.unbefahrbar add column geom geometry;
update listchecker.unbefahrbar u set geom = st_linesubstring(k.geometry, 
		case when u.vst <= 0 then 0 when u.vst > k.len then 1 else u.vst/k.len end, 
		case when u.bst >= k.len then 1 else u.bst/k.len end) 
		from sib_import.netz k where u.vnk = k.vnk and u.nnk = k.nnk;
insert into listchecker.projekte (bezeichnung, tabelle) values ('Bei Befahrung unbefahrbar', 'unbefahrbar')
update listchecker.unbefahrbar set last_selected = null;








drop table listchecker.kopfstein;
create table listchecker.kopfstein as
with
cluster as (select von_netzknoten, nach_netzknoten,(st_dump(st_union(st_makevalid(geom)))).geom geom
			from querschnitte.querschnitte where art_oberflaeche in ('61','82') group by von_netzknoten, nach_netzknoten, art_oberflaeche_klartext)
select min(q.gid) gid, q.von_netzknoten, q.nach_netzknoten, min(q.von_station) von_station, max(q.bis_station) bis_station, 
string_agg(concat(q.streifen,q.streifennr),';') streifen, art_oberflaeche_klartext oberflaeche, c.geom geom 
from querschnitte.querschnitte q, cluster c where q.von_netzknoten = c.von_netzknoten and q.nach_netzknoten = c.nach_netzknoten and
st_within(st_makevalid(q.geom),st_buffer(c.geom,0.1)) and q.art_oberflaeche in ('61','82') group by q.von_netzknoten, q.nach_netzknoten, art_oberflaeche_klartext, c.geom;

grant select on table listchecker.kopfstein to timm;

--insert into listchecker.projekte (bezeichnung, tabelle) values ('Kopfstein-Pflaster', 'kopfstein');