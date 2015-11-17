$(function(){

//function to execute if api call to tmdb is successfull
  function successCB(data) {
    var result = JSON.parse(data);
    console.log(result);
    for (var i = 0; i < result.results.length; i++) {
      var context = result.results[i];
      context.poster_path = "http://image.tmdb.org/t/p/w185" + context.poster_path;
      getDetailsForMovie(context);
      if (i === 5){
        break;
      }
    }
}

function getDetailsForMovie(movie) {
  var source = $('#result-template').html();
  var template = Handlebars.compile(source);
  getCast(movie)
    .done(function(movie){
      getDirector(movie).done(function(movie){
        getTrailer(movie).done(function(movie){
          netflixStatus(movie).done(function(movie){
          console.log(movie);
          var html = template(movie);
          $div.append(html);
          $icon = $('.media-right > i');
          if ($icon.hasClass('check')){
            $icon.removeClass('check');
            $icon.addClass('fa fa-check-circle fa-4x');
            $icon.css('color', 'green');
          }else if ($icon.hasClass('circle')){
            $icon.removeClass('circle');
            $icon.addClass('fa fa-circle fa-4x');
            $icon.css('color', 'red');
          }
        });
        });
      });
    })
    .fail(function(){
      console.log(error);
    });
}

//function to execute if api call to tmdb fails
  function errorCB(data) {
    console.log("Error callback: " + data);
    }

  var $submit = $('#submit');
  var $input = $('input[name="search"]');
  var query;
  var $div = $('div.col-md-6');


  $submit.on('click', function(event){
    $div.empty();
    event.preventDefault();
    query = $input.val();
    console.log(query);
    theMovieDb.search.getMovie({"query": query}, successCB, errorCB);
  });
//check availability of title on netflix using netflix roulette api
  // function nnnetflixStatus(obj){
  //   var deferred = $.Deferred();
  //   var year = obj.release_date.split('-')[0];
  //   var title = obj.original_title;
  //   $.get('https://netflixroulette.net/api/api.php?title=' + title + '&year=' + year)
  //   .done(function(data){
  //     console.log(data);
  //     obj.netflix = true;
  //   })
  //   .fail(function(){
  //     console.log('That title is not currently available');
  //     obj.netflix = false;
  //   });
  // }


  function getCast(movie){
    var deferred = jQuery.Deferred();

    theMovieDb.movies.getCredits({"id": movie.id },
     function(data){
      var result = JSON.parse(data);
      console.log(result);
      // obj.director = result.crew[0].name;
      var cast = result.cast;
      var starring = 'Cast: ';
      for (var i = 0; i < cast.length; i ++){
        starring += cast[i].name;
        if(i < 5){
          starring += ', ';
        }
        if (i === 5){
          break;
        }
      }
      console.log(starring);
      movie.starring = starring;
      deferred.resolve(movie);
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
      movie.director = director;
      deferred.resolve(movie);
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
      if(result.youtube.length > 0) {
        // obj.director = result.crew[0].name;
        var trailerLink = 'https: //www.youtube.com/watch?v=' + result.youtube[0].source;// get the director out of the result
        console.log(trailerLink);
        movie.trailerLink = trailerLink;
      }
      deferred.resolve(movie);
    }, function(error){
      deferred.reject(error);
    });
    return deferred;
  }

  function netflixStatus(movie){
    var deferred = jQuery.Deferred();
    var year = movie.release_date.split('-')[0];
    var title = movie.original_title;
    // var check = "class='fa fa-check-circle' color='green'";
    // var circle = 'class="fa fa-circle" color="red"';
    Netflix.search(title)
    .done(function(data){
      console.log(data);
      if(data.length > 0){
      movie.netflix = true;
      movie.netflixIcon = 'check';
      deferred.resolve(movie);
    }else{
      console.log('The movie is not currently available on Netflix');
      movie.netflix = false;
      movie.netflixIcon = 'circle';
      deferred.resolve(movie);
    }
    }).fail(function(error){
      deferred.resolve(movie);
  });
    return deferred;
  }



});
