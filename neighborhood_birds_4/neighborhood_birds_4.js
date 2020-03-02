let map = null;
var first = 0;
var opacity = 255;
var mapPath;
var view = 0;
//map bird names to their songs and images
var mapName = "states";
var birdSong = {};
var birdImg = {};
var states = {};
var bcrs = {}
var names = {"HI": "Hawaii"};
var birdToState = {};
var birdToBCR = {};
var allBirds = {};
var allStates = [];
var allbcrs = [];
var col1S = 0;
var col1E = 0;
var col2S = 0;
var col2E = 0;
var col3S = 0;
var col3E = 0;
var head = 30;
var bottom = 0;
var subhead = 90;
var body = 135;
var clicked = 0;
var birdsDrag = [];
let song;
let currentBird = null;
var mapDrawn = 0;
var imgSize = 80;
var prevBird = null;
var mouse = 0;
var displayBirds = [];
var loadDrag = false;
var cw;
var cc = 0;
var sw;
var sc = '#e39c35';
var ch;
let ll = new SoftNum(0);
let lr = new SoftNum(0);
var stateClick = "";
var threshold = 1.2;
var label;
var hover;
var rectW = 10;
var rectH = 20;
var rectY;
var months = ["Jan", "Feb", "Mar", 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var dl;
var ml;
let dml = new SoftNum(0);
var frozenBird = false;

// load data in this function so that we can use it immediately inside setup()
function preload() {
  //create new table with only those with imgs and sound i've collected from
  dataTable = loadTable("data/all-stats-regional-2018.csv", "header");
  font = loadFont('data/PoiretOne-Regular.ttf');
  font2 = loadFont('data/Brandon_light.otf');
  mapPath = "data/us-states.svg";
}

function setup() { 
  createCanvas(windowWidth, windowHeight);
  dl = day();
  ml = month();
  var d = day();
  var m = month();
  var count = 0;
  let rows = dataTable.matchRows(new RegExp("US-*"), 6);
  print(rows.length, "rows");
  let rows2 = dataTable.matchRows(new RegExp("BCR-*"), 6);
  print(rows2.length, "rows");
  while (count < rows.length){
    row = rows[count];
    if (within_date(row.get(10), row.get(11), m, d) && row.get(16) != "0" && row.get(16) != '' && float(row.get(12)) > threshold){
      if(row.get(6) == "US-HI"){
        print("Hawaii");
      }
      //create new birds
      b = new Bird(row.get(0),row.get(3), row.get(6), row.get(10), row.get(11), row.get(13), row.get(16), row.get(9));
      if (row.get(3) in birdSong == false){
        birdSong[b.name] = null;
        birdImg[b.name] = null;
        birdSong[b.name] = loadSound("assets/" + b.spec + ".mp3");
        birdImg[b.name] = loadImage("assets/" + b.spec + ".jpg");
      }
      //create new states
      if (row.get(6) in states){
        s = states[row.get(6)];
        s.push(b);
        states[row.get(6)] = s;
        //add it to the existing list
      }
      //create new list for state
      else{
        states[row.get(6)] = [b];
        let n = row.get(6).substring(3);
        let na = row.get(7);
        names[n] = na;
      }
      
      //create bird state lists
      if (b.name in birdToState){
        st = birdToState[b.name];
        st.push(b.state);
        birdToState[b.name] = st;
        //add it to the existing list
      }
      //create new list for state
      else{
        birdToState[b.name] = [b.state];
      }
    }
    //do same thing for bcr regions
    count ++
  }
  count = 0;
  allStates = Object.keys(names);
  names["BCR-1"] = "Aleutian/Bering Sea Islands";
  print(allStates);
  while (count < rows2.length){
    row = rows2[count];
    //create new bcr
    if (within_date(row.get(10), row.get(11), m, d) && row.get(16) != "0" && row.get(16) != '' && float(row.get(12)) > threshold){
      //create new birds
      b = new Bird(row.get(0),row.get(3), row.get(6), row.get(10), row.get(11), row.get(13), row.get(16), row.get(9));
      if (row.get(3) in birdSong == false){
        birdSong[b.name] = null;
        birdImg[b.name] = null;
        birdSong[b.name] = loadSound("assets/" + b.spec + ".mp3");
        birdImg[b.name] = loadImage("assets/" + b.spec + ".jpg");
      }
    if (row.get(6) in bcrs){
      br = bcrs[row.get(6)];
      br.push(b);
      bcrs[row.get(6)] = br;
      //add it to the existing list
    }
    //create new list for state
    else{
      bcrs[row.get(6)] = [b];
      let n = row.get(6);
      let na = row.get(7);
      names[n] = na;
    }
    //create bird bcr lists
    if (b.name in birdToBCR){
      bc = birdToBCR[b.name];
      bc.push(b.state);
      birdToBCR[b.name] = bc;
      //add it to the existing list
    }
    //create new list for state
    else{
      birdToBCR[b.name] = [b.state];
    }
   }
  count ++
  }  
  allbcrs = Object.keys(bcrs);
}

// this function is called when the map loads
function mapReady() {
  map.onClick(mapClick);
  // handle mouseover (hover) events, and mouseout (the opposite of hover)
  map.onMouseOver(mapOver);
  map.onMouseOut(mapOut);
}

function mapClick(shape) {
  clicked = 1;
  if (view == 0){
    for (var s = 0; s < allStates.length; s++){
      map.setFill(allStates[s], '#ccc');
    }
  }
  else{
    for (var s = 0; s < allbcrs.length; s++){
      map.setFill(allbcrs[s], '#ccc');
    }
  }
  if (!ignoreShape(shape.id)) {
    print(shape.id, "clicking");
    map.setFill(shape, '#e39c35');
    stateClick = shape.id;
  }
  
}

function mapOver(shape) {
  birdsDrag = [];
  if (prevBird != null){
    prevBird = null;
    if (view == 0){
      for (var s = 0; s < allStates.length; s++){
        map.setFill(allStates[s], '#ccc');
      }
    }
    else{
      for (var s = 0; s < allbcrs.length; s++){
       map.setFill(allbcrs[s], '#ccc');
      }
     }
  }
  if (!ignoreShape(shape.id)) {
    map.setFill(shape, '#e4d5bf');
  }
  if (stateClick != ""){
    map.setFill(stateClick, '#e39c35');
  }
}

function mapOut(shape) {
  if (!ignoreShape(shape.id)) {
    map.setFill(shape, '#ccc');
  }
  if (stateClick != ""){
  map.setFill(stateClick, '#e39c35');
  }
}

// returns 'true' if this shape should be ignored
// i.e. if it's the ocean or it's the boundary lines between states
function ignoreShape(name) {
  print(name);
  return (name === 'ocean' || name.startsWith('lines-') || name === 'Ignore' || str(name) === "NationalBorder");
}


function draw() {
  head = 0.05*height;
  bottom = height*0.95;
  subhead = 0.15*height;
  body = 0.2*height;
  imgSize = min(0.125*height, 0.063*width);
  col1S = 0.25*width/32;
  col1E = 7*width/16;
  col2S = 7.20*width/16;
  col2E = 12.75*width/16;
  col3S = 12.75*width/16;
  col3E = 15.75*width/16;
  rectW = (col3E-(col2S + 2*imgSize + 5)+3)/13;
  rectH = 0.5*rectW;
  rectY = body+ 70;
  var c = 'by BCR Regions';
  cw = textWidth(c);
  var mapWidth = col1E - col1S;  
  var mapHeight = height * 0.8;
  var mapX = col1S;
  var mapY = (subhead + head) /2 - 10; 
  if (view == 0){
    if (mapPath == "data/bcr.svg"){
      ll.setTarget((col1E - col1S)/2 + cw/2+10);
      lr.setTarget((col1E - col1S)/2 + cw/2 + sw+10);
      mapDrawn = 0;
    }
    mapPath = "data/us-states.svg";
  }
  else{
    if (mapPath == "data/us-states.svg"){
      ll.setTarget((col1E - col1S)/2 - cw/2);
      lr.setTarget((col1E - col1S)/2 + cw/2);
      mapDrawn = 0;
    }
    mapPath = "data/bcr.svg";
  }
  background('#fbf7f4');
  textFont(font);
  textAlign(CENTER, CENTER);
  textSize(40);
  if (birdLoad()){
    if (mapDrawn == 0){
      currentBird = null;
      stateClick = "";
      if (map != null){
        print("deleting");
        map.delDoc();
      }
      mapDrawn = 1;
      map = new SimpleSVG(mapPath, mapX, mapY, mapWidth, mapHeight, mapReady);
      print("width", width,"hieght", height);
      clicked = 0;
    }
    fill(0);
    noStroke();
    text("Who's chirping in your neighborhood?", width/2, head);
    textSize(9);
    textAlign(LEFT, CENTER);
    textFont(font2);
    text("Dataset from eBird Status & Trends, images from Birds of North America, & sounds from Macaulay Library by the Cornell Lab of Ornithology.", col1S, bottom, col1E-col1S, head);
    textFont(font);
    textAlign(CENTER, CENTER);
    textSize(17);
    fill(cc);
    
    ch = 20;
    ll.update();
    lr.update();
    
    var c = 'by BCR Regions';
    cw = textWidth(c);
    text("by BCR Regions", (col1E - col1S)/2, bottom-30);
    fill(sc);
    var c2 = "by States";
    sw = textWidth(c2);
    text("by States", (col1E - col1S)/2 + cw, bottom-30);
    stroke('#e39c35'); 
    strokeWeight(0.5);
    if (first == 0){
      first = 1;
      ll.set((col1E - col1S)/2 + cw/2+20);
      lr.set((col1E - col1S)/2 + cw/2 + sw+20);
    }
    line(ll.value, bottom - 30 - ch/2 +3, lr.value, bottom - 30 - ch/2+3);
    line(ll.value, bottom - 30 + ch/2 +3, lr.value, bottom - 30 + ch/2 +3);
    noStroke();
    fill(0);
    if (clicked == 1){
      textSize(15);
      textFont(font2);
      textAlign(LEFT, TOP);
      fill(0, opacity.value);
      text("Geographic bird population changes often as birds enter types of different breeding or migratory seasons.  See which are the most common birds in your neck of the neighborhood this time of the year.  You might spot some of the 107 selected birds of North America. \n\nView bird populations by US states or by ecologically distinct bird conservation regions (BCRs). Hover over the birds to see how long they'll be around and click on multiple birds to hear their calls in symphony. Drag each bird's date slider to see how their population range changes over the course of a year.", col2S, (subhead+body)/2,col3E-col2S, body+2*imgSize-subhead);
    }
    else if (clicked == 2){
      opacity = opacity + 1;
      if (opacity >= 3){
        clicked = 1;
        opacity = 0;
      }
    }
    else{
      textAlign(LEFT, CENTER);
      textSize(20);
      textFont(font2);
      text("Geographic bird population changes often as birds enter types of different breeding or migratory seasons.  See which are the most common birds in your neck of the neighborhood this time of the year.  You might spot some of the 107 selected birds of North America. \n\nView bird populations by US states or by ecologically distinct bird conservation regions (BCRs). Hover over the birds to see how long they'll be around and click on multiple birds to hear their calls in symphony. Drag each bird's date slider to see how their population range changes over the course of year.", col2S, subhead, col3E-col2S, 3*height/5);
    }
    if (stateClick != ""){
    drawBirds();
    }
  }
  else{
    text("Migrating Data \n Please Wait . . .", width/2, height/2);
  }
}

function drawBirds(){
    textSize(20);
    textAlign(LEFT, TOP);
    textFont(font);
    text("Birds in " + names[stateClick], col2S, subhead + 2*imgSize+10);
    if (view == 0){
      displayBird = states["US-"+str(stateClick.toUpperCase())];
    }
    else{
      displayBird = bcrs[stateClick];
    }
    if (typeof displayBird != "undefined") {
      let x = col2S;
      let y = subhead + 2*imgSize+35;
      let margin = 5+imgSize;
      for (i = 0; i < displayBird.length; i++){
        let img = birdImg[displayBird[i].name];
        if (img != null){
          image(img, x, y, imgSize, imgSize);
          displayBird[i].pos(x,y,imgSize);
          x += margin;
          if (x >= col3E - imgSize){
            x = col2S;
            y += margin
          }
        }
      }
    //if (mouseIsPressed){
    currentBird = null;
    hover = false;
    frozenBird = false;
    for (var b = 0; b < displayBird.length; b++){
      if (birdImg[displayBird[b].name] != null){
        if (birdSong[displayBird[b].name].isPlaying()){
            frozenBird = true;
            noFill();
            stroke('#e39c35');
            strokeWeight(3);
            strokeCap(PROJECT);
            strokeJoin(ROUND);
            rect(displayBird[b].x, displayBird[b].y, imgSize, imgSize);
            print(displayBird[b].name, "isplaying");
        }
      }
    }
    for (var b = 0; b < displayBird.length; b++){
      if (birdImg[displayBird[b].name] != null){
        if(displayBird[b].within(mouseX, mouseY) && !frozenBird){
          print(frozenBird);
          currentBird = displayBird[b];
          if (prevBird == null || prevBird.name != displayBird[b].name){
            print("notequal");
            dl = day();
            ml = month();
            ml = (ml-1)*(rectW+2);
            dl = (dl/31)*rectW;
            dml.set(col2S + 2*imgSize + 5+ml + dl);
            birdsDrag = [];
          }
          prevBird = displayBird[b];
          clicked = 2;
          hover = true;
          if (view == 0){
            birdStates = birdToState[currentBird.name];
            for (var s = 0; s < allStates.length; s++){
              map.setFill(allStates[s], '#ccc');
            }
            for (s = 0; s < birdStates.length; s++){
              map.setFill(birdStates[s], '#e4d5bf');
              map.setFill(stateClick, '#e39c35');
            }
          }
          else{
            birdStates = birdToBCR[currentBird.name];
            for (var s = 0; s < allbcrs.length; s++){
              map.setFill(allbcrs[s], '#ccc');
            }
            for (s = 0; s < birdStates.length; s++){
              map.setFill(birdStates[s], '#e4d5bf');
              map.setFill(stateClick, '#e39c35');
            }
          }
          fill(227, 156, 153, 100);
          noStroke();
          rect(displayBird[b].x, displayBird[b].y, imgSize, imgSize);
          image(birdImg[displayBird[b].name], col2S, subhead, 2*imgSize, 2*imgSize);
          fill(0);
          noStroke();
          textSize(22);
          textFont(font);
          textAlign(LEFT, TOP);
          text("Meet the " + displayBird[b].name + "!", col2S + 2*imgSize+5, subhead);
          textSize(16);
          textFont(font2);
          textAlign(LEFT, TOP);
          text("They'll be around for " + displayBird[b].days + " days between " + displayBird[b].startseason() + " and " + displayBird[b].endseason() +" \nfor their " + displayBird[b].season+ " season.", col2S + 2*imgSize+5, subhead+40);
          var k = 0;
          fill('#ccc');
          rect(col2S + 2*imgSize + 5, rectY, 12*(rectW+2), rectH);
          fill('#e4d5bf');
          var tempE = split(displayBird[b].endseason(), '/');
          var tempS = split(displayBird[b].startseason(), '/');
          var tempSM = parseInt(tempS[0], 10);
          var tempSD = parseInt(tempS[1], 10)
          var tempEM = parseInt(tempE[0], 10);
          var tempED = parseInt(tempE[1], 10)
          var tempX = (tempSM-1)*(rectW+2) + ((tempSD/30)*(rectW+2))+col2S + 2*imgSize + 5;
          var tempW = (tempEM-1)*(rectW+2) + ((tempED/30)*(rectW+2))+col2S + 2*imgSize + 5;
          if (tempSM > tempEM){
            rect(col2S + 2*imgSize + 5, rectY, (tempW-1-(col2S + 2*imgSize + 5)), rectH);
            rect(tempX-2, rectY, 12*(rectW+2) - (tempX-2-(col2S + 2*imgSize + 5)), rectH);
          }
          else{
            rect(tempX-2, rectY, tempW-tempX-1, rectH);
          }
          for (let i = col2S + 2*imgSize + 5; i < col3E-rectW; i+= rectW+2){
            fill('#e39c35');
            textSize(14);
            textAlign(CENTER, CENTER);
            text(months[k],i+rectW/2, rectY+rectH+20)
            strokeWeight(2);
            stroke('#fbf7f4');
            line(i+rectW+1, rectY, i+rectW+1, rectY+rectH);
            k += 1;
          }
          stroke('#e39c35');
          strokeWeight(2);
          line(dml.value, rectY - 10, dml.value, rectY+10+rectH);
        }
      }
    }
    if (prevBird != null && hover == false){
      clicked = 2;
      noFill();
      stroke('#e39c35');
      strokeWeight(3);
      strokeCap(PROJECT);
      strokeJoin(ROUND);
      image(birdImg[prevBird.name], col2S, subhead, 2*imgSize, 2*imgSize);
      fill(0);
      noStroke();
      textSize(22);
      textFont(font);
      textAlign(LEFT, TOP);
      text("Meet the " + prevBird.name + "!", col2S + 2*imgSize+5, subhead);
      textSize(16);
      textFont(font2);
      textAlign(LEFT, TOP);
      text("They'll be around for " + prevBird.days + " days between " + prevBird.startseason() + " and " + prevBird.endseason() +" \nfor their " + prevBird.season+ " season.", col2S + 2*imgSize+5, subhead + 40);
      var k = 0;
      fill('#ccc');
      rect(col2S + 2*imgSize + 5, rectY, 12*(rectW+2), rectH);
      fill('#e4d5bf');
      var tempS = split(prevBird.startseason(), '/');
      var tempE = split(prevBird.endseason(), '/');
      var tempSM = parseInt(tempS[0], 10);
      var tempSD = parseInt(tempS[1], 10)
      var tempEM = parseInt(tempE[0], 10);
      var tempED = parseInt(tempE[1], 10)
      var tempX = (tempSM-1)*(rectW+2) + ((tempSD/30)*(rectW+2))+col2S + 2*imgSize + 5;
      var tempW = (tempEM-1)*(rectW+2) + ((tempED/30)*(rectW+2))+col2S + 2*imgSize + 5;
      if (tempSM > tempEM){
        rect(col2S + 2*imgSize + 5, rectY, (tempW-1-(col2S + 2*imgSize + 5)), rectH);
        rect(tempX-2, rectY, 12*(rectW+2) - (tempX-2-(col2S + 2*imgSize + 5)), rectH);
      }
      else{
        rect(tempX-2, rectY, tempW-tempX-1, rectH);
      }
      for (let i = col2S + 2*imgSize + 5; i < col3E-rectW; i+= rectW+2){
            fill('#e39c35');
            textSize(14);
            textAlign(CENTER, CENTER);
            text(months[k],i+rectW/2, rectY+rectH+20)
            strokeWeight(2);
            stroke('#fbf7f4');
            line(i+rectW+1, rectY, i+rectW+1, rectY+rectH);
            k += 1;
          }
          stroke('#e39c35');
          strokeWeight(2);
          line(dml.value, rectY - 10, dml.value, rectY+10+rectH);
      if (birdsDrag.length != 0){
        if (view == 0){
          for (var s = 0; s < allStates.length; s++){
             map.setFill(allStates[s], '#ccc');
          }
        }
        else{
          for (var i = 0; i < allbcrs.length; i++){
            map.setFill(allbcrs[i], '#ccc');
          }
        }
       for (var i = 0; i < birdsDrag.length; i++){
          map.setFill(birdsDrag[i], '#e4d5bf');
       }
      }
    }
  }
}
  
function birdLoad(){
  for (var s in states){
    birds = states[s];
    for (var b = 0;  b < birds.length; b++){
      if (birdImg[birds[b].name] == null || birdSong[birds[b].name] == null){
        return false;
      }
    }
  }
  return true;
}

function within_date(start, end, m, d){
  var splitS = split(start, '/');
  var splitE = split(end, '/');
  var sM = parseInt(splitS[0], 10);
  var sD = parseInt(splitS[1], 10);
  var eM = parseInt(splitE[0], 10);
  var eD = parseInt(splitE[1], 10);
  if (sM > eM){
    if(m < eM || m > sM){
      return true;
    }
    else if (m == sM && d >= sD){
      return true;
    }
    else if (m == eM && d <= eD){
      return true;
    }
    else{
      return false;
    }
  }
  if (m > sM && m < eM){
    return true;
  }
  else if (m == sM){
    if (d >= sD){
      return true;
    }
    else{
      return false;
    }
  }
  else if (m == eM){
    if (m <= eD){
      return true;
    }
    else{
      return false;
    }
  }
  else if (m == eM && m == sM){
    if (d >= sD && d <= eD){
      return true;
    }
  }
  else{
    return false;
  }
}

function mousePressed() {
  birdsDrag = [];
  if (mouseX <= (col1E - col1S)/2 + cw/2 && mouseX >=(col1E - col1S)/2 - cw/2 && mouseY <= bottom - 30 + ch/2 && mouseY >= bottom - 30 - ch/2){
    cc = '#e39c35';
    sc = 0;
    view = 1;
  }
  if (mouseX <= (col1E - col1S)/2 +cw + sw/2 && mouseX >= (col1E - col1S)/2 + cw - sw/2 && mouseY <= bottom - 30 + ch/2 && mouseY >= bottom - 30 - ch/2){
    cc = 0;
    sc = '#e39c35';
    view = 0;
  }
  if (typeof displayBird != "undefined") {
  for (var b = 0; b < displayBird.length; b++){
      if (birdImg[displayBird[b].name] != null){
        if(displayBird[b].within(mouseX, mouseY)){
          currentBird = displayBird[b];
          prevBird = currentBird;
        }
      }
    }
  }
  if (currentBird != null){
    frozenBird = true;
    song = birdSong[currentBird.name];
    //draw squares where it is playin
    rect(currentBird.x, currentBird.y, imgSize, imgSize);
    if (song != null){
      if (song.isPlaying()) {
        song.stop();
        frozenBird = false;
      } else {
        song.play();
      }
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if(view == 0){
      ll.setTarget((col1E - col1S)/2 + cw);
      lr.setTarget((col1E - col1S)/2 + cw + sw);
  }
  else{
    ll.set((col1E - col1S)/2 - cw/2);
    lr.set((col1E - col1S)/2 + cw/2);
  }
}

function mouseDragged() {
  loadDrag = true;
  if (mouseX <= col2S+2*imgSize+27+12*rectW && mouseX >= col2S + 2*imgSize + 5 && mouseY >= rectY && mouseY <= rectY + rectH){
    print("dragging");
    birdsDrag = [];
    dml.set(mouseX);
    ml = int((mouseX - (col2S + 2*imgSize + 5))/(rectW+2))+1;
    dl = int(((mouseX - (col2S + 2*imgSize + 5)-(ml-1)*(rectW+2))/(rectW+2))*31)+1;
  }
}

function mouseReleased(){
  if (loadDrag){
   let rr = dataTable.matchRows(new RegExp(prevBird.name), 3);
    if (view == 0){
      for (var i = 0; i < rr.length; i++){
        if (rr[i].get(6).substring(0,2) == str("US") && within_date(rr[i].get(10), rr[i].get(11), ml, dl) && float(rr[i].get(12)) > threshold){
          birdsDrag.push(rr[i].get(6).substring(3));
        }
      }
    }
    else{
      for (var i = 0; i < rr.length; i++){
        if (rr[i].get(6).substring(0,3) == "BCR" && within_date(rr[i].get(10), rr[i].get(11), ml, dl) && float(rr[i].get(12)) > threshold){
          birdsDrag.push(rr[i].get(6));
        }
      }
    }
  }
  loadDrag = false;
}
