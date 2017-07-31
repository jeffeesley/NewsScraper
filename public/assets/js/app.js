$("#scrapeArticles").on("click", function(event){
	window.location = "/scrape";
});

$(document).on("click", ".saveArticle", function(){
	var thisId = $(this).attr("data-id");

	$.ajax({
		method: "POST",
		url: "/saveArticle",
		data: {
			id: thisId
		}
	}).done(function(data){
		console.log(data);
	});
});