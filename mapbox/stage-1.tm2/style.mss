// Many of these styles are copied from the Mapbox OSM Bright template.

@motorway:          #fc8;
@main:              #fea;
@street:            #fff;
@street_limited:    #f3f3f3;

@motorwayLineWidth: 5;
@mainLineWidth:     @motorwayLineWidth - 1;
@streetLineWidth:   @mainLineWidth - 2.5;
@sans:              'Source Sans Pro Regular';
@idTextSize:        0;

#iberville-generated {
  line-join: round;
  line-width: @baseRoadWidth;
  
  [cityBlock=1] {
    line-color: @street;
    polygon-fill: #e9e6eb;
    
    text-name: [id];
    text-face-name: @sans;
    text-size: @idTextSize;
    text-placement: interior;
    
    [areaSqM>2000] {
      ::case {
        line-join:round;
        line-cap: round;
        line-color: mix(@motorway, #800, 75);
        [zoom>=15] { line-width:@motorwayLineWidth - 2; }
        [zoom>=16] { line-width:@motorwayLineWidth; }
      }
      
      ::fill {
        line-join:round;
        line-cap:round;
        line-color:@motorway;
        [zoom>=15] { line-width:@motorwayLineWidth - 4; }
        [zoom>=16] { line-width:@motorwayLineWidth - 2; }
      }
    }
    
    [areaSqM>800] {
      ::case {
        line-join:round;
        line-color: mix(@main, #800, 75);
        line-cap: round;
        [zoom>=15] { line-width:@mainLineWidth - 2; }
        [zoom>=16] { line-width:@mainLineWidth; }
      }
      
      ::fill {
         line-join:round;
         line-cap: round;
         line-color:@main;
         [zoom>=15] { line-width:@mainLineWidth - 4; }
         [zoom>=16] { line-width:@mainLineWidth - 2; }
      }
    }
    
    [areaSqM<800] {
      ::case {
        line-join: round;
        line-cap: round;
        line-color: @land * 0.8;
        [zoom>=15] { line-width: @streetLineWidth - 1.5; }
        [zoom>=16] { line-width: @streetLineWidth; }
      }
      
      ::fill {
        line-join: round;
        line-cap: round;
        line-color: @street;
        [zoom>=15] { line-width: @streetLineWidth - 2.5 - 1.5; }
        [zoom>=16] { line-width: @streetLineWidth - 2.5; }
      }
    }
  }
 }

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
  [park=10] {
    polygon-fill: #d8e8c8;
    text-name: '[parkName]';
    text-face-name: @sans_italic;
    text-fill: #036;
    text-size: 5;
    text-halo-fill: fadeout(white, 30%);
    text-halo-radius: .8;
    text-wrap-width: 10;
    text-wrap-before: true;
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
    
    line-color: darken(@water, 20%);
    line-width: 5;
    [zoom>=16] { line-width: @baseRiverLineWidth/4; }
    [zoom>=17] { 
      line-width: @baseRiverLineWidth/2; 
      
      text-name: "''";
      text-repeat-distance: 100000;
      text-placement: interior;
      text-face-name: @sans_italic;
      text-fill: darken(@water, 40%);
      text-size: @baseTextSize/4;
      text-wrap-width: 100;
      text-wrap-before: true;
      text-halo-fill: fadeout(white, 30%);
      text-halo-radius: 2.5;
    }
    [zoom>=19] { text-size: @baseTextSize; }
    [zoom=18] { text-size: @baseTextSize/2; }
  }
}