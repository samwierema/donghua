var sp = getSpotifyApi(1);
var models = sp.require('sp://import/scripts/api/models');

var player = models.player;
player.repeat = true;

exports.init = init;

var gifs = [],
    playlist = [],
    loaded = 0;

function init() {
  getList();
	
  sp.core.addEventListener("argumentsChanged", argumentsChanged);
	
  var i;
  for(i in models.EVENT) {
    var e = models.EVENT[i];
    player.observe(e, playerStateChanged);
  }
}

function playerStateChanged(ev) {
  console.debug('playerStateChanged');
  var position = -1;
  var currentUri = player.track.data.uri;
  for (var i = 0; i < playlist.tracks.length; i++) {
    if(currentUri == playlist.tracks[i].uri) 
      position = i;
  }
  if(position > -1) {
    showGif(position);
  }
}


function argumentsChanged() {
  var args = sp.core.getArguments();
  console.debug('argumentsChanged');
  console.debug(args)
  goto(args[0]);
}

function showGif(position) {
  if($('#fullscreen').is(":hidden")) {
    var img = $('<img />').attr({
      'src': gifs[position]
    });
    $('#fullscreen').append(img);
    $('#fullscreen a').click(function() {
      player.playing = false;
      showMainScreen();
    })
    hideLoadingScreen();
    hideMainScreen();
    $('#fullscreen').show();
  }
}

function hideGif() {
  $('#fullscreen img').remove();
  $('#fullscreen').hide();
}

function showMainScreen() {
  hideLoadingScreen();
  hideGif();
  $('body').css({'margin-top': '5%'});
  $('#list').show();
  $('#footer').show();
}

function hideMainScreen() {
  $('#list').hide();
  $('#footer').hide();
}

function showLoadingScreen() {
  hideMainScreen();
  hideGif();
  spinner.spin(target);
  if($(window).height() > 290) {
    $('body').css({'margin-top': (($(window).height() - 290) / 2 + 'px')});
  }
  $('#loading').show();
}

function hideLoadingScreen() {
  spinner.stop();
  $('#loading').hide();
}

function goto(position) {
  showGif(position);
  
  // play!!
  player.play(playlist.tracks[position].uri, playlist); 
}

function getList() {
	$.ajax({
    url: 'http://lab.wiewer.nl/musichackday/2012/amsterdam/gifs.json',
    dataType: 'json',
    success: function(data) {      
      // create playlist!!
      playlist = new models.Playlist();
      for(var i = 0; i < data.length; i++) {
        models.Track.fromURI(data[i].track_id, function(track) {
          if(track.playable) {
            playlist.add(track);
            gifs.push(data[i].gif);
          }
        })
      }
      showList();
  	}
  });
}

function showList() {
  for(var i in gifs) {
    var gif = gifs[i];
    var img = $('<img/>').attr('src', gif).css({
      'width': ($(document).width() / 4),
      'height': 'auto'
    }).on('load', function() {
      incrLoaded();
    });
    var a = $('<a/>').attr('href', 'spotify:app:donghua:' + i)
    a.append(img);
    $('#list').append(a);
  }  
}

function incrLoaded() {
  loaded++;
  if(loaded == playlist.tracks.length) {
    showMainScreen();
  }
}
