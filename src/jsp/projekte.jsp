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
	
	
	// Stationierung vorbereiten (PPST)
	String st_getPos = "SELECT json_agg(t) json FROM listchecker.projekte t;";
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