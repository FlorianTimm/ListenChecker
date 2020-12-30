<%@ page contentType="application/json; charset=utf-8" language="java" import="java.sql.* " %><%@ page import="java.io.*" %><%
Connection db = null;
try {
	
	// Verbindung mit der Datenbank, diese muss vorher im Glassfish eingerichtet werden
	String driver = "org.postgresql.Driver";
	String url = "jdbc:postgresql://localhost:5433/geo";
	String username = "postgres";
	String password = "Hamburg01!";
	Class.forName(driver).newInstance();
	db = DriverManager.getConnection(url,username,password);
	
    
    int projekt = Integer.parseInt(request.getParameter("projekt"));

    // Stationierung vorbereiten (PPST)
	String st_projekt = "SELECT tabelle FROM listchecker.projekte where id = ?;";
    PreparedStatement getProjekt = db.prepareStatement(st_projekt);
    getProjekt.setInt(1, projekt);

    ResultSet r_projekt = getProjekt.executeQuery();
    String tabelle = null;
    if (r_projekt.next()) {
        tabelle = r_projekt.getString(1);
    } else {
        out.print("Fehler");
        throw new Exception("Projekt nicht gefunden");
    }

    PreparedStatement column_last = db.prepareStatement(String.format("ALTER TABLE listchecker.%s ADD COLUMN IF NOT EXISTS last_selected timestamp default null",  tabelle));
    column_last.executeUpdate();

    PreparedStatement column_status = db.prepareStatement(String.format("ALTER TABLE listchecker.%s ADD COLUMN IF NOT EXISTS status integer default 0",  tabelle));
    column_status.executeUpdate();

	// Stationierung vorbereiten (PPST)
    String st_getPos = String.format("UPDATE listchecker.%s u SET last_selected = now() FROM (SELECT gid FROM listchecker.%s where last_selected is null and status = 0 LIMIT 1) s WHERE s.gid = u.gid returning ST_AsGeoJSON(u.*);", tabelle, tabelle);
    PreparedStatement getPos = db.prepareStatement(st_getPos);

	ResultSet r_pos1 = getPos.executeQuery();

	if (r_pos1.next()) {
		out.print(r_pos1.getString(1));
	}
} catch(ClassNotFoundException e){
    out.print("Fehler");
	out.print(e.getStackTrace());
} catch (SQLException ex) {
	out.print("SQLException: "+ex.getMessage());
	out.print("SQLState: " + ex.getSQLState());
	out.print("VendorError: " + ex.getErrorCode());
} finally {
	
	// DB-Verbindung schließen
	
	if (db != null) {
		try {
			db.close();
		} catch (SQLException ex) {
			ex.printStackTrace();
		}
	}
}
%>