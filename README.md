# iberville
Experimenting with procedurally generating a city map

### Usage
I developed this on node `v0.12.7`.

### Demo
Run `npm start` and copy the output of into http://geojson.io/ to see what was rendered.

### TODO / Ideas
* Add
    * Parks
* Convert all the polygons into lines so the roads are represented in a more intuitive manner
    * Make some roads wider than others

### Lessons learned
* Log everything
* Iterative development is your friend
* Make everything a param that can be tweaked. Really interesting algorithms can easily be torpedoed by crappy params.
* For once, I actually need to slow down and think about what I'm typing.
* Async is not as helpful here because it's CPU-bound