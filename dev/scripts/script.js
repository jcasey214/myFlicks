$(function(){
  var $submit = $('#submit');
  var $input = $('input[name="search"]');
  var query;
  var $div = $('div.col-md-7');
  var $listDiv = $('div.col-md-4.well');
  var myList = JSON.parse(localStorage.getItem('myList')) || [];

  if(JSON.parse(localStorage.getItem('myList')) === null){
    localStorage.setItem('myList', JSON.stringify(myList));
  }
  if(myList.length > 0){
    myListUpdateNetflixStatus(myList)
    .then(function(results){
      localStorage.setItem('myList', JSON.stringify(myList));
      constructList(myList);
  });
  }else{
    $listDiv.hide();
  }

  var picker = Math.floor(Math.random() * 10) + 1;

  switch(picker){
    case 1:
      theMovieDb.discover.getMovies({'primary_release_date.lte': '2015-01-01' }, successCB, errorCB);
      break;
    case 2:
      theMovieDb.movies.getTopRated({}, successCB, errorCB);
      break;
    case 3:
      theMovieDb.discover.getMovies({'primary_release_date.lte': '2010-01-01' }, successCB, errorCB);
      break;
    case 4:
      theMovieDb.discover.getMovies({'sort_by':'popularity.desc' }, successCB, errorCB);
      break;
    case 5:
      theMovieDb.discover.getMovie({'primary_release_date.lte': '2013-01-01'}, successCB, errorCB);
      break;
    case 6:
      theMovieDb.discover.getMovies({'sort_by': 'revenue.desc' }, successCB, errorCB);
      break;
    case 7:
      theMovieDb.genres.getMovies({"id": 28}, successCB, errorCB);
      break;
    case 8:
      theMovieDb.discover.getMovies({'sort_by':'revenue.desc' }, successCB, errorCB);
      break;
    case 9://
      theMovieDb.discover.getMovies({'primary_release_date.lte': '2014-01-01' }, successCB, errorCB);
      break;
    case 10:
      theMovieDb.discover.getMovies({'primary_release_date.lte': '2014-01-01' }, successCB, errorCB);
      break;

  }

  $submit.on('click', function(event){
    $div.empty();
    event.preventDefault();
    query = $input.val();
    if(query === ''){
      $div.append("<h1>Enter a Movie Title in the Search Box</h1><hr><img src='./assets/action.png' width='60%' style='opacity:0.3'>");
    }else{
    $div.append("<h1>Search '" + query + "'</h1><hr>");
    // console.log(query);
    theMovieDb.search.getMovie({"query": query}, successCB, errorCB);
    }
  });

  function successCB(data) {
    var result = JSON.parse(data);
    if(result.results.length === 0){
      errorCB(data);
    }
    for (var i = 0; i < result.results.length; i++) {
      var context = result.results[i];
      context.poster_path = "http://image.tmdb.org/t/p/w185" + context.poster_path;
      if(context.poster_path == "http://image.tmdb.org/t/p/w185null"){
        context.poster_path = "http://img1.wikia.nocookie.net/__cb20141028171337/pandorahearts/images/a/ad/Not_available.jpg";
      }
      getDetailsForMovie(context);
      if (i === 5){
        break;
      }
    }
  }
  function errorCB(data) {
    $div.append('<h2>Did not return any results </h2><img src="http://rack.3.mshcdn.com/media/ZgkyMDEzLzA3LzE4Lzc1L0RyLldoby41Mjg5ZC5naWYKcAl0aHVtYgkxMjAweDk2MDA-/571ec44d/6da/Dr.-Who.gif">');
    }

  function getDetailsForMovie(movie) {
    var source = $('#result-template').html();
    var template = Handlebars.compile(source);
    getCast(movie)
      .done(function(movie){
        getDirector(movie).done(function(movie){
          getTrailer(movie).done(function(movie){
            netflixStatus(movie).done(function(movie){
            movie.trailerLink = movie.trailerLink.replace(/\s+/g, '');
            movie.trailerLink = movie.trailerLink.replace('watch?v=', 'embed/');
            var html = template(movie);
            $div.append(html);
            $('#' + movie.id + "-add").on('click', addButtonEventListener);
            $('#' + movie.id + "-add").prev('img.media-object').on('click', displayVideo);
            $('.embed-responsive.embed-responsive-4by3').hide();
          });
          });
        });
      })
      .fail(function(){
      });
  }

  function getCast(movie){
    var deferred = jQuery.Deferred();

    theMovieDb.movies.getCredits({"id": movie.id },
     function(data){
      var result = JSON.parse(data);
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
      var crew = result.crew;
      for(var i = 0; i < crew.length; i ++){
        if(crew[i].job.toLowerCase() === "director"){
        director = crew[i].name;
        break;
        }
      }
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
      if(result.youtube.length > 0) {
        var trailerLink = 'https: //www.youtube.com/watch?v=' + result.youtube[0].source;
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
    var title;
    if(movie.hasOwnProperty('release_date')){
      year = movie.release_date.split('-')[0];
      movie.year = year;
    }
    if(movie.hasOwnProperty('original_title')){
      title = movie.original_title;
    }else{
      title = movie.movieTitle;
    }
    Netflix.search(title)
    .done(function(data){
      if(data.length > 0){
        for(var i = 0; i < data.length; i ++){
          if(data[i].title === title.trim()){
            movie.netflix = true;
            deferred.resolve(movie);
            return movie;
          }else{
            movie.netflix = false;
            deferred.resolve(movie);
            return movie;
          }
        }
    }else{
      movie.netflix = false;
      deferred.resolve(movie);
      return movie;
    }
    }).fail(function(error){
      deferred.resolve(movie);
  });
    return deferred;
  }

  function checkStatus(data, movie){
      var result = [];
      if(data.length > 0){
        for(var j = 0; j < data.length; j++){
          if(data[j].title === movie.movieTitle.trim()){
            movie.netflix = true;
            result.push(movie);
          }else{
            movie.netflix = false;
            result.push(movie);
          }
        }
    }else{
      movie.netflix = false;
      result.push(movie);
    }
    return result;
  }

  function myListUpdateNetflixStatus(array){
    var title;
    var promises = [];
    array.forEach(function(movie){
      var p = new Promise(function(resolve, reject){
        title = movie.movieTitle;
        Netflix.search(title).done(function(data){
          var result = checkStatus(data, movie);
          resolve(result);
        });
      });
      promises.push(p);
    });
    return Promise.all(promises);
  }

  function addButtonEventListener(){
    var $selection = $(event.target);
    var movieInfo = new Movie($selection);
    myList = JSON.parse(localStorage.getItem('myList'));
    if(myList.length > 0){
    for(var i = 0; i < myList.length; i++){
      if(myList[i].movieTitle === movieInfo.movieTitle){
        return;
      }
    }
  }
    myList.push(movieInfo);
    localStorage.setItem('myList', JSON.stringify(myList));
    constructList(myList);
}

  function constructList(array){
    $listDiv = $('div.col-md-4.well');
    var source = $('#my-list-template').html();
    var template = Handlebars.compile(source);
    $listDiv.show().slideDown();
    $listDiv.empty();
    $listDiv.append('<h2>My List</h2>');
    for (var i = 0; i < array.length; i++){
      var context = array[i];
      var html = template(context);
      $listDiv.append(html);
      $('#' + context.idNum + "-remove").on('click', removeItem);
    }
}
function Movie(obj){
  this.movieTitle = obj.data('movie');
  this.year = obj.data('year');
  this.poster = obj.data('poster');
  this.netflix = obj.data('nf');
  this.idNum = obj.attr('id');
}

function removeItem(){
  var result = [];
  var removalID = $(event.target).attr('id');
  removalID = removalID.replace('-remove', '');
  for(var i = 0; i < myList.length; i++){
    if(myList[i].idNum === removalID){
      continue;
    }else{
      result.push(myList[i]);
    }
  }
  myList = result;
  localStorage.setItem('myList', JSON.stringify(myList));
  constructList(JSON.parse(localStorage.getItem('myList')));
  if(myList.length === 0){
    $listDiv.hide();
  }
  return myList;
}

function displayVideo(event){
  $target = $(event.target);
  var $parent = $target.closest('div.media');
  $parent.children('div.embed-responsive.embed-responsive-4by3').slideToggle(800);
}
});
