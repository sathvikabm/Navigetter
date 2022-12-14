var mapa;
    var lg, lt;
    var opt,k,c=1;

    Position();

    function Position() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          var lat = position.coords.latitude;
          var long = position.coords.longitude;
          mapmaker(long, lat);
        });
      } else {
        alert("Sorry, your browser does not support HTML5 geolocation.");
      }
    }

    function mapmaker(lg, lt) {
        mapboxgl.accessToken = 'pk.eyJ1Ijoic2FnbmlrOTM4IiwiYSI6ImNrY3Exdnh4OTBsOGoyeG1uZHEwcjEweDkifQ.VwtQeIEvs3VdHxWZD7K8Ng';
        mapa = new mapboxgl.Map({
            container: 'map1',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [lg, lt], // starting position
            zoom: 12 // starting zoom
        });
        mapa.addControl(new mapboxgl.NavigationControl(),'top-left');
        mapa.addControl(new mapboxgl.FullscreenControl(),'top-left');
        k=new MapboxDirections({
            accessToken: mapboxgl.accessToken,
            profile: 'mapbox/driving',
            controls: {
                inputs: true,
                instructions: true,
                profileSwitcher: true
            }
            });
        k.setOrigin([lg,lt]);
        mapa.addControl(k,'top-right');
        mymarker(mapa, lt, lg);
        markermaker(lt, lg);
    }


    function mymarker(mapa, lt, lg) {
      var size = 100;
      // implementation of CustomLayerInterface to draw a pulsing dot icon on the map
      // see https://docs.mapbox.com/mapbox-gl-js/api/#customlayerinterface for more info
      var pulsingDot = {
        width: size,
        height: size,
        data: new Uint8Array(size * size * 4),

        // get rendering context for the map canvas when layer is added to the map
        onAdd: function() {
          var canvas = document.createElement('canvas');
          canvas.width = this.width;
          canvas.height = this.height;
          this.context = canvas.getContext('2d');
        },

        // called once before every frame where the icon will be used
        render: function() {
          var duration = 2000;
          var t = (performance.now() % duration) / duration;

          var radius = (size / 2) * 0.3;
          var outerRadius = (size / 2) * 0.7 * t + radius;
          var context = this.context;

          // draw outer circle
          context.clearRect(0, 0, this.width, this.height);
          context.beginPath();
          context.arc(
            this.width / 2,
            this.height / 2,
            outerRadius,
            0,
            Math.PI * 2
          );
          context.fillStyle = 'rgba(77, 104, 255,' + (1 - t) + ')';
          context.fill();

          // draw inner circle
          context.beginPath();
          context.arc(
            this.width / 2,
            this.height / 2,
            radius,
            0,
            Math.PI * 2
          );
          context.fillStyle = 'rgba(77, 104, 255, 1)';
          context.strokeStyle = 'white';
          context.lineWidth = 2 + 4 * (1 - t);
          context.fill();
          context.stroke();

          // update this image's data with data from the canvas
          this.data = context.getImageData(
            0,
            0,
            this.width,
            this.height
          ).data;

          // continuously repaint the map, resulting in the smooth animation of the dot
          mapa.triggerRepaint();

          // return `true` to let the map know that the image was updated
          return true;
        }
      };

      mapa.on('load', function() {
        buttoncreator();toggledirn();
        mapa.addImage('pulsing-dot', pulsingDot, {
          pixelRatio: 2
        });

        mapa.addSource('points', {
          'type': 'geojson',
          'data': {
            'type': 'FeatureCollection',
            'features': [{
              'type': 'Feature',
              'geometry': {
                'type': 'Point',
                'coordinates': [lg, lt]
              }
            }]
          }
        });
        mapa.addLayer({
          'id': 'points',
          'type': 'symbol',
          'source': 'points',
          'layout': {
            'icon-image': 'pulsing-dot'
          }
        });
      });
    }

    var main_url = 'https://places.ls.hereapi.com/places/v1/discover/explore?in=',
      ending = '%3Br%3D17768&cat=hospital-health-care-facility&size=50&apiKey=yqGj9Hvx5Gvgqp-g9Eg37Z-sSIHEMwZgbzcWYOnxzxM';

    var lat, lon;

    function markermaker(lt, lg) {
      lat = lt;
      lon = lg;
      latlang = lt + '%2C' + lg;
      url = main_url + latlang + ending;
      fetch(url, {
        method: 'GET'
      }).then(function(response) {
        if (response.ok) {
          return response.json();
        }
        return Promise.reject(response);
      }).then(function(data) {
        markerplacer(data);
      });
    }
    
    function recenter(e) {
      mapa.flyTo({
        center: [lon, lat],
        zoom: 13,
        speed: 2,
        curve: 1,
        easing(t) {
          return t;
        }
      });
    }


    function test(a, b) {
      mapa.flyTo({
        center: [a, b],
        zoom: 13,
        speed: 2,
        curve: 1,
        easing(t) {
          return t;
        }
      });
      k.setDestination([a,b]);
    }

    function markerplacer(data) {


      opt = {
        color: "rgba(255,100,100)",
      };

      var tableTopFive

      for (var i = 0; i < data.results.items.length; i++) {
        var marker = new mapboxgl.Marker(opt)
          .setLngLat([data.results.items[i].position[1], data.results.items[i].position[0]])
          .setPopup(new mapboxgl.Popup().setHTML(data.results.items[i].title + "<br>" + data.results.items[i].vicinity))
          .addTo(mapa);

        var tabcontent = "<tr class='clickable-row' onclick='test("+data.results.items[i].position[1]+","+data.results.items[i].position[0]+")'></td><td>" + (i + 1) + "</td><td>" + data.results.items[i].title +"</td><td>" + (data.results.items[i].distance / 1000) + "</td><td>" + data.results.items[i].vicinity  + "</td></tr>";
        document.querySelector("#hospitaltablebody").innerHTML += tabcontent;
        if(i<5) tableTopFive+=tabcontent
      }
    }

     function toggledirn(){
            var poip=document.getElementsByClassName("mapboxgl-ctrl-directions");
            for(i of poip){
                if(i.style.visibility=="hidden")i.style.visibility="visible";
                else i.style.visibility="hidden";
            }
        }
    function buttoncreator(){
        var kool=document.getElementsByClassName("mapboxgl-ctrl-bottom-left");
        var temp=kool[0].innerHTML;
        kool[0].innerHTML=`<div class="mapboxgl-ctrl mapboxgl-ctrl-group">
            <button class="mapboxgl-ctrl-cb1" onclick="recenter()" type="button" aria-label="Recentre" title="Recenter"><span class="fa fa-crosshairs"></span></button>
            <button class="mapboxgl-ctrl-cb2" onclick="toggledirn()" type="button" aria-label="Directions" title="Toggle Direction Controls"><span class="fa fa-share"></span></button>
        </div>`;
        kool[0].innerHTML+=temp;
    }

    module.exports = tableTopFive