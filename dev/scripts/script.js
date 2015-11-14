$(function(){
  // theMovieDb.configurations.getConfiguration(successCB, errorCB);
  function successCB(data) {
    var result = JSON.parse(data);
    console.log(result);
    $div.append(result.results[0].original_title, result.results[0].overview);
      theMovieDb.movies.getImages({"id":result.results[0].id}, function(data){console.log(JSON.parse(data))}, errorCB)
    // $div.append('<img src="http://image.tmdb.org' + result.results[0].poster_path + '">')
  };
  function errorCB(data) {
    console.log("Error callback: " + data);
    };

  var $submit = $('#submit')
  var $input = $('input[name="search"]')
  var query;
  var $div = $('div');
  $submit.on('click', function(event){
    event.preventDefault();
    query = $input.val();
    console.log(query);
    theMovieDb.search.getMovie({"query": query}, successCB, errorCB);

  })
  var movie = "interstellar"

})
