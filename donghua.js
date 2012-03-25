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
	
	player.observe(models.EVENT.CHANGE, playerStateChanged);
}

function playerStateChanged(ev) {
  // showGif(position);
  var position = -1;
  var currentUri = player.track.data.uri;
  for (var i = 0; i < list.length; i++) {
    if(currentUri == list[i].track_id) 
      position = i;
  }
  showGif(position)
}

function argumentsChanged() {
  var args = sp.core.getArguments();
  console.debug('argumentsChanged');
  console.debug(args)
  goto(args[0]);
}

function showGif(position) {
  var gif = gifs[position];
  console.log(gif);
  
  var img = $('<img class="full">').attr('src', gif);
  $('#content').html(img);
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
  $('#content').append($('<div id="list" />').css('display', 'none'));
  for(var i in gifs) {
    var gif = gifs[i];
    var img = $('<img/>').attr('src', gif).on('load', function() {
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
    // hide spinner
    $('#loading').hide();
    $('#list').show();
  }
}
