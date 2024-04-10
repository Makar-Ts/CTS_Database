//y = -0.00000970477*(x**2)+0.00906669*x+0.381528
//D = 0.00906669**2+4*0.00000970477*(0.381528-y)
//x = (-0.00906669-sqrt(D))/(-0.00000970477*2)

var ammo_stats_titles = {
    "fuse_sensitive": ["Fuse Sensitive", "mm"],
    "fuse_delay": ["Fuse Delay", "m"],
    "explosive_mass": ["Explosive Mass", ""],
    "fuse_radius": ["Fuse Radius", "m"],
    "arming_distance": ["Arming Distance", "m"],
    "range": ["Range", "km"]
};

function replaceGreekNumerals(str) {
    const greekNumerals = {
        'I': '1',
        'II': '2',
        'III': '3',
        'IV': '4',
        'V': '5',
        'VI': '6',
        'VII': '7',
        'VIII': '8',
        'IX': '9',
        'X': '10'
    };

    // Создаем регулярное выражение для поиска греческих цифр, которые стоят отдельно
    const regex = new RegExp(`\\b(${Object.keys(greekNumerals).join('|')})\\b`, 'g');

    // Заменяем греческие цифры на арабские
    return str.replace(regex, match => greekNumerals[match]);
}

function calculateCaliberFromMultiplier(mult) {
    if (mult === undefined | mult > 2.46 | mult < 0.4) return 0;

    var D = 0.00906669**2+4*0.00000970477*(0.381528-mult)
    if (D < 0) {
        console.log('Discriminant < 0');
        return 0;
    }

    return (-0.00906669+Math.sqrt(D))/(-0.00000970477*2)
}

function extractWeaponNames(inputString) {
    const regex = /\s*\[\d+\]\s*/;
    return inputString.split(regex).map(item => item.trim()).filter(Boolean);
}

function calculateStringForItem(data, type) {
    stats_str = ""
    switch (type) {
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
                reload_multiplier_caliber = data.stats.weaponry.gun.reload_multiplier_caliber;
                if (data.stats.weaponry.gun.reload_multiplier_caliber == 0) {
                    reload_multiplier_caliber = Math.round(calculateCaliberFromMultiplier(data.stats.weaponry.gun.reload_multiplier));
                }

                gun = `
                <tr><th colspan="2" class="stat_header">Gun Mount</th></tr>
                <tr><th>Reload Multiplier</th><td>${data.stats.weaponry.gun.reload_multiplier} (${reload_multiplier_caliber}mm)</td></tr>
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

            reload_multiplier_caliber = data.stats.weaponry.gun.reload_multiplier_caliber;
            if (data.stats.weaponry.gun.reload_multiplier_caliber == 0) {
                reload_multiplier_caliber = Math.round(calculateCaliberFromMultiplier(data.stats.weaponry.gun.reload_multiplier));
            }

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
            <tr><th>Reload Multiplier</th><td>${data.stats.weaponry.gun.reload_multiplier} (${reload_multiplier_caliber}mm)</td></tr>
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

    return stats_str;
}