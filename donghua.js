var sp = getSpotifyApi(1);
var models = sp.require('sp://import/scripts/api/models');
var player = models.player;

exports.init = init;

var list = [],
    playlist = [];

function init() {
	// request 
	$('#header').html('loading...');
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
  var o = list[position];
  
  var img = $('<img class="full">').attr('src', o['gif']);
  $('#content').html(img);
}

function goto(position) {
  showGif(position);
  
  var o = list[position];
  // play!!
  player.play(o.track_id, playlist); 
}

function getList() {
	$.ajax({
    url: 'http://lab.wiewer.nl/musichackday/2012/amsterdam/gifs.json',
    dataType: 'json',
    success: function(data) {
      $('#header').html('bang...');
      list = data;
      
      // create playlist!!
      playlist = new models.Playlist();
      var i;
      for(i = 0; i < list.length; i++) {
        playlist.add(list[i].track_id);
      }
      
      player.repeat = true;
      
      showList();
  	}
  });
}

function showList() {
  $('#content').html('<div id="list" />');
  var i;
  for(i in list) {
    var o = list[i];
    var img = $('<img/>').attr('src', o['gif']);
    var a = $('<a/>').attr('href', 'spotify:app:donghua:' + i)
    a.append(img);
    $('#list').append(a);
  }
  
}
