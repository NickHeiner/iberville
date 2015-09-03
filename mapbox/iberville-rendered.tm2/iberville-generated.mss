// Many of these styles are copied from the Mapbox OSM Bright template.

@land: #f8f4f0;
@water: #a0c8f0;

Map { background-color: @land; }

@baseRiverLineWidth: 5;
@baseTextSize: 30;
@sans: 'Source Sans Pro Regular';
@sans_italic: 'Source Sans Pro Italic';
@baseRoadWidth: 1.4;

#iberville-generated {
  [park=1] {
    polygon-fill: #d8e8c8;
  }
  
  [river=1] {
    line-color: @water;
    line-width: 5;
    [zoom>=16] { line-width: @baseRiverLineWidth/4; }
    [zoom>=17] { 
      line-width: @baseRiverLineWidth/2; 
      text-size: @baseTextSize/4;
    }
    line-cap: round;    
    
    text-name: "'The River'";
    text-face-name: @sans_italic;
    text-fill: #036;
    text-size: 20;
    text-dy: 1;
    text-max-char-angle-delta: 15;
    text-halo-fill: fadeout(white, 30%);
    text-halo-radius: 2.5;
    
    [zoom=19] { text-size: @baseTextSize; }
    [zoom=18] { text-size: @baseTextSize/2; }
  }
  
  [lake=1] {
    polygon-fill: @water;
    polygon-gamma: .6;
    polygon-pattern-file: url(pattern/wave.png);
    
    line-color: darken(@water, 20%);
    line-width: 5;
    [zoom>=16] { line-width: @baseRiverLineWidth/4; }
    [zoom>=17] { 
      line-width: @baseRiverLineWidth/2; 
      
      text-name: "'Lake Unknown'";
      text-placement: interior;
      text-face-name: @sans_italic;
      text-fill: darken(@water, 40%);
      text-size: @baseTextSize/4;
      text-wrap-width: 100;
      text-wrap-before: true;
      text-halo-fill: fadeout(white, 30%);
      text-halo-radius: 2.5;
    }
    [zoom=19] { text-size: @baseTextSize; }
    [zoom=18] { text-size: @baseTextSize/2; }
  }
}

#road {
  line-color: #cde;
  line-width: 0.5;
}