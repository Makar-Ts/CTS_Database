const filePath = "./database.json";
var database;

var ammo_stats_titles = {
    "fuse_sensitive": ["Fuse Sensitive", "mm"],
    "fuse_delay": ["Fuse Delay", "m"],
    "explosive_mass": ["Explosive Mass", ""],
    "fuse_radius": ["Fuse Radius", "m"],
    "arming_distance": ["Arming Distance", "m"],
    "range": ["Range", "km"]
};


$("#item_container").hide();

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
    fetchJSONFile(filePath, (error, data) => {
        if (error) {
            console.error('Error reading JSON file:', error);
            return;
        } else {
            console.log('JSON file content:', data);
            
            database = data;

            console.log(data.hulls["TKS"]);
        }
    });

    $('#search_input').bind('input', function (e) {
        $("#search_results").show();
        var search_for = $('#search_input').val().toLowerCase()
        
        str = ""

        count = 5;
        for (let key of Object.keys(database.hulls)) {
            if (key.toLowerCase().includes(search_for)) {
                str += `<tr class="search_result_item" data-item="${key}" data-type="hulls"><td>Hull: &nbsp;&nbsp;${key}</td></tr>`
                count--;
            }

            if (count <= 0) { break; }
        }

        count = 5;
        for (let key of Object.keys(database.turrets)) {
            if (key.toLowerCase().includes(search_for)) {
                str += `<tr class="search_result_item" data-item="${key}" data-type="turrets"><td>Turret: ${key}</td></tr>`
                count--;
            }

            if (count <= 0) { break; }
        }

        count = 5;
        for (let key of Object.keys(database.guns)) {
            if (key.toLowerCase().includes(search_for)) {
                str += `<tr class="search_result_item" data-item="${key}" data-type="guns"><td>Gun: &nbsp;&nbsp;&nbsp;${key}</td></tr>`
                count--;
            }

            if (count <= 0) { break; }
        }

        $('#search_results').html(str);
    });

    $(document).on('click', '.search_result_item', function() {
        $("#search_results").hide();
        var hull = $(this).data("item");
        var data = database[$(this).data("type")][hull]
        console.log(hull);
        $('#search_input').val(hull);

        plain = ""
        if ($(this).data("type") == "hulls" | $(this).data("type") == "turrets") { plain = " Plain"; }
        $("#item_img_container").text("Image loading...");
        document.getElementById('item_img').onerror = function(event) {
            $("#item_img_container").text("No img, sorry Т_Т");
        };
        $("#item_img").attr('src', `./img/${$(this).data("type")}/Tier ${data.tier}/${hull}${plain}.png`)
        $('#item_img').css('display', 'none');
        
        $("#name").text(hull);
        $("#description").text(data.description);
        $("#tier").text(data.tier);
        $("#rarity").text(data.rarity);
        $("#obtain").text(data.obtain);

        if (data.resources.length == 0) {
            $("#resources").closest('tr').hide();
        } else {
            $("#resources").closest('tr').show();

            str = ""
            for (let key of Object.keys(data.resources)) {
                str += `${key}: ${data.resources[key]}<br>`;
            }
            $("#resources").html(str);
        }

        $("#weight").text(data.stats.weight+"t");


        stats_str = ""
        switch ($(this).data("type")) {
            case "hulls":
                var aps, hull_aim, blowout, gun;

                switch (data.stats.weaponry.blowout) {
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

                switch (data.stats.weaponry.hull_aim) {
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

                if (data.stats.weaponry.aps) { aps = "Yes"; }
                else { aps = "No"; }

                gun = ""
                if (data.stats.weaponry.have_gun) {
                    gun = `
                    <tr><th colspan="2" class="stat_header">Gun Mount</th></tr>
                    <tr><th>Reload Multiplier</th><td>${data.stats.weaponry.gun.reload_multiplier} (${data.stats.weaponry.gun.reload_multiplier_caliber}mm)</td></tr>
                    <tr><th colspan="2" class="stat_header">Gun Limits</th></tr>
                    <tr><th>Up</th><td>${data.stats.weaponry.gun.limits.up}</td></tr>
                    <tr><th>Down</th><td>-${data.stats.weaponry.gun.limits.down}</td></tr>
                    <tr><th>Left</th><td>${data.stats.weaponry.gun.limits.left}</td></tr>
                    <tr><th>Right</th><td>${data.stats.weaponry.gun.limits.right}</td></tr>
                    `;
                }

                stats_str += `
                <table>
                <tr><th colspan="2" class="stat_header">Armor</th></tr>
                <tr><th>Front</th><td>${data.stats.armor.front}mm</td></tr>
                <tr><th>Back</th><td>${data.stats.armor.back}mm</td></tr>
                <tr><th>Side</th><td>${data.stats.armor.side}mm</td></tr>
                <tr><th colspan="2" class="stat_header">Movement</th></tr>
                <tr><th>Acceleration</th><td>${data.stats.speed.acceleration}</td></tr>
                <tr><th>Max Forward</th><td>${data.stats.speed.forward}km/h</td></tr>
                <tr><th>Max Backward</th><td>${data.stats.speed.backward}km/h</td></tr>
                <tr><th>Torque</th><td>${data.stats.speed.torque}k</td></tr>
                <tr><th>Traverse Rate</th><td>${data.stats.speed.rate}</td></tr>
                <tr><th colspan="2" class="stat_header">Weaponry</th></tr>
                <tr><th>Ammo Storage</th><td>${data.stats.weaponry.ammo_storage}</td></tr>
                <tr><th>Blowout</th><td>${blowout}</td></tr>
                <tr><th>Hull Aim</th><td>${hull_aim}</td></tr>
                <tr><th>APS</th><td>${aps}</td></tr>
                <tr><th>Crew</th><td>${data.stats.crew.join(", ")}</td></tr>
                ${gun}
                </table>`
                break;
            case "turrets":
                var aps, blowout, gun;

                switch (data.stats.weaponry.blowout) {
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

                if (data.stats.weaponry.aps) { aps = "Yes"; }
                else { aps = "No"; }

                if (data.stats.weaponry.fcs != -1) {
                    fcs = `Up to ${data.stats.weaponry.fcs}km`;
                } else { fcs = "No"; }

                stats_str += `
                <table>
                <tr><th colspan="2" class="stat_header">Armor</th></tr>
                <tr><th>Front</th><td>${data.stats.armor.front}mm</td></tr>
                <tr><th>Back</th><td>${data.stats.armor.back}mm</td></tr>
                <tr><th>Side</th><td>${data.stats.armor.side}mm</td></tr>
                <tr><th colspan="2" class="stat_header">Movement</th></tr>
                <tr><th>Up Limit</th><td>${data.stats.weaponry.gun.limits.up}</td></tr>
                <tr><th>Down Limit</th><td>-${data.stats.weaponry.gun.limits.down}</td></tr>
                <tr><th>Vertical Speed</th><td>${data.stats.weaponry.gun.speed.vertical}</td></tr>
                <tr><th>Horizontal Speed</th><td>${data.stats.weaponry.gun.speed.horizontal}</td></tr>
                <tr><th colspan="2" class="stat_header">Weaponry</th></tr>
                <tr><th>Ammo Storage</th><td>${data.stats.weaponry.ammo_storage}</td></tr>
                <tr><th>Stabilizer</th><td>${data.stats.weaponry.stabilizer ? "Yes" : "No"}</td></tr>
                <tr><th>APS</th><td>${aps}</td></tr>
                <tr><th>FCS</th><td>${fcs}</td></tr>
                <tr><th>Blowout</th><td>${blowout}</td></tr>
                <tr><th>Crew</th><td>${data.stats.crew.join(", ")}</td></tr>
                </table>`
                break;
            case "guns":
                var ammos = "";
                data.stats.weaponry.ammunition.forEach(element => {
                    ammo_stats = ""
                    for (var key of Object.keys(element.stats)) {
                        if (element.stats[key] == -1) continue;

                        ammo_stats += `<tr><th>${ammo_stats_titles[key][0]}</th><td>${element.stats[key]+ammo_stats_titles[key][1]}</td></tr>`;
                    }

                    ammos += `<tr><th colspan="2" class="stat_header">${element.type}</th></tr>
                    <tr><th>Penetration</th><td>0deg: ${element.penetration["0"]}mm</td></tr>
                    <tr><th></th><td>30deg: ${element.penetration["30"]}mm</td></tr>
                    <tr><th></th><td>60deg: ${element.penetration["60"]}mm</td></tr>
                    <tr><th>Velocity</th><td>${element.velocity}m/s</td></tr>
                    <tr><th>Ricochet Angle</th><td>${element.ricochet_angle}deg</td></tr>
                    ${ammo_stats}`
                });
                
                stats_str += `
                <table>
                <tr><th colspan="2" class="stat_header">Weaponry</th></tr>
                <tr><th>Reload</th><td>${data.stats.weaponry.reload}s</td></tr>
                <tr><th>Accuracy</th><td>${data.stats.weaponry.accuracy}</td></tr>
                <tr><th>Ammo Volume</th><td>${data.stats.weaponry.ammo_volume}</td></tr>
                <tr><th>Caliber</th><td>${data.stats.weaponry["caliber:"]}mm</td></tr>
                <tr><th colspan="2" class="stat_header">Ammunition</th></tr>
                </table>
                <div class="stats_ammunition"><table>${ammos}</table></div>`
                break;
            default:
                break;
        }
        $("#stats").html(stats_str);


        $("#based_on").text(data.based_on);

        count = 1
        for (let key of Object.keys(data.paired)) {
            $(`#paired_${count}`).text(data.paired[key]);
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


        $("#item_container").show();
    }); 

    $('#item_img').on('load', function() {
        $("#item_img_container").text("")
        $('#item_img').css('display', 'block');
        console.log('loaded');
    }).attr('src', imgUrl);
})