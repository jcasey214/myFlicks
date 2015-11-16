$(function(){

//function to execute if api call to tmdb is successfull
  function successCB(data) {
    var result = JSON.parse(data);
    console.log(result);
    // $div.append(result.results[0].original_title, result.results[0].overview + '\n');
    //
    //  $div.append('<img src="http://image.tmdb.org/t/p/w185' + result.results[0].poster_path + '">');
    //  netflixStatus(result.results[0]);
    var source = $('#result-template').html();
    var template = Handlebars.compile(source);
    var context = result.results[0];
    context.poster_path = "http://image.tmdb.org/t/p/w185" + context.poster_path;
    getCast(context).done(function(starring){
      context.starring = starring;
      getDirector(context).done(function(director){
        context.director = director;
        getTrailer(context).done(function(trailerLink){
          context.trailer = trailerLink;
          console.log(context);
          var html = template(context);
          $div.append(html);
        });
      });

    }).fail(function(error){
      console.log(error);
    });
  }
//funtion to execute if api call to tmdb fails
  function errorCB(data) {
    console.log("Error callback: " + data);
    }

  var $submit = $('#submit');
  var $input = $('input[name="search"]');
  var query;
  var $div = $('div');


  $submit.on('click', function(event){
    event.preventDefault();
    query = $input.val();
    console.log(query);
    theMovieDb.search.getMovie({"query": query}, successCB, errorCB);
  });
//check availability of title on netflix using netflix roulette api
  function netflixStatus(obj){
      var year = obj.release_date.split('-')[0];
      var title = obj.original_title;
      $.get('https://netflixroulette.net/api/api.php?title=' + title + '&year=' + year)
      .done(function(data){
        console.log(data);
      })
      .fail(function(){
        console.log('That title is not currently available');
      });
  }

  function getCast(obj){
    var deferred = jQuery.Deferred();

    theMovieDb.movies.getCredits({"id": obj.id }, function(data){
      var result = JSON.parse(data);
      console.log(result);
      // obj.director = result.crew[0].name;
      var cast = result.cast;
      var starring = 'Cast: ';
      for (var i = 0; i < 5; i ++){
        starring += cast[i].name;
        if(i < 4){
          starring += ', ';
        }
      }
      console.log(starring);
      deferred.resolve(starring);
    }, function(error){
      deferred.reject(error);
    });

    return deferred;
  }

  function getDirector(movie){
    var deferred = jQuery.Deferred();
    theMovieDb.movies.getCredits({"id": movie.id }, function(data){
      var director;
      var result = JSON.parse(data);
      // obj.director = result.crew[0].name;
      var crew = result.crew;
      for(var i = 0; i < crew.length; i ++){
        if(crew[i].job.toLowerCase() === "director"){
        director = crew[i].name;
        break;
        }
      }
       // get the director out of the result
      console.log(director);
      deferred.resolve(director);
    }, function(error){
      deferred.reject(error);
    });

    return deferred;
  }


  function getTrailer(movie){
    var deferred = jQuery.Deferred();
    theMovieDb.movies.getTrailers({"id": movie.id }, function(data){
      var result = JSON.parse(data);
      console.log(result);
      // obj.director = result.crew[0].name;
      var trailerLink = 'https: //www.youtube.com/watch?v=' + result.youtube[0].source;// get the director out of the result
      console.log(trailerLink);
      deferred.resolve(trailerLink);
    }, function(error){
      deferred.reject(error);
    });
    return deferred;
  }


});
