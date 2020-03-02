function Bird(species, name, state, seasonS, seasonE, perc, days, season){
  this.spec = species;
  this.name = str(name);
  if (state.substring(0,2) == "US"){
    this.state = state.substring(3);
  }
  else{
    this.state = state;
  }
  this.bcr = ""
  this.seasonS = seasonS;
  this.seasonE = seasonE;
  this.days = days;
  this.perc = perc;
  this.x = 0;
  this.y = 0;
  this.h = 0;
  if (split(season, "_").length > 1){
    let tempseason = split(season,"_");
    this.season = tempseason[0] + " " + tempseason[1];
  }
  else{
    this.season = season;
  }
  
  this.pos = function(x, y, h){
    this.x = x;
    this.y = y;
    this.h = h;
  }
  
  this.within = function(mX, mY){
    if (mX >= this.x && mX <= this.x + this.h && mY >= this.y && mY <= this.y + this.h){
      return true;
    }
    else{
      return false;
    }
  }
  
  this.startseason = function(){
    var sS = split(this.seasonS, '/');
    var start = sS[0] + "/" + sS[1];
    return start;
  }
  
  this.endseason = function(){
    var sE = split(this.seasonE, '/');
    var end = sE[0] + "/" + sE[1];
    return end;
  }
  
}
