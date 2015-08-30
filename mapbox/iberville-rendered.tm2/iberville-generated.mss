Map { background-color: white; }

@water: #c3e6ff;
@baseRiverLineWidth: 5;
@baseTextSize: 30;
@sans: 'Source Sans Pro Regular';
@sans_italic: 'Source Sans Pro Italic';

#iberville-generated {
  line-join: round;
  line-width: 1.4;
  
  [river=1] {
    line-color: @water;
    line-width: 5;
    [zoom>=16] { line-width: @baseRiverLineWidth/4; }
    [zoom>=17] { line-width: @baseRiverLineWidth/2; }
    line-cap: round;    
  }
  
  [lake=1] {
    polygon-fill: @water;
    polygon-gamma: .6;
    line-color: darken(@water, 20%);
    line-width: 5;
    [zoom>=16] { line-width: @baseRiverLineWidth/4; }
    [zoom>=17] { 
      line-width: @baseRiverLineWidth/2; 
      
      text-name: "'Lake Unknown'";
      text-face-name: @sans_italic;
      text-fill: darken(@water, 40%);
      text-size: @baseTextSize/4;
      text-wrap-width: 100;
      text-wrap-before: true;
    }
    [zoom=19] { text-size: @baseTextSize; }
    [zoom=18] { text-size: @baseTextSize/2; }
  }
}

#road {
  line-color: #cde;
  line-width: 0.5;
}