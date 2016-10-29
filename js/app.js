'use strict';

Vue.component('dmx-light', {
    props: ['light'],
    template: '<div class="spot" v-bind:style="{ \
        \'left\': light.left + \'px\', \
        \'top\': light.top + \'px\', \
        \'background-color\': \'rgb(\' + light.r + \',\' + light.g + \',\'  + light.b + \')\' \
        }" v-bind:title="light.name"></div>'
});

Vue.component('c-base-map', {
    props: ['lights'],
    template: '<div id="main"><dmx-light v-for="light in lights" v-bind:light="light"></dmx-light></div>'
});

var app = new Vue({
    el: '#app',
    data: {
        message: 'Hello Vue!',
        lights: [
            {name: 'Über der Bar links', r:255, g:0, b:0, left: 278, top:206},
            {name: 'Über der Bar rechts', r:255, g:0, b:0, left: 393, top:206},
        ]
    }
})
