$(function(){
  // theMovieDb.configurations.getConfiguration(successCB, errorCB);
  function successCB(data) {
    var result = JSON.parse(data);
    console.log(result);
    $div.append(result.results[0].original_title, result.results[0].overview + '\n');

     $div.append('<img src="http://image.tmdb.org/t/p/w185' + result.results[0].poster_path + '">')
     netflixStatus(result.results[0]);

  }

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

function netflixStatus(obj){
    var year = obj.release_date.split('-')[0];
    var title = obj.original_title;
    $.get('https://netflixroulette.net/api/api.php?title=' + title + '&year=' + year)
    .done(function(data){
      console.log(data);
    })
    .fail(function(){
      console.log('That title is not currently available')
    });
}
  })
