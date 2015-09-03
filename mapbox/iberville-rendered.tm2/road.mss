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
    
    [areaSqM>800][areaSqM<2000] {
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