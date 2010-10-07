// ===============
// = YQL Queries =
// ===============
/*
/ This File holds all YQL queries to retrieve data from YQL data tables
*/

var yql_query_meme_info = "SELECT * FROM meme.info where owner_guid=me| meme.functions.thumbs(width=22,height=22)";
var yql_query_dashboard = "SELECT * FROM meme.user.dashboard";