// ==UserScript==
// @name            Steam mass ignore
// @description     massively ignore games, DLC, items on Steam
// @version         0.2.0
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


    async function ignore_appid(appid) {
        var payload = "sessionid=" + sessionid
                    + "&appid=" + appid
                    + "&remove=0";

        var request = new XMLHttpRequest();
        request.open("POST", api_url, true);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.send(payload);
    }


    async function loop_ignore (event, class_name) {
        console.log(">>> loop_ignore()");
        var rows = document.getElementsByClassName(class_name);
        var button = document.getElementById("ignore_all_dlc_button");
        console.log("- working on " + rows.length + " elements");

        for (var i = 0; i < rows.length; i++) {
            var appid = rows[i].attributes["data-ds-appid"];
            var ignored = rows[i].classList.contains("ds_ignored");

            if (appid && !ignored) {
                appid = appid.nodeValue;
                console.log("- ignoring appid:" + appid);
                button.innerHTML = "Ignore all" + ".".repeat(1 + i % 3);
                ignore_appid(appid);
                await sleep(100);
            }
        }

        button.innerHTML = "Ignore all: done";
    }


    async function ignore_all_dlc (event) {
        console.log(">>> ignore_all_dlc()");
        loop_ignore(event, "game_area_dlc_row");
    }


    async function ignore_in_bundle_sub (event) {
        console.log(">>> ignore_in_bundle_sub()");
        loop_ignore(event, "tablet_list_item");
    }


    async function ignore_in_search_result (event) {
        console.log(">>> ignore_in_search_result()");
        loop_ignore(event, "search_result_row");
    }


    async function ignore_in_curator_page (event) {
        console.log(">>> ignore_in_curator_page()");
        loop_ignore(event, "store_capsule");
    }


    // initialize
    var sessionid = get_cookie("sessionid");

    // create [ignore] button
    var ignore_button = document.createElement("a");
    ignore_button.id = "ignore_all_dlc_button";
    ignore_button.appendChild(document.createTextNode("Ignore all"));

    var ignore_span = document.createElement("span");
    ignore_span.className = "note";
    ignore_span.appendChild(ignore_button);

    // app page: install the button at the top of the DLC section
    var dlc_section = document.getElementById("gameAreaDLCSection");
    if (dlc_section) {
        var dlc_section_head = dlc_section.firstElementChild;
        dlc_section_head.append(ignore_span);
        ignore_button.addEventListener("click", ignore_all_dlc);
    }

    // bundle/sub pages: install the button on the side
    var package_header_container = document.getElementById("package_header_container");
    if (package_header_container) {
        var header = (document.getElementsByClassName("no_margin"))[0];
        header.append(ignore_span);
        ignore_button.addEventListener("click", ignore_in_bundle_sub);
    }

    // search result page: install the button on the side
    var search_form = document.getElementById("advsearchform");
    if (search_form) {
        search_form.append(ignore_span);
        search_form.firstElementChild.before(ignore_span);
        ignore_button.addEventListener("click", ignore_in_search_result);
        ignore_span.style.position = "fixed";
        ignore_span.style.left = "2%";
        ignore_span.style.border = "solid 1px #eee";
        ignore_span.style.padding = "5px";
    }

    // curator/developer/publisher pages: install the button on the side
    var recommandations_table = document.getElementById("RecommendationsTable");
    if (recommandations_table) {
        recommandations_table.append(ignore_span);
        recommandations_table.firstElementChild.before(ignore_span);
        ignore_button.addEventListener("click", ignore_in_curator_page);
        ignore_span.style.position = "fixed";  // doesn't work as expected
        ignore_span.style.left = "2%";
        ignore_span.style.border = "solid 1px #eee";
        ignore_span.style.padding = "5px";
    }
})();
