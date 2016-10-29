'use strict';

var data = {
    lights: [
        {id: 1, name: 'Über der Bar links', r:255, g:0, b:0, left: 278, top:206},
        {id: 2, name: 'Über der Bar rechts', r:255, g:0, b:0, left: 393, top:206},
    ],
    selected_color: {
        r:255, 
        g:0, 
        b:0
    }
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

var bus = new Vue();


Vue.component('c-base-map', {
    props: ['lights'],
    template: '<div class="c-base-map"><dmx-light v-for="light in lights" v-bind:light="light"></dmx-light></div>'
});

Vue.component('dmx-light', {
    props: ['light'],
    template: '#dmx-light-template',
    methods: {
        clickMe: function () {
            bus.$emit('lightchange', [this.light.id]);
        }
    }
});

Vue.component('color-bar', {
    props: ['selected_color'],
    template: '#color-bar-template',
    computed: {
        // a computed getter
        color_string: function () {
          // `this` points to the vm instance
            var ret = rgbToHex(this.selected_color.r, this.selected_color.g, this.selected_color.b);
            return ret
        }
    },
    methods: {
        colorChanged(ev) {
            var value = $(ev.target).val();
            var r = parseInt(value.slice(1,3), 16);
            var g = parseInt(value.slice(3,5), 16);
            var b = parseInt(value.slice(5,7), 16);
            bus.$emit('colorchange', [{r:r, g:g, b:b}]);
        }
    }
     
});

Vue.component('color-button', {
    props: ['r', 'g', 'b'],
    template: '#color-button-template',
    methods: {
        reverseMessage: function (event) {
            bus.$emit('colorchange', [{r:this.r, g:this.g, b:this.b}]);
        }
    }
});


var app = new Vue({
    el: '#app',
    data: {
        lights: [
            {id: 1, name: 'Über der Bar links', r:255, g:0, b:0, left: 278, top:206},
            {id: 2, name: 'Über der Bar rechts', r:255, g:0, b:0, left: 393, top:206},
        ],
        selected_color: { r:255, g:0, b:0 }
    },
    created: function () {
        bus.$on('colorchange', function (ev) {
            var color = ev[0];
            this.selected_color = color;
        }.bind(this));
        
        bus.$on('lightchange', function (ev) {
            var light_id = ev[0];
            for (var i = 0; i < this.lights.length; i++) {
                if (this.lights[i].id == light_id) {
                    this.lights[i].r = this.selected_color.r;
                    this.lights[i].g = this.selected_color.g;
                    this.lights[i].b = this.selected_color.b;
                }
            }
        }.bind(this));
    }
});

