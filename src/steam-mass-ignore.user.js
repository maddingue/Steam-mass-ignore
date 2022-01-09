// ==UserScript==
// @name            Steam mass ignore
// @description     ignore all DLC of a game
// @version         0.1.0
// @author          Sébastien Aperghis-Tramoni
// @copyright       2022 Sébastien Aperghis-Tramoni
// @license         MIT
// @match           https://store.steampowered.com/*
// @grant           GM_cookies
// ==/UserScript==

(function() {
    'use strict';

    const api_url = "https://store.steampowered.com/recommended/ignorerecommendation/";
    var sessionid;


    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    function get_cookie(name) {
        // adapted from https://github.com/js-cookie/js-cookie/blob/main/src/api.mjs
        var cookies = document.cookie ? document.cookie.split('; ') : [];
        var jar = {};

        for (var i = 0; i < cookies.length; i++) {
            var parts = cookies[i].split('=');
            jar[decodeURIComponent(parts[0])] = parts.slice(1).join('=');
        }

        return name ? jar[name] : jar
    }


    function ignore_appid(appid) {
        var payload = "sessionid=" + sessionid
                    + "&appid=" + appid
                    + "&remove=0";

        var request = new XMLHttpRequest();
        request.open("POST", api_url, true);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.send(payload);
    }


    async function find_and_ignore_all_dlc (event) {
        console.log(">>> find_and_ignore_all_dlc()");
        var rows = document.getElementsByClassName("game_area_dlc_row");

        for (var i = 0; i < rows.length; i++) {
            var appid = (rows[i].attributes["data-ds-appid"].nodeValue);
            var btn = rows[i].children[4];
            console.log("- ignoring appid:" + appid);
            ignore_appid(appid);
            await sleep(100);
        }

        var button = document.getElementById("ignore_all_dlc_button");
        button.innerHTML = "Ignore all DLC: done";
    }


    // initialize
    var sessionid = get_cookie("sessionid");

    // create [ignore all DLC] button
    var ignore_all_dlc_button = document.createElement("a");
    ignore_all_dlc_button.id = "ignore_all_dlc_button";
    ignore_all_dlc_button.addEventListener("click", find_and_ignore_all_dlc);
    ignore_all_dlc_button.appendChild(document.createTextNode("Ignore all DLC"));

    var ignore_all_dlc_span = document.createElement("span");
    ignore_all_dlc_span.className = "note";
    ignore_all_dlc_span.appendChild(ignore_all_dlc_button);

    // install the button at the top of the DLC section
    var dlc_section = document.getElementById("gameAreaDLCSection");
    if (dlc_section) {
        var dlc_section_head = dlc_section.firstElementChild;
        dlc_section_head.append(ignore_all_dlc_span);
    }
    
})();
