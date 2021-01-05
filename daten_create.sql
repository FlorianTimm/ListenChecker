alter table listchecker.unbefahrbar add column geom geometry;
update listchecker.unbefahrbar u set geom = st_linesubstring(k.geometry, 
		case when u.vst <= 0 then 0 when u.vst > k.len then 1 else u.vst/k.len end, 
		case when u.bst >= k.len then 1 else u.bst/k.len end) 
		from sib_import.netz k where u.vnk = k.vnk and u.nnk = k.nnk;
insert into listchecker.projekte (bezeichnung, tabelle) values ('Bei Befahrung unbefahrbar', 'unbefahrbar')
update listchecker.unbefahrbar set last_selected = null