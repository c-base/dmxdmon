'use strict';

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

var bus = new Vue();


Vue.component('fader', {
    props: ['caption', 'value'],
    template: '#fader-template',
    methods: {
        onChange: function (ev) {
            this.$emit('faderchange', ev.target.value)
        },
        onOff: function (ev) {
            var vm = this;
            function animate (time) {
                requestAnimationFrame(animate);
                TWEEN.update(time);
            }
            new TWEEN.Tween({ tweeningNumber: vm.value })
                .easing(TWEEN.Easing.Exponential.Out)
                .to({ tweeningNumber: 0 }, 500)
                .onUpdate(function () {
                    vm.$emit('faderchange', this.tweeningNumber.toFixed(0));
                }).start();
            animate();
        }
    }
});

Vue.component('c-base-map', {
    props: ['lights', 'master'],
    template: '<div class="c-base-map"><dmx-light v-for="light in lights" v-bind:light="light" v-bind:master="master"></dmx-light></div>'
});

Vue.component('dmx-light', {
    props: ['light', 'master'],
    template: '#dmx-light-template',
    computed: {
        computed_color: function () {
            var rgb = tinycolor(this.light.color).toRgb();
            var bla = this.master / 255;
            var computed = {
                r: rgb.r * bla,
                g: rgb.g * bla,
                b: rgb.b * bla
            }
            return tinycolor(computed).toHexString();
        }
    },
    methods: {
        clickMe: function () {
            bus.$emit('lightchange', [this.light.id]);
        }
    }
});

Vue.component('color-bar', {
    props: ['selected_color', 'color_palette'],
    template: '#color-bar-template',
    computed: {
        // a computed getter
        //color_string: function () {
        // `this` points to the vm instance
        //    var ret = rgbToHex(this.selected_color.r, this.selected_color.g, this.selected_color.b);
        //    return ret
        //}
        //var r = parseInt(value.slice(1,3), 16);
        //var g = parseInt(value.slice(3,5), 16);
        //var b = parseInt(value.slice(5,7), 16);
    },
    methods: {
        colorChanged(ev) {
            var value = $(ev.target).val();
            console.log("color" + value);
            bus.$emit('colorchange', [{color: value}]);
        }
    }
     
});

Vue.component('color-button', {
    props: ['color'],
    template: '#color-button-template',
    methods: {
        reverseMessage: function (event) {
            bus.$emit('colorchange', [{color: this.color}]);
        }
    }
});


var app = new Vue({
    el: '#app',
    data: {
        lights: [
            {id: 1, name: 'Über der Bar links', color:'#ff00ff', left: 278, top:206},
            {id: 2, name: 'Über der Bar rechts', color:'#ff00ff', left: 393, top:206},
        ],
        selected_color: '#ff00ff',
        color_palette: [
            '#000000', '#ffffff',
            '#34A900', '#A30000',
            '#A30DAE', '#A55400',
            '#AAAAAA', '#555555',
            '#5559FF', '#72FE3E',
            '#72FFFF', '#F65450',
        ],
        master: 255
    },
    methods: {
        masterChanged: function (ev) {
            this.master = ev;
        }
    },
    created: function () {
        
        bus.$on('colorchange', function (ev) {
            var c = ev[0].color;
            this.selected_color = c;
        }.bind(this));
        
        bus.$on('lightchange', function (ev) {
            var light_id = ev[0];
            for (var i = 0; i < this.lights.length; i++) {
                if (this.lights[i].id == light_id) {
                    this.lights[i].color = this.selected_color;
                }
            }
        }.bind(this));
    }
    
});

