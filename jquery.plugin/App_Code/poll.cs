using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Services;
using System.Collections;
using System.Data;
using System.Data.SqlClient;

/// <summary>
/// Summary description for poll
/// </summary>
[WebService(Namespace = "http://tempuri.org/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
// To allow this Web Service to be called from script, using ASP.NET AJAX, uncomment the following line. 
[System.Web.Script.Services.ScriptService]
public class poll : System.Web.Services.WebService {

    public class result
    {
        public string browser { get; set; }
        public int votes { get; set; }
    }

    [WebMethod]
    public ArrayList updateVotes (string selected) {

        using (SqlConnection dbCon = new SqlConnection("Data Source=desktop-pc\\sqlexpress;Initial Catalog=browsers;Persist Security Info=True;User ID=poll_manager;Password=password"))
        {
            dbCon.Open();

            SqlCommand readCommand = new SqlCommand("SELECT Votes FROM choices WHERE Browser = @browser", dbCon);
            readCommand.Parameters.AddWithValue("@browser", selected);
            SqlCommand readAllCommand = new SqlCommand("SELECT * FROM choices", dbCon);

            int val = (int)readCommand.ExecuteScalar();

            SqlCommand writeCommand = new SqlCommand("UPDATE choices SET Votes = @newVotes WHERE Browser = @browser", dbCon);
            writeCommand.Parameters.AddWithValue("@newVotes", ++val);
            writeCommand.Parameters.AddWithValue("@browser", selected);

            writeCommand.ExecuteNonQuery();

            ArrayList totalVotes = new ArrayList();
            SqlDataReader reader = readAllCommand.ExecuteReader();

            while (reader.Read())
            {
                result result = new result();
                result.browser = reader["Browser"].ToString();
                result.votes = Int32.Parse(reader["Votes"].ToString());
                totalVotes.Add(result);
            }

            dbCon.Close();

            return totalVotes;
        }
        
    }

}
