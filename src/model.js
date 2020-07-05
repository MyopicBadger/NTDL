import moment from "moment";
import Vue from 'vue'
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';
//import feather from 'feather-icons'
import { Trash2Icon, RotateCcwIcon } from 'vue-feather-icons'

var app = new Vue({
    components: {
        Trash2Icon, RotateCcwIcon
    },
    el: '#mainpage',
    data: {
        queue: [],

        newEntryValue: "",
    },
    methods: {
        loadSave: function (startDate) {
            var endpoint = './queue.json'
            var fetchConfig = { method: 'GET' }
            return fetch(endpoint, fetchConfig).then(
                (response) => {
                    if (response.status !== 200) {
                        console.log('Looks like there was a problem. Status Code: ' + response.status);
                        return;
                    }
                    response.json().then((data) => {
                        this.queue = data;
                    });
                }).catch(function (err) {
                    console.log('Fetch Error :-S', err);
                });
        },
        postNewValue: function () {
            console.log("Fired", this.newEntryValue)
            var endpoint = './newEntry'
            var fetchConfig = {
                method: 'POST', // or 'PUT'
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ date: moment().format("YYYY-MM-DD"), url: this.newEntryValue }),
            }
            fetch(endpoint, fetchConfig).then(
                (response) => {
                    if (response.status !== 200) {
                        console.log('Looks like there was a problem. Status Code: ' + response.status);
                        return;
                    }
                    this.newEntryValue = '';
                    this.loadSave()
                }).catch(function (err) {
                    console.log('Fetch Error :-S', err);
                });
        },
        removeComplete: function () {
            console.log("Fired", this.newEntryValue)
            var endpoint = './remAll'
            var fetchConfig = {
                method: 'POST', // or 'PUT'
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ date: moment().format("YYYY-MM-DD")}),
            }
            fetch(endpoint, fetchConfig).then(
                (response) => {
                    if (response.status !== 200) {
                        console.log('Looks like there was a problem. Status Code: ' + response.status);
                        return;
                    }
                    this.loadSave()
                }).catch(function (err) {
                    console.log('Fetch Error :-S', err);
                });
        },
        removeValue: function (entry) {
            console.log("Fired", this.newEntryValue)
            var endpoint = './remEntry'
            var fetchConfig = {
                method: 'POST', // or 'PUT'
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ date: moment().format("YYYY-MM-DD"), url: entry.url }),
            }
            fetch(endpoint, fetchConfig).then(
                (response) => {
                    if (response.status !== 200) {
                        console.log('Looks like there was a problem. Status Code: ' + response.status);
                        return;
                    }
                    this.loadSave()
                }).catch(function (err) {
                    console.log('Fetch Error :-S', err);
                });
        },
        retryDownload: function (entry) {
            console.log("Fired", this.newEntryValue)
            var endpoint = './retryEntry'
            var fetchConfig = {
                method: 'POST', // or 'PUT'
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ date: moment().format("YYYY-MM-DD"), url: entry.url }),
            }
            fetch(endpoint, fetchConfig).then(
                (response) => {
                    if (response.status !== 200) {
                        console.log('Looks like there was a problem. Status Code: ' + response.status);
                        return;
                    }
                    this.loadSave()
                }).catch(function (err) {
                    console.log('Fetch Error :-S', err);
                });
        },
        pollForUpdate: function () {
            this.loadSave();
            setTimeout(this.pollForUpdate, 1000)
        }
    },
    mounted: function () {
        //feather.replace();
        //this.loadSave();
        this.pollForUpdate();
    }
});