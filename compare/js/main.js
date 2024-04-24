const filePath = "./../database.json";
const fileImgPath = "./../imgPaths.json";
const ammoTypeGridStyle = `width: 100%;

`

var database;
var item_html;
var item1_type = "", item1_name, item1_data;
var item2_type = "", item2_name, item2_data;
var database_loaded = false, img_database_loaded = false;

$("#search_results_1").hide();
$("#search_results_2").hide();

function fetchJSONFile(path, callback) { // thx ChatGPT
    fetch(path)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            callback(null, data);
        })
        .catch(error => {
            callback(error, null);
        });
}


$(document).ready(function() {
    item_html = $(".item_container").html();
    $("#item_container").hide();
    console.log(item_html);

    fetchJSONFile(filePath, (error, data) => {
        if (error) {
            console.error('Error reading JSON file:', error);
            return;
        } else {
            console.log('JSON file content:', data);
            
            database = data;

            console.log(database.hulls["TKS"]);

            database_loaded = true;

            if (database_loaded & img_database_loaded) whenDatabasesLoaded();
        }
    });

    fetchJSONFile(fileImgPath, (error, data) => {
        if (error) {
            console.error('Error reading JSON file:', error);
            return;
        } else {
            console.log('JSON file content:', data);
            
            img_database = data;

            console.log(data.hulls["TKS"]);

            img_database_loaded = true;

            if (database_loaded & img_database_loaded) whenDatabasesLoaded();
        }
    });

    $('#search_input_1').bind('input', function (e) {
        $("#search_results_1").show();
        item1_type = "";
        var search_for = $('#search_input_1').val().toLowerCase().replace("-", "").replace(" ", "");
        var greek_search_for = replaceGreekNumerals($('#search_input_1').val()).toLowerCase().replace("-", "").replace(" ", "");
        
        str = ""

        if (item2_type == "hulls" | item2_type == "") {
            count = 10;
            for (let key of Object.keys(database.hulls)) {
                var greek_search_key = replaceGreekNumerals(key).toLowerCase().replace("-", "").replace(" ", "")
                var orig_search_key = key.toLowerCase().replace("-", "").replace(" ", "")

                if (orig_search_key.includes(search_for) | greek_search_key.includes(greek_search_for)) {
                    str += `<tr class="search_result_item-1" data-item="${key}" data-type="hulls"><td>Hull: &nbsp;&nbsp;${key}</td></tr>`
                    count--;
                }

                if (count <= 0) { break; }
            }
        }

        if (item2_type == "turrets" | item2_type == "") {
            count = 10;
            for (let key of Object.keys(database.turrets)) {
                var greek_search_key = replaceGreekNumerals(key).toLowerCase().replace("-", "").replace(" ", "")
                var orig_search_key = key.toLowerCase().replace("-", "").replace(" ", "")

                if (orig_search_key.includes(search_for) | greek_search_key.includes(greek_search_for)) {
                    str += `<tr class="search_result_item-1" data-item="${key}" data-type="turrets"><td>Turret: ${key}</td></tr>`
                    count--;
                }

                if (count <= 0) { break; }
            }
        }

        if (item2_type == "guns" | item2_type == "") {
            count = 10;
            for (let key of Object.keys(database.guns)) {
                var greek_search_key = replaceGreekNumerals(key).toLowerCase().replace("-", "").replace(" ", "")
                var orig_search_key = key.toLowerCase().replace("-", "").replace(" ", "")

                if (orig_search_key.includes(search_for) | greek_search_key.includes(greek_search_for)) {
                    str += `<tr class="search_result_item-1" data-item="${key}" data-type="guns"><td>Gun: &nbsp;&nbsp;&nbsp;${key}</td></tr>`
                    count--;
                }

                if (count <= 0) { break; }
            }
        }

        $('#search_results_1').html(str);
    });

    $('#search_input_2').bind('input', function (e) {
        $("#search_results_2").show();
        item2_type = "";
        var search_for = $('#search_input_2').val().toLowerCase().replace("-", "").replace(" ", "");
        var greek_search_for = replaceGreekNumerals($('#search_input_2').val()).toLowerCase().replace("-", "").replace(" ", "");
        
        str = ""

        if (item1_type == "hulls" | item1_type == "") {
            count = 10;
            for (let key of Object.keys(database.hulls)) {
                var greek_search_key = replaceGreekNumerals(key).toLowerCase().replace("-", "").replace(" ", "")
                var orig_search_key = key.toLowerCase().replace("-", "").replace(" ", "")

                if (orig_search_key.includes(search_for) | greek_search_key.includes(greek_search_for)) {
                    str += `<tr class="search_result_item-2" data-item="${key}" data-type="hulls"><td>Hull: &nbsp;&nbsp;${key}</td></tr>`
                    count--;
                }

                if (count <= 0) { break; }
            }
        }

        if (item1_type == "turrets" | item1_type == "") {
            count = 10;
            for (let key of Object.keys(database.turrets)) {
                var greek_search_key = replaceGreekNumerals(key).toLowerCase().replace("-", "").replace(" ", "")
                var orig_search_key = key.toLowerCase().replace("-", "").replace(" ", "")

                if (orig_search_key.includes(search_for) | greek_search_key.includes(greek_search_for)) {
                    str += `<tr class="search_result_item-2" data-item="${key}" data-type="turrets"><td>Turret: ${key}</td></tr>`
                    count--;
                }

                if (count <= 0) { break; }
            }
        }

        if (item1_type == "guns" | item1_type == "") {
            count = 10;
            for (let key of Object.keys(database.guns)) {
                var greek_search_key = replaceGreekNumerals(key).toLowerCase().replace("-", "").replace(" ", "")
                var orig_search_key = key.toLowerCase().replace("-", "").replace(" ", "")

                if (orig_search_key.includes(search_for) | greek_search_key.includes(greek_search_for)) {
                    str += `<tr class="search_result_item-2" data-item="${key}" data-type="guns"><td>Gun: &nbsp;&nbsp;&nbsp;${key}</td></tr>`
                    count--;
                }

                if (count <= 0) { break; }
            }
        }

        $('#search_results_2').html(str);
    });

    $(document).on('click', '.search_result_item-1', function() {
        $("#search_results_1").hide();
        var hull = $(this).data("item");
        var data = database[$(this).data("type")][hull]
        item1_type = $(this).data("type");
        item1_name = hull;
        item1_data = data;
        console.log(hull);
        $('#search_input_1').val(hull);

        if (item1_type != item2_type) return;

        createCompareList();
    }); 

    $(document).on('click', '.search_result_item-2', function() {
        $("#search_results_2").hide();
        var hull = $(this).data("item");
        var data = database[$(this).data("type")][hull]
        item2_type = $(this).data("type");
        item2_name = hull;
        item2_data = data;
        console.log(hull);
        $('#search_input_2').val(hull);

        if (item1_type != item2_type) return;

        createCompareList();
    });

    $(document).on('click', function(event) {
        if (!$(event.target).closest('.search_result_item-2').length) {
            if ($("#search_results_2").is(':visible')) {
                $("#search_results_2").hide();
            }
        }

        if (!$(event.target).closest('.search_result_item-1').length) {
            if ($("#search_results_1").is(':visible')) {
                $("#search_results_1").hide();
            }
        }
    });

    $('#item_img1').on('load', function() {
        $("#item_img_container1").text("")
        $('#item_img1').css('display', 'inline-block');
        console.log('loaded');
    })

    $('#item_img2').on('load', function() {
        $("#item_img_container2").text("")
        $('#item_img2').css('display', 'inline-block');
        console.log('loaded');
    })
});

function whenDatabasesLoaded() {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get("type") != undefined && urlParams.get("name1") != undefined && urlParams.get("name2") != undefined) {
        $("#search_results_1").hide();
        var hull = urlParams.get("name1");
        var data = database[urlParams.get("type")][hull]
        item1_type = urlParams.get("type");
        item1_name = hull;
        item1_data = data;
        console.log(hull);
        $('#search_input_1').val(hull);

        $("#search_results_2").hide();
        var hull = urlParams.get("name2");
        var data = database[urlParams.get("type")][hull]
        item2_type = urlParams.get("type");
        item2_name = hull;
        item2_data = data;
        console.log(hull);
        $('#search_input_2').val(hull);

        createCompareList();
    }
}

function createCompareList() {
    $("#item_img_container1").text("Image loading...");
    document.getElementById('item_img1').onerror = function(event) {
        $("#item_img_container1").text("No img, sorry Т_Т");
    };
    $("#item_img1").attr('src', "./."+img_database[item1_type][item1_name]);
    $('#item_img1').css('display', 'none');

    $("#item_img_container2").text("Image loading...");
    document.getElementById('item_img2').onerror = function(event) {
        $("#item_img_container2").text("No img, sorry Т_Т");
    };
    $("#item_img2").attr('src', "./."+img_database[item2_type][item2_name]);
    $('#item_img2').css('display', 'none');

    window.history.pushState("", "why this shit is here", `${window.location.pathname}?type=${item1_type}&name1=${item1_name}&name2=${item2_name}`);
    
    $("#name").text(item1_name + " vs " + item2_name);
    $("#description1").text(item1_data.description);  $("#description2").text(item2_data.description);
    $("#tier1").text(item1_data.tier);                $("#tier2").text(item2_data.tier);
    $("#rarity1").text(item1_data.rarity);            $("#rarity2").text(item2_data.rarity);
    $("#obtain1").text(item1_data.obtain);            $("#obtain2").text(item2_data.obtain);

    if (item1_data.resources.length == 0) {
        $("#resources1").closest('tr').hide();
    } else {
        $("#resources1").closest('tr').show();

        str = ""
        for (let key of Object.keys(item1_data.resources)) {
            str += `${key}: ${item1_data.resources[key]}<br>`;
        }
        $("#resources1").html(str);
    }

    if (item2_data.resources.length == 0) {
        $("#resources2").closest('tr').hide();
    } else {
        $("#resources2").closest('tr').show();

        str = ""
        for (let key of Object.keys(item2_data.resources)) {
            str += `${key}: ${item2_data.resources[key]}<br>`;
        }
        $("#resources2").html(str);
    }

    $("#weight1").text(item1_data.stats.weight+"t");
    $("#based_on1").text(item1_data.based_on);

    $("#weight2").text(item2_data.stats.weight+"t").attr("style", `color: ${redOrGreen(item2_data.stats.weight,item1_data.stats.weight)};`);
    $("#based_on2").text(item2_data.based_on);

    $("#stats").html(calculateStringFor2Items(item1_data, item2_data, item1_type));

    count = 1
    for (let key of Object.keys(item1_data.paired)) {
        var names = extractWeaponNames(item1_data.paired[key]);
        var html_paired = "";

        console.log("Paired & extracted: "+item1_data.paired[key]+" | "+names);

        for (let index = 0; index < names.length; index++) {
            const element = names[index];
            
            element_format = element.split('[')[0];

            html_paired += `<a href="${window.location.origin+window.location.pathname+"../"}?type=${key+'s'}&name=${element_format}">${element_format}</a> ${index+1 != names.length ? "|" : ""} `;
        }

        $(`#paired_${count}1`).html(html_paired);
        switch (key) {
            case "hull":
                $(`#paired_${count}_text`).text("Hull");
                break;
            case "turret":
                $(`#paired_${count}_text`).text("Turret");
                break;
            case "gun":
                $(`#paired_${count}_text`).text("Gun");
                break;
            default:
                console.log(key);
                break;
        }
        count++;
    }

    count = 1
    for (let key of Object.keys(item2_data.paired)) {
        var names = extractWeaponNames(item2_data.paired[key]);
        var html_paired = "";

        console.log("Paired & extracted: "+item2_data.paired[key]+" | "+names);

        for (let index = 0; index < names.length; index++) {
            const element = names[index];
            
            element_format = element.split('[')[0];
            
            console.log(window.location.origin+window.location.pathname+"../");
            html_paired += `<a href="${window.location.origin+window.location.pathname+"../"}?type=${key+'s'}&name=${element_format}">${element_format}</a> ${index+1 != names.length ? "|" : ""} `;
        }

        $(`#paired_${count}2`).html(html_paired);
        count++;
    }


    $("#item_container").show();
}

function redOrGreen(num1, num2) {
    if (num1 > num2) {
        return "red";
    } else if (num1 < num2) {
        return "lime";
    } else {
        return "white";
    }
}

function calculateStringFor2Items(data1, data2, type) {
    stats_str = ""
    switch (type) {
        case "hulls":
            var aps, hull_aim, blowout, gun;
            var aps2, hull_aim2, blowout2;

            switch (data1.stats.weaponry.blowout) {
                case -1:
                    blowout = "None";
                    break;
                case 0:
                    blowout = "Partial";
                    break;
                case 1:
                    blowout = "Yes";
                    break;
                default:
                    blowout = "None";
                    break;
            }

            switch (data2.stats.weaponry.blowout) {
                case -1:
                    blowout2 = "None";
                    break;
                case 0:
                    blowout2 = "Partial";
                    break;
                case 1:
                    blowout2 = "Yes";
                    break;
                default:
                    blowout2 = "None";
                    break;
            }

            switch (data1.stats.weaponry.hull_aim) {
                case 0:
                    hull_aim = "No";
                    break;
                case 1:
                    hull_aim = "Suspension only";
                    break;
                case 2:
                    hull_aim = "Yes";
                    break;
                default:
                    hull_aim = "No";
                    break;
            }

            switch (data2.stats.weaponry.hull_aim) {
                case 0:
                    hull_aim2 = "No";
                    break;
                case 1:
                    hull_aim2 = "Suspension only";
                    break;
                case 2:
                    hull_aim2 = "Yes";
                    break;
                default:
                    hull_aim2 = "No";
                    break;
            }

            if (data1.stats.weaponry.aps) { aps = "Yes"; }
            else { aps = "No"; }

            if (data2.stats.weaponry.aps) { aps2 = "Yes"; }
            else { aps2 = "No"; }

            gun = ""
            if (data1.stats.weaponry.have_gun & data2.stats.weaponry.have_gun) {
                reload_multiplier_caliber1 = data1.stats.weaponry.gun.reload_multiplier_caliber;
                if (data1.stats.weaponry.gun.reload_multiplier_caliber == 0) {
                    reload_multiplier_caliber1 = Math.round(calculateCaliberFromMultiplier(data1.stats.weaponry.gun.reload_multiplier));
                }

                reload_multiplier_caliber2 = data2.stats.weaponry.gun.reload_multiplier_caliber;
                if (data2.stats.weaponry.gun.reload_multiplier_caliber == 0) {
                    reload_multiplier_caliber2 = Math.round(calculateCaliberFromMultiplier(data2.stats.weaponry.gun.reload_multiplier));
                }


                gun = `
                <tr><th colspan="3" class="stat_header">Gun Mount</th></tr>
                <tr><th>Reload Multiplier</th><td>${data1.stats.weaponry.gun.reload_multiplier} (${reload_multiplier_caliber1}mm)</td>
                    <td style="color: ${redOrGreen(data1.stats.weaponry.gun.reload_multiplier,data2.stats.weaponry.gun.reload_multiplier)};">${data2.stats.weaponry.gun.reload_multiplier} (${reload_multiplier_caliber2}mm)</td></tr>
                <tr><th colspan="3" class="stat_header">Gun Limits</th></tr>
                <tr><th>Up</th><td>${data1.stats.weaponry.gun.limits.up}</td>
                    <td style="color: ${redOrGreen(data1.stats.weaponry.gun.limits.up,data2.stats.weaponry.gun.limits.up)};">${data2.stats.weaponry.gun.limits.up}</td></tr>
                <tr><th>Down</th><td>-${data1.stats.weaponry.gun.limits.down}</td>
                    <td style="color: ${redOrGreen(data1.stats.weaponry.gun.limits.down,data2.stats.weaponry.gun.limits.down)};">-${data2.stats.weaponry.gun.limits.down}</td></tr>
                <tr><th>Left</th><td>${data1.stats.weaponry.gun.limits.left}</td>
                    <td style="color: ${redOrGreen(data1.stats.weaponry.gun.limits.left,data2.stats.weaponry.gun.limits.left)};">${data2.stats.weaponry.gun.limits.left}</td></tr>
                <tr><th>Right</th><td>${data1.stats.weaponry.gun.limits.right}</td>
                    <td style="color: ${redOrGreen(data1.stats.weaponry.gun.limits.right,data2.stats.weaponry.gun.limits.right)};">${data2.stats.weaponry.gun.limits.right}</td></tr>
                `;
            }

            crew1 = getCrewNumber(data1.stats.crew);
            crew_str1 = ""
            for (var key of Object.keys(crew1)) {
                if (crew1[key] != 0) {
                    crew_str1 += `${key} x${crew1[key]}<br>`
                }
            }

            crew2 = getCrewNumber(data2.stats.crew);
            crew_str2 = ""
            for (var key of Object.keys(crew2)) {
                if (crew2[key] != 0) {
                    crew_str2 += `<p style="color: ${redOrGreen(crew1[key], crew2[key])};">${key} x${crew2[key]}<p>`
                }
            }

            stats_str += `
            <table>
            <tr><th colspan="3" class="stat_header">Armor</th></tr>
            <tr><th>Front</th><td>${data1.stats.armor.front}mm</td>
                <td style="color: ${redOrGreen(data1.stats.armor.front,data2.stats.armor.front)};">${data2.stats.armor.front}mm</td></tr>
            <tr><th>Back</th><td>${data1.stats.armor.back}mm</td>
                <td style="color: ${redOrGreen(data1.stats.armor.back,data2.stats.armor.back)};">${data2.stats.armor.back}mm</td></tr>
            <tr><th>Side</th><td>${data1.stats.armor.side}mm</td>
                <td style="color: ${redOrGreen(data1.stats.armor.side,data2.stats.armor.side)};">${data2.stats.armor.side}mm</td></tr>
            <tr><th colspan="3" class="stat_header">Movement</th></tr>
            <tr><th>Acceleration</th><td>${data1.stats.speed.acceleration}</td>
                <td style="color: ${redOrGreen(data1.stats.speed.acceleration,data2.stats.speed.acceleration)};">${data2.stats.speed.acceleration}</td></tr>
            <tr><th>Max Forward</th><td>${data1.stats.speed.forward}km/h</td>
                <td style="color: ${redOrGreen(data1.stats.speed.forward,data2.stats.speed.forward)};">${data2.stats.speed.forward}km/h</td></tr>
            <tr><th>Max Backward</th><td>${data1.stats.speed.backward}km/h</td>
                <td style="color: ${redOrGreen(data2.stats.speed.backward,data1.stats.speed.backward)};">${data2.stats.speed.backward}km/h</td></tr>
            <tr><th>Torque</th><td>${data1.stats.speed.torque}k</td>
                <td style="color: ${redOrGreen(data1.stats.speed.torque,data2.stats.speed.torque)};">${data2.stats.speed.torque}k</td></tr>
            <tr><th>Traverse Rate</th><td>${data1.stats.speed.rate}</td>
                <td style="color: ${redOrGreen(data1.stats.speed.rate,data2.stats.speed.rate)};">${data2.stats.speed.rate}</td></tr>
            <tr><th colspan="3" class="stat_header">Weaponry</th></tr>
            <tr><th>Ammo Storage</th><td>${data1.stats.weaponry.ammo_storage}</td>
                <td style="color: ${redOrGreen(data1.stats.weaponry.ammo_storage,data2.stats.weaponry.ammo_storage)};">${data2.stats.weaponry.ammo_storage}</td></tr>
            <tr><th>Blowout</th><td>${blowout}</td>
                <td style="color: ${redOrGreen(data1.stats.weaponry.blowout,data2.stats.weaponry.blowout)};">${blowout2}</td></tr>
            <tr><th>Hull Aim</th><td>${hull_aim}</td>
                <td style="color: ${redOrGreen(data1.stats.weaponry.hull_aim == -1 ? 0 : data1.stats.weaponry.hull_aim,
                                               data2.stats.weaponry.hull_aim == -1 ? 0 : data2.stats.weaponry.hull_aim)};">${hull_aim2}</td></tr>
            <tr><th>APS</th><td>${aps}</td>
                <td style="color: ${redOrGreen(data1.stats.weaponry.aps,data2.stats.weaponry.aps)};">${aps2}</td></tr>
            <tr><th>Crew</th><td>${crew_str1}</td><td>${crew_str2}</td></tr>
            ${gun}
            </table>`
            break;
        case "turrets":
            var aps, blowout;
            var aps2, blowout2;

            switch (data1.stats.weaponry.blowout) {
                case -1:
                    blowout = "None";
                    break;
                case 0:
                    blowout = "Partial";
                    break;
                case 1:
                    blowout = "Yes";
                    break;
                default:
                    blowout = "None";
                    break;
            }

            switch (data2.stats.weaponry.blowout) {
                case -1:
                    blowout2 = "None";
                    break;
                case 0:
                    blowout2 = "Partial";
                    break;
                case 1:
                    blowout2 = "Yes";
                    break;
                default:
                    blowout2 = "None";
                    break;
            }

            if (data1.stats.weaponry.aps) { aps = "Yes"; }
            else { aps = "No"; }

            if (data1.stats.weaponry.fcs != -1) {
                fcs = `Up to ${data1.stats.weaponry.fcs}km`;
            } else { fcs = "No"; }

            if (data2.stats.weaponry.aps) { aps2 = "Yes"; }
            else { aps2 = "No"; }

            if (data2.stats.weaponry.fcs != -1) {
                fcs2 = `Up to ${data2.stats.weaponry.fcs}km`;
            } else { fcs2 = "No"; }

            stats_str += `
            <table>
            <tr><th colspan="3" class="stat_header">Armor</th></tr>
            <tr><th>Front</th><td>${data1.stats.armor.front}mm</td>
                <td style="color: ${redOrGreen(data1.stats.armor.front,data2.stats.armor.front)};">${data2.stats.armor.front}mm</td></tr>
            <tr><th>Back</th><td>${data1.stats.armor.back}mm</td>
                <td style="color: ${redOrGreen(data1.stats.armor.back,data2.stats.armor.back)};">${data2.stats.armor.back}mm</td></tr>
            <tr><th>Side</th><td>${data1.stats.armor.side}mm</td>
                <td style="color: ${redOrGreen(data1.stats.armor.side,data2.stats.armor.side)};">${data2.stats.armor.side}mm</td></tr>
            <tr><th colspan="3" class="stat_header">Movement</th></tr>
            <tr><th>Up Limit</th><td>${data1.stats.weaponry.gun.limits.up}</td>
                <td style="color: ${redOrGreen(data1.stats.weaponry.gun.limits.up,data2.stats.weaponry.gun.limits.up)};">${data2.stats.weaponry.gun.limits.up}</td></tr>
            <tr><th>Down Limit</th><td>-${data1.stats.weaponry.gun.limits.down}</td>
                <td style="color: ${redOrGreen(data1.stats.weaponry.gun.limits.down,data2.stats.weaponry.gun.limits.down)};">-${data2.stats.weaponry.gun.limits.down}</td></tr>
            <tr><th>Vertical Speed</th><td>${data1.stats.weaponry.gun.speed.vertical}</td>
                <td style="color: ${redOrGreen(data1.stats.weaponry.gun.speed.vertical,data2.stats.weaponry.gun.speed.vertical)};">${data2.stats.weaponry.gun.speed.vertical}</td></tr>
            <tr><th>Horizontal Speed</th><td>${data1.stats.weaponry.gun.speed.horizontal}</td>
                <td style="color: ${redOrGreen(data1.stats.weaponry.gun.speed.horizontal,data2.stats.weaponry.gun.speed.horizontal)};">${data2.stats.weaponry.gun.speed.horizontal}</td></tr>
            <tr><th colspan="3" class="stat_header">Weaponry</th></tr>
            <tr><th>Reload Multiplier</th><td>${data1.stats.weaponry.gun.reload_multiplier} (${Math.round(calculateCaliberFromMultiplier(data1.stats.weaponry.gun.reload_multiplier))}mm)</td>
                <td style="color: ${redOrGreen(data1.stats.weaponry.gun.reload_multiplier, data2.stats.weaponry.gun.reload_multiplier)};">${data2.stats.weaponry.gun.reload_multiplier} (${Math.round(calculateCaliberFromMultiplier(data2.stats.weaponry.gun.reload_multiplier))}mm)</td></tr>
            <tr><th>Ammo Storage</th><td>${data1.stats.weaponry.ammo_storage}</td>
                <td style="color: ${redOrGreen(data1.stats.weaponry.ammo_storage, data2.stats.weaponry.ammo_storage)};">${data2.stats.weaponry.ammo_storage}</td></tr>
            <tr><th>Stabilizer</th><td>${data1.stats.weaponry.stabilizer ? "Yes" : "No"}</td>
                <td style="color: ${redOrGreen(data1.stats.weaponry.stabilizer, data2.stats.weaponry.stabilizer)};">${data2.stats.weaponry.stabilizer ? "Yes" : "No"}</td></tr>
            <tr><th>APS</th><td>${aps}</td>
                <td style="color: ${redOrGreen(data1.stats.weaponry.aps, data2.stats.weaponry.aps)};">${aps2}</td></tr>
            <tr><th>FCS</th><td>${fcs}</td>
                <td style="color: ${redOrGreen(data1.stats.weaponry.fcs, data2.stats.weaponry.fcs)};">${fcs2}</td></tr>
            <tr><th>Blowout</th><td>${blowout}</td>
                <td style="color: ${redOrGreen(data1.stats.weaponry.blowout, data2.stats.weaponry.blowout)};">${blowout2}</td></tr>
            <tr><th>Crew</th><td>${data1.stats.crew.join(", ")}</td><td>${data2.stats.crew.join(", ")}</td></tr>
            </table>`
            break;
        case "guns":
            var ammos = "", ammos2 = "";

            var gun2_alreadyCheckedAmmos = [];
            var gun2_rows = [];

            data1.stats.weaponry.ammunition.forEach(element => {
                ammo_stats = "", ammo_stats2 = "";

                var foundElement = data2.stats.weaponry.ammunition.find(function(Felement) {
                    let one = Felement.type.split(" ")[0].replace("HEATFS", "HEAT");
                    let two = element.type.split(" ")[0].replace("HEATFS", "HEAT");

                    return (one == two);
                });

                for (var key of Object.keys(element.stats)) {
                    if (element.stats[key] != -1) {
                        ammo_stats += `<tr><th>${ammo_stats_titles[key][0]}</th><td>${element.stats[key]+ammo_stats_titles[key][1]}</td></tr>`;
                    }

                    if (foundElement == undefined) continue;
                    if (foundElement.stats[key] == -1 || foundElement.stats[key] == undefined) continue;

                    let color = redOrGreen(element.stats[key], foundElement.stats[key]);
                    if (ammo_stats_titles[key][2] == -1) color = redOrGreen(foundElement.stats[key], element.stats[key]);

                    console.log(ammo_stats_titles[key] + " ammo stat")

                    if (key == "explosive_mass") {
                        mass1 = +element.stats[key].replace("kg", "").replace("g", "")
                        mass2 = +foundElement.stats[key].replace("kg", "").replace("g", "")

                        if (!element.stats[key].includes("kg")) mass1 = mass1 / 1000
                        if (!foundElement.stats[key].includes("kg")) mass2 = mass2 / 1000

                        color = redOrGreen(mass1, mass2);
                    }
                    
                    ammo_stats2 += `<tr><th>${ammo_stats_titles[key][0]}</th>
                        <td style="color: ${color};">${foundElement.stats[key]+ammo_stats_titles[key][1]}</td></tr>`;
                }

                var indexof = data1.stats.weaponry.ammunition.indexOf(element);

                ammos += `<div style="
                grid-row: ${indexof + 1};
                grid-column: 1;
                ${ammoTypeGridStyle}
                "><table><tr><th colspan="3" class="stat_header">${element.type}</th></tr>
                <tr><th>Penetration</th><td>0deg: ${element.penetration["0"]}mm</td></tr>
                <tr><th></th><td>30deg: ${element.penetration["30"]}mm</td></tr>
                <tr><th></th><td>60deg: ${element.penetration["60"]}mm</td></tr>
                <tr><th>Velocity</th><td>${element.velocity}m/s</td></tr>
                <tr><th>Ricochet Angle</th><td>${element.ricochet_angle}deg</td></tr>
                ${ammo_stats}</table></div>`

                if (foundElement) {
                    gun2_alreadyCheckedAmmos.push(data2.stats.weaponry.ammunition.indexOf(foundElement))
                    gun2_rows.push(indexof);

                    ammos2 += `<div style="
                    grid-row: ${indexof + 1};
                    grid-column: 2;
                    ${ammoTypeGridStyle}
                    font-size: clamp(0.2em, 100%, 1em);
                    "><table><tr><th colspan="3" class="stat_header">${element.type}</th></tr>
                    <tr><th>Penetration</th>
                    <td style="color: ${redOrGreen(element.penetration["0"], foundElement.penetration["0"])};">0deg: ${foundElement.penetration["0"]}mm</td></tr>
                    <tr><th></th><td style="color: ${redOrGreen(element.penetration["30"], foundElement.penetration["30"])};">30deg: ${foundElement.penetration["30"]}mm</td></tr>
                    <tr><th></th><td style="color: ${redOrGreen(element.penetration["60"], foundElement.penetration["60"])};">60deg: ${foundElement.penetration["60"]}mm</td></tr>
                    <tr><th>Velocity</th><td style="color: ${redOrGreen(element.velocity, foundElement.velocity)};">${foundElement.velocity}m/s</td></tr>
                    <tr><th>Ricochet Angle</th><td style="color: ${redOrGreen(element.ricochet_angle, foundElement.ricochet_angle)};">${foundElement.ricochet_angle}deg</td></tr>
                    ${ammo_stats2}</table></div>`;
                }
            });

            
            data2.stats.weaponry.ammunition.forEach(element => {
                var indexof = data2.stats.weaponry.ammunition.indexOf(element);
                ammo_stats = ""

                if (gun2_alreadyCheckedAmmos.indexOf(indexof) != -1) return;

                if (gun2_rows.indexOf(indexof) != -1) {
                    var indexof = gun2_rows[gun2_rows.length-1]+1;

                    for (var i = 0; i < gun2_rows.length-1; i++) {
                        if (gun2_rows[i+1]-gun2_rows[i] > 1) {
                            indexof = gun2_rows[i]+1;

                            break;
                        }
                    }
                }

                gun2_rows.push(indexof);
                console.log(element.type.split(" ")[0]);

                for (var key of Object.keys(element.stats)) {
                    if (element.stats[key] == -1) continue;

                    ammo_stats += `<tr><th>${ammo_stats_titles[key][0]}</th><td>${element.stats[key]+ammo_stats_titles[key][1]}</td></tr>`;
                }

                ammos2 += `<div style="
                grid-row: ${indexof + 1};
                grid-column: 2;
                ${ammoTypeGridStyle}
                "><table><tr><th colspan="3" class="stat_header">${element.type}</th></tr>
                <tr><th>Penetration</th><td>0deg: ${element.penetration["0"]}mm</td></tr>
                <tr><th></th><td>30deg: ${element.penetration["30"]}mm</td></tr>
                <tr><th></th><td>60deg: ${element.penetration["60"]}mm</td></tr>
                <tr><th>Velocity</th><td>${element.velocity}m/s</td></tr>
                <tr><th>Ricochet Angle</th><td>${element.ricochet_angle}deg</td></tr>
                ${ammo_stats}</table></div>`;
            });
            
            stats_str += `
            <table style="
                width: 100%;
                table-layout: fixed;
            ">
            <tr><th colspan="3" class="stat_header">Weaponry</th></tr>
            <tr>
            <th>Reload</th>
                <td>${data1.stats.weaponry.reload}s</td>
                <td style="color: ${redOrGreen(data2.stats.weaponry.reload, data1.stats.weaponry.reload)};">
                    ${data2.stats.weaponry.reload}s
                </td>
            </tr>
            <tr>
                <th>Accuracy</th>
                <td>${data1.stats.weaponry.accuracy}</td>
                <td style="color: ${redOrGreen(data1.stats.weaponry.accuracy, data2.stats.weaponry.accuracy)};">
                    ${data2.stats.weaponry.accuracy}
                </td>
            </tr>
            <tr>
                <th>Ammo Volume</th>
                <td>${data1.stats.weaponry.ammo_volume}</td>
                <td style="color: ${redOrGreen(data2.stats.weaponry.ammo_volume, data1.stats.weaponry.ammo_volume)};">
                    ${data2.stats.weaponry.ammo_volume}
                </td>
            </tr>
            <tr>
                <th>Caliber</th>
                <td>${data1.stats.weaponry["caliber:"]}mm</td>
                <td style="color: ${redOrGreen(data1.stats.weaponry["caliber:"], data2.stats.weaponry["caliber:"])};">
                    ${data2.stats.weaponry["caliber:"]}mm
                </td>
            </tr>
            <tr><th colspan="3" class="stat_header">Ammunition</th></tr>
            <tr><td colspan="3"><div style="
                display: grid;
                grid-template-columns: 1fr 1fr;
                column-gap: 10px;">${ammos}${ammos2}</div></td></tr>
            </table>`
            break;
        default:
            break;
    }

    return stats_str;
}