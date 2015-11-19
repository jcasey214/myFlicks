$(function(){
  var $submit = $('#submit');
  var $input = $('input[name="search"]');
  var query;
  var $div = $('div.col-md-6');
  var $listDiv = $('div.col-md-3.well');
  var myList = JSON.parse(localStorage.getItem('myList')) || [];
  if(JSON.parse(localStorage.getItem('myList')) === null){
    localStorage.setItem('myList', JSON.stringify(myList));
  }
  console.log(myList);
  if(myList !== null && myList.length > 0){
    myList = myListUpdateNetflixStatus(myList);
    localStorage.setItem(JSON.stringify(myList));
    constructList(myList);
  }else{
    $listDiv.hide();
  }


  $submit.on('click', function(event){
    $div.empty();
    event.preventDefault();
    query = $input.val();
    if(query === ''){
      $div.append("<h1>Enter a Movie Title in the Search Box</h1><hr>");
    }else{
    $div.append("<h1>Search '" + query + "'</h1><hr>");
    // console.log(query);
    theMovieDb.search.getMovie({"query": query}, successCB, errorCB);
    }
  });

  function successCB(data) {
    var result = JSON.parse(data);
    console.log(result);
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
    console.log("Error callback: " + data);
    }

function getDetailsForMovie(movie) {
  var source = $('#result-template').html();
  var template = Handlebars.compile(source);
  getCast(movie)
    .done(function(movie){
      getDirector(movie).done(function(movie){
        getTrailer(movie).done(function(movie){
          netflixStatus(movie).done(function(movie){
          // console.log(movie);
          // var dataMovie = new Movie(movie);
          // console.log(dataMovie);
          // console.log(dataMovie.toString());
          // console.log(JSON.stringify(dataMovie));
          // movie.movieData = JSON.stringify(dataMovie);
          var html = template(movie);
          // movie.movieData = JSON.stringify(movie);
          $div.append(html);
          // $icon = $('.media-right > i');
          // if ($icon.hasClass('check')){
          //   $icon.removeClass('check');
          //   $icon.addClass('fa fa-check-circle fa-4x')
          //   .css('color', 'green');
          // }else if ($icon.hasClass('circle')){
          //   $icon.removeClass('circle');
          //   $icon.addClass('fa fa-circle fa-4x')
          //   .css('color', 'red');
          // }
          // addButtonEventListener();
          $('#' + movie.id + "-add").on('click', addButtonEventListener);
        });
        });
      });
    })
    .fail(function(){
      console.log(error);
    });
}

  function getCast(movie){
    var deferred = jQuery.Deferred();

    theMovieDb.movies.getCredits({"id": movie.id },
     function(data){
      var result = JSON.parse(data);
      // console.log(result);
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
      // console.log(starring);
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
      // console.log(director);
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
      // console.log(result);
      if(result.youtube.length > 0) {
        // obj.director = result.crew[0].name;
        var trailerLink = 'https: //www.youtube.com/watch?v=' + result.youtube[0].source;// get the director out of the result
        // console.log(trailerLink);
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
    // var check = "class='fa fa-check-circle' color='green'";
    // var circle = 'class="fa fa-circle" color="red"';
    console.log(title, movie.year);
    Netflix.search(title)
    .done(function(data){
      console.log(data);
      if(data.length > 0){
        for(var i = 0; i < data.length; i ++){
          console.log(data[i].title, title);
          if(data[i].title === title.trim()){
            movie.netflix = true;
            console.log('found it');
            // movie.netflixIcon = 'check';
            deferred.resolve(movie);
            return movie;
          }else{
            console.log('The movie is not currently available on Netflix');
            movie.netflix = false;
            // movie.netflixIcon = 'circle';
            deferred.resolve(movie);
            return movie;
          }
        }
    }else{
      console.log('The movie is not currently available on Netflix');
      movie.netflix = false;
      // movie.netflixIcon = 'circle';
      deferred.resolve(movie);
      return movie;
    }
    console.log(movie);
    }).fail(function(error){
      deferred.resolve(movie);
  });
    return deferred;
  }

  function myListUpdateNetflixStatus(array){
    var title;
    var result = [];
    for(var i = 0; i < array.length; i++){
      title = array[i].movieTitle;
      Netflix.search(title)
      .done(checkStatus(data));
    }
  }

  function checkStatus(data){
      if(data.length > 0){
        for(var j = 0; j < data.length; j++){
          if(data[j].title === title.trim()){
            array[i].netflix = true;
            result.push(array[i]);
          }else{
            array[i].netflix = false;
            result.push(array[i]);
          }
        }
    }else{
      movie.netflix = false;
      result.push(array[i]);
    }
    console.log(result);
    return result;
  }



  function addButtonEventListener(){
  // $addButton = $('button.btn.btn-warning');
  // $listDiv = $('div.col-md-3.well');
  //$addButton.click(function(){
    console.log('clicked');
    console.log(event.target);
    var $selection = $(event.target);
    var movieInfo = new Movie($selection);
    console.log(movieInfo);
    myList = JSON.parse(localStorage.getItem('myList'));
    if(myList.length > 0){
    for(var i = 0; i < myList.length; i++){
      if(myList[i].movieTitle === movieInfo.movieTitle){
        console.log('blocked');
        return;
      }
    }
  }
    myList.push(movieInfo);
    localStorage.setItem('myList', JSON.stringify(myList));
    console.log(myList);
    constructList(myList);

    // var source = $('#my-list-template').html();
    // var template = Handlebars.compile(source);
    // $listDiv.show().slideDown();
    // $listDiv.empty();
    // $listDiv.append('<h2>My List</h2>');
    // for (var i = 0; i < myList.length; i++){
    //   var context = myList[i];
    //   var html = template(context);
    //   $listDiv.append(html);
  // }
    // event.stopPropagation();
    //});
}

  function constructList(array){
    $listDiv = $('div.col-md-3.well');
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
  console.log('clicked');
  var removalID = $(event.target).attr('id');
  removalID = removalID.replace('-remove', '');
  console.log(removalID);
  for(var i = 0; i < myList.length; i++){
    console.log(myList[i].idNum);
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
});
