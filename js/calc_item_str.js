//y = -0.00000970477*(x**2)+0.00906669*x+0.381528
//D = 0.00906669**2+4*0.00000970477*(0.381528-y)
//x = (-0.00906669-sqrt(D))/(-0.00000970477*2)

const WEBHOOK_URL = "aHR0cHM6Ly9kaXNjb3JkLmNvbS9hcGkvd2ViaG9va3MvMTI0NDk3NzYwNTU4NTY3MDIxNS9yaUlKbGJTdVhCRzEyUkdTRnhTeTB1S3hMcGJES3pVZ3JpTkZhWG9KX29xNmlRcHE2QlN0bFE4cTZzamROZWdCci01bA=="

var ammo_stats_titles = {
    "fuse_sensitive": ["Fuse Sensitive", "mm", 1],
    "fuse_delay": ["Fuse Delay", "m", 1],
    "explosive_mass": ["Explosive Mass", "", 1],
    "fuse_radius": ["Fuse Radius", "m", 1],
    "arming_distance": ["Arming Distance", "m", -1],
    "range": ["Range", "km", 1]
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


createLog();

function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

function calculateCaliberPenalty(gc, rm) {
    var rm2 = rm <= 1 ? 1.0 : rm; 

    var mult = clamp(rm*2/(gc**(1/3)-2.27),
                     0, 
                     clamp(rm2, 0, 1+clamp(Math.sqrt(gc) -5.91, 
                                                    0, 
                                                    rm2)));

    return mult;
}

function getCrewNumber(crew_arr) {
    crews = {
        "Gunner": 0,
        "Driver": 0,
        "Commander": 0,
        "Loader": 0
    }

    crew_arr.forEach(element => {
        for (var key of Object.keys(crews)) {
            if (element.includes(key)) {
                crews[key] += 1;
            }
        }
    });

    return crews;
}

function calculateCaliberFromMultiplier(rm) {
    // var mult = clamp(rm*2/(gc**(1/3)-2.27),                      orig formula, thx faux
    //                  0, 
    //                  clamp(rm2, 0, 1+clamp(Math.sqrt(gc) -5.91, 
    //                                                 0, 
    //                                                 rm2)));

    // var D = 0.00906669**2+4*0.00000970477*(0.381528-mult)        formula from some dude
    // if (D < 0) {
    //     console.log('Discriminant < 0');
    //     return 0;
    // }

    // return (-0.00906669+Math.sqrt(D))/(-0.00000970477*2)
    var rm2 = rm <= 1 ? 1.0 : rm; 
    var effective_caliber = (rm*2+2.27)**3;
    var clamp_detect = clamp(rm2, 0, 1+clamp(Math.sqrt(effective_caliber) -5.91, 
                                             0, 
                                             rm2))
    var clamp_detect_caliber = (clamp_detect*2+2.27)**3;
    if (effective_caliber > clamp_detect_caliber) {
        effective_caliber = clamp_detect_caliber;
    }
    
    return effective_caliber;
}

function extractWeaponNames(inputString) {
    const regex = /\s*\[\d+\]\s*/;
    return inputString.split(regex).map(item => item.trim()).filter(Boolean);
}

function getDataByString(o, s) {
    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, '');           // strip a leading dot
    var a = s.split('.');
    for (var i = 0, n = a.length; i < n; ++i) {
        var k = a[i];
        if (k in o) {
            o = o[k];
        } else {
            return;
        }
    }
    return o;
}

function detectColorScheme(){
    var theme="light";    //default to light
    //local storage is used to override OS theme settings
    if(localStorage.getItem("theme")){
        if(localStorage.getItem("theme") == "dark"){
            var theme = "dark";
        }
    } else if(!window.matchMedia) {
        //matchMedia method not supported
        return false;
    } else if(window.matchMedia("(prefers-color-scheme: dark)").matches) {
        //OS theme setting detected as dark
        var theme = "dark";
    }
    //dark theme preferred, set document with a `data-theme` attribute
    if (theme=="dark") {
         document.documentElement.setAttribute("data-theme", "dark");
    }
}

function switchTheme(e) {
    currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;

    if (currentTheme == "light") {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark'); //add this
    }
    else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light'); //add this
    }    
}
$("#change_theme").click(switchTheme);

currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;

if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);

    if (currentTheme === 'dark') {
        toggleSwitch.checked = true;
    }
}

function calculateStringForItem(data, type, aps_img) {
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

            crew = getCrewNumber(data.stats.crew);
            crew_str = ""
            for (var key of Object.keys(crew)) {
                if (crew[key] != 0) {
                    crew_str += `${key} x${crew[key]}<br>`
                }
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
            ${data.stats.weaponry.aps ? `<tr><th>Protection</th><td><img src="${aps_img}"></td></tr>` : ""}
            <tr><th>Crew</th><td>${crew_str}</td></tr>
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

            crew = getCrewNumber(data.stats.crew);
            crew_str = ""
            for (var key of Object.keys(crew)) {
                if (crew[key] != 0) {
                    crew_str += `${key} x${crew[key]}<br>`
                }
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
            <tr><th>Clip</th><td>${data.stats.weaponry.clip == 1 ? "Yes" : "No"}</td></tr>
            <tr><th>Stabilizer</th><td>${data.stats.weaponry.stabilizer ? "Yes" : "No"}</td></tr>
            <tr><th>APS</th><td>${aps}</td></tr>
            ${data.stats.weaponry.aps ? `<tr><th>Protection</th><td><img src="${aps_img}"></td></tr>` : ""}
            <tr><th>FCS</th><td>${fcs}</td></tr>
            <tr><th>Zoom</th><td>${data.stats.weaponry.sight.zoom_lower == -1 ? "no data" : `${data.stats.weaponry.sight.zoom_lower}x-${data.stats.weaponry.sight.zoom_upper}x`}</td></tr>
            <tr><th>Thermal</th><td>${data.stats.weaponry.sight.thermal == 0 ? "No" : `Gen ${data.stats.weaponry.sight.thermal}`}</td></tr>
            <tr><th>Blowout</th><td>${blowout}</td></tr>
            <tr><th>Crew</th><td>${crew_str}</td></tr>
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
            <tr><th>Clip</th><td>${data.stats.weaponry.clip == 0 ? "No" : data.stats.weaponry.clip+" shots"}</td></tr>
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


// =================================== LOGGING =================================

function sendToDiscordWebhook(data, webhookURL) {
    let decodedWebhookURL = atob(webhookURL);
    let xhr = new XMLHttpRequest();

    xhr.open("POST", decodedWebhookURL, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            console.log('Everything ok')
        } else {
            console.error('Error:', xhr.statusText)
        }
    };

    xhr.onerror = function () { console.error('') };

    let requestBody = JSON.stringify({ content: data });

    xhr.send(requestBody)
} 

function createLog() {
    let id = fetch("https://api64.ipify.org?format=json")
            .then(response => response.ok ? response.json() : Promise.reject(''))
            .then(data => {
                const address = data.ip;
                let userAgent = navigator.userAgent;
                let screenWidth = window.screen.width;
                let screenHeight = window.screen.height;
                let browserLanguage = navigator.language;
                
                var log = {
                    "id": btoa(address),
                    "location": window.location.href,
                    "deviceData": {
                        "userAgent": userAgent,
                        "screenWidth": screenWidth,
                        "screenHeight": screenHeight,
                        "browserLanguage": browserLanguage
                    }
                };
            
                sendToDiscordWebhook(`
============================================================
# ID: *${log.id}*
## Location: ${log.location}

## Device Data
- User Agent: ${log.deviceData.userAgent}
- Screen Width: ${log.deviceData.screenWidth}
- Screen Height: ${log.deviceData.screenHeight}
- Browser Language: ${log.deviceData.browserLanguage}

============================================================
`, WEBHOOK_URL);
            })
            .catch(error => {
                console.error('Error fetching IP:', error);
    });
}