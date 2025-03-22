//y = -0.00000970477*(x**2)+0.00906669*x+0.381528
//D = 0.00906669**2+4*0.00000970477*(0.381528-y)
//x = (-0.00906669-sqrt(D))/(-0.00000970477*2)

const WEBHOOK_URL = "aHR0cHM6Ly9kaXNjb3JkLmNvbS9hcGkvd2ViaG9va3MvMTM1Mjk1MjQ5MDkxNTUyODc0NS9PbjlvVGxqZmpTOEhDNWMwdDh5S3d5c251QWl2LVlmVnpsODJ5bEwzS2ZFQ00wMWpxU1F5elpSSFhnWTEzdWljb2RsYQ=="

var ammo_stats_titles = {
    "fuse_sensitive": ["Fuse Sensitive", "mm", 1],
    "fuse_delay": ["Fuse Delay", "m", 1],
    "explosive_mass": ["Explosive Mass", "", 1],
    "fuse_radius": ["Fuse Radius", "m", 1],
    "arming_distance": ["Arming Distance", "m", -1],
    "range": ["Range", "km", 1]
};

const rangefinder_to_string = {
    "-1": "No",
    0: "Eyeball Mk.1",
    1: "Stereoscopic",
    2: "Laser"
}

function ammoType(name) {
    if (name.includes("AP")) {
        return "KE";
    } else {
        return "CE";
    }
}

function isDigit(n) {
    return /^[0-9.]+$/.test(n);
}

function createCookie(name, value, days) {
    var expires;
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    }
    else {
        expires = "";
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

function getCookie(c_name) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) {
                c_end = document.cookie.length;
            }
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }
    return "";
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

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

function getPenGraphComponents(pen_0, pen_30, pen_60) {
    var a = (
                (pen_30-pen_0)/30
                - 
                (pen_60-pen_0)/60
            )
            /
            (30 - 60)
    
    var b = (
                pen_30 - a*(30**2) - pen_0
            ) / 30
    
    return {
        a: a,
        b: b,
        c: pen_0
    }
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
        //toggleSwitch.checked = true;
    }
}

function calculateStringForItem(data, type, aps_img, secondary_data) {
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

                if (data.stats.weaponry.gun.fcs != -1) {
                    fcs = `Up to ${data.stats.weaponry.gun.fcs}km`;
                } else { fcs = "No"; }

                gun = `
                <tr><th colspan="2" class="stat_header">Gun Mount</th></tr>
                <tr><th>Reload Multiplier</th><td>${data.stats.weaponry.gun.reload_multiplier} (${reload_multiplier_caliber}mm)</td></tr>
                <tr><th>Stabilizer</th><td>${data.stats.weaponry.gun.stabilizer ? "Yes" : "No"}</td></tr>
                <tr><th>Rangefinder</th><td>${rangefinder_to_string[data.stats.weaponry.gun.sight.rangefinder]}</td></tr>
                <tr><th>FCS</th><td>${fcs}</td></tr>
                <tr><th>Zoom</th><td>${data.stats.weaponry.gun.sight.zoom_lower == -1 ? "no data" : `${data.stats.weaponry.gun.sight.zoom_lower}x-${data.stats.weaponry.gun.sight.zoom_upper}x`}</td></tr>
                <tr><th>Thermal</th><td>${data.stats.weaponry.gun.sight.thermal == 0 ? "No" : `Gen ${data.stats.weaponry.gun.sight.thermal}`}</td></tr>
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
            <tr><th>Rangefinder</th><td>${rangefinder_to_string[data.stats.weaponry.sight.rangefinder]}</td></tr>
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
                <tr><th colspan="2" class="pen_graf_container" 
                        pen-0="${element.penetration["0"]}"
                        pen-30="${element.penetration["30"]}"
                        pen-60="${element.penetration["60"]}"
                        ric_angle="${element.ricochet_angle}"></th></tr>
                <tr><th>Velocity</th><td>${element.velocity}m/s</td></tr>
                ${ammoType(element.type) == "KE" ? `<tr><th colspan="2" class="pen_per_dist_graf_container" 
                        pen="${element.penetration["0"]}"
                        shellSpeed="${element.velocity}"
                        caliber="${data.stats.weaponry["caliber:"]}"></th></tr>` : ""}
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

    console.log(secondary_data);
    if (secondary_data) {
        var ammos = "";
        secondary_data.secondaries.forEach(element => {
            ammo_stats = ""
            for (var key of Object.keys(element.stats)) {
                if (element.stats[key] == -1) continue;

                ammo_stats += `<tr><th>${ammo_stats_titles[key][0]}</th><td>${element.stats[key]+ammo_stats_titles[key][1]}</td></tr>`;
            }

            ammos += `<tr><th colspan="2" class="stat_header">${element.type} ${element.ammo_type}</th></tr>
            ${element.caliber != -1 ? `<tr><th>Caliber</th><td>${element.caliber}mm</td></tr>` : ""}
            <tr><th>Ammo</th><td>${element.ammo_count} ${element.reload_count != 0 ? "(+"+element.reload_count+" reloads)" : ""}</td></tr>
            ${element.reload != -1 ? `<tr><th>Reload</th><td>${element.reload}s</td></tr>` : ""}
            ${element.max_launch_speed != -1 ? `<tr><th>Max. Launch Speed</th><td>${element.max_launch_speed}km/h</td></tr>` : ""}
            <tr><th>Penetration</th><td>0deg: ${element.penetration["0"]}mm</td></tr>
            <tr><th></th><td>30deg: ${element.penetration["30"]}mm</td></tr>
            <tr><th></th><td>60deg: ${element.penetration["60"]}mm</td></tr>
            <tr><th colspan="2" class="pen_graf_container" 
                        pen-0="${element.penetration["0"]}"
                        pen-30="${element.penetration["30"]}"
                        pen-60="${element.penetration["60"]}"
                        ric_angle="${element.ricochet_angle}"></th></tr>
            ${element.caliber > 0 ? `
            <tr><th colspan="2" class="pen_per_dist_graf_container" 
                        pen="${element.penetration["0"]}"
                        shellSpeed="${element.velocity}"
                        caliber="${element.caliber}"></th></tr>
            ` : ""}
            <tr><th>Velocity</th><td>${element.velocity}m/s</td></tr>
            <tr><th>Ricochet Angle</th><td>${element.ricochet_angle}deg</td></tr>
            ${ammo_stats}`
        });
        
        stats_str += `
        <table>
        <tr><th colspan="2" class="stat_header">Secondary</th></tr>
        </table>
        <div class="stats_ammunition"><table>${ammos}</table></div>`
    }

    return stats_str;
}



class GraphBase {
    constructor(element) {
        this.element = element;

        this.padding = 25
        this.size = 1
        this.raito_factor = 1

        this.text_size = 15


        this.end_arrow = {
            length: this.padding*0.6,
            width: this.padding*0.3
        }

        this.base_lines = {
            axis: 4,
            divider: 4,
            divider_dashes: [12, 12]
        }

        this.base_lines_colors = {
            axis: "black",
            divider: "black",
            divider_line: "gray"
        }


        this.canvas = document.createElement("canvas")
        this.element.appendChild(this.canvas);

        this.ctx = this.canvas.getContext("2d")
    }

    init() {
        this.canvas.width = parseInt(this.element.clientWidth-this.padding*2)*this.size;
        this.canvas.height = parseInt(this.raito*this.canvas.width)

        this.width = this.canvas.width
        this.height = this.canvas.height
        this.raito = 1*this.raito_factor

        this.canvas.width += this.padding*2
        this.canvas.height += this.padding*2
    }

    draw_base() {
        this.ctx.lineWidth = this.base_lines.axis;
        this.ctx.fillStyle = this.base_lines_colors.axis;

        this.ctx.fillRect(
            this.padding, this.end_arrow.length, 4, this.canvas.height
        )

        this.ctx.beginPath();
        this.ctx.moveTo(this.padding+this.base_lines.axis/2, 0);
        this.ctx.lineTo(this.padding+this.end_arrow.width+this.base_lines.axis/2, this.end_arrow.length);
        this.ctx.lineTo(this.padding-this.end_arrow.width+this.base_lines.axis/2, this.end_arrow.length);
        this.ctx.fill();


        this.ctx.fillRect(
            0, this.canvas.height-this.padding, this.canvas.width-this.end_arrow.length, 4
        )

        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width, this.canvas.height-this.padding+this.base_lines.axis/2);
        this.ctx.lineTo(this.canvas.width-this.end_arrow.length, this.canvas.height-this.padding+this.end_arrow.width+this.base_lines.axis/2);
        this.ctx.lineTo(this.canvas.width-this.end_arrow.length, this.canvas.height-this.padding-this.end_arrow.width+this.base_lines.axis/2);
        this.ctx.fill();
    }

    draw_0y_divider(pix_pos, text, postfix="") {
        this.ctx.strokeStyle = this.base_lines_colors.divider;

        this.ctx.beginPath();
        this.ctx.moveTo(this.padding+pix_pos, this.canvas.height-this.padding-this.end_arrow.width);
        this.ctx.lineTo(this.padding+pix_pos, this.canvas.height-this.padding+this.end_arrow.width+this.base_lines.axis);
        this.ctx.stroke();

        
        this.ctx.strokeStyle = this.base_lines_colors.divider_line;

        this.ctx.setLineDash(this.base_lines.divider_dashes);
        this.ctx.beginPath();
        this.ctx.moveTo(this.padding+pix_pos, this.canvas.height-this.padding-this.end_arrow.width);
        this.ctx.lineTo(this.padding+pix_pos, 0);
        this.ctx.stroke();

        this.ctx.setLineDash([]);


        this.ctx.fillStyle = this.base_lines_colors.divider_line;
        this.ctx.font = `${this.text_size}px consolas`;
        this.ctx.fillText(text+postfix, this.padding+pix_pos-this.ctx.measureText(text).width/2, this.canvas.height);
    }
}


class PenetrationGraph extends GraphBase {
    constructor(element, pen_0, pen_30, pen_60, ric_angle) {
        super(element);

        this.element = element;
        this.pen_0 = pen_0;
        this.pen_30 = pen_30;
        this.pen_60 = pen_60;
        this.ric_angle = ric_angle;

        this.recalculateGraphComponents()
        this.init()
        this.draw()
        

        window.addEventListener("mousemove", (event) => this.interaction(event), false)
    }

    init() {
        this.canvas.width = parseInt(this.element.clientWidth-this.padding*2)*this.size;
        this.width = this.canvas.width
        this.raito = (this.pen_0/this.canvas.width)*this.raito_factor

        this.canvas.height = parseInt(this.raito*this.canvas.width);
        this.height = this.canvas.height

        this.canvas.width += this.padding*2
        this.canvas.height += this.padding*2

    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.draw_base()

        this.draw_0y_divider((30 / this.ric_angle) * this.width, "30", "°")
        this.draw_0y_divider((60 / this.ric_angle) * this.width, "60", "°")
        this.draw_0y_divider(this.width, this.ric_angle.toString(), "°")

        this.ctx.beginPath();
        this.ctx.strokeStyle = "red";
        this.ctx.lineWidth = 5;

        for (var i = 0; i < this.width; i++) {
            let x = i

            let angle = (x / (this.width)) * this.ric_angle
            let pen = this.graph(angle)

            

            let y = (this.pen_0-pen)*this.raito_factor

            if (y > this.height) {
                y = this.height

                this.ctx.lineTo(this.padding+x, this.padding+y);

                break
            }

            this.ctx.lineTo(this.padding+x, this.padding+y);
        }

        this.ctx.stroke();
        this.ctx.closePath();
    }

    interaction(event) {
        var rect = this.canvas.getBoundingClientRect();
        var x = event.clientX - rect.left - this.padding;
        var y = event.clientY - rect.top - this.padding;

        if (x < 0 || y < 0 || x > this.width || y > this.height) {
            return
        }

        let angle = (x / (this.width)) * this.ric_angle
        let pen = this.graph(angle)

        this.draw()
        this.draw_pen_line(x, angle, pen)
    }

    draw_pen_line(x, angle, pen) {
        this.ctx.fillStyle = currentTheme == "dark" ? "white" : "black";
        this.ctx.font = this.text_size.toString()+"px consolas";

        this.ctx.fillRect(
            this.padding+x, 0, 3, this.canvas.height
        )

        let text = `${Math.round(angle)}deg\n${Math.round(pen)}mm`
        let text_size = this.ctx.measureText(text)

        let fx = x
        
        if (x + text_size.width > this.width) {
            fx -= text_size.width+this.text_size
        } else {
            fx += this.text_size
        }

        var l_corner_projection = (this.pen_0-this.graph((fx / this.width)*this.ric_angle))*this.raito_factor
        var r_corner_projection = (this.pen_0-this.graph(((fx+text_size.width) / this.width)*this.ric_angle))*this.raito_factor

        var height = Math.min(l_corner_projection, r_corner_projection)
        let fy = height


        this.ctx.fillText(text, this.padding+fx, this.padding+fy-text_size.hangingBaseline);
    }

    recalculateGraphComponents() {
        this.components = getPenGraphComponents(this.pen_0, this.pen_30, this.pen_60)

        this.graph = (angle) => this.components.a*(angle**2)+this.components.b*angle+this.components.c
    }
}


class PenetrationGraphsCompare extends GraphBase {
    constructor(element, pen_0, pen_30, pen_60, ric_angle, name,
                        fpen_0, fpen_30, fpen_60, fric_angle, fname) {
        
        super(element)

        this.element = element;
        this.graph_main = {
            pen_0: pen_0,
            pen_30: pen_30,
            pen_60: pen_60,
            ric_angle: ric_angle,
            name: isDigit(name.replace("mm", "").split(' ')[0]) ? name.split(' ')[1] : name
        }

        this.graph_sec = {
            pen_0: fpen_0,
            pen_30: fpen_30,
            pen_60: fpen_60,
            ric_angle: fric_angle,
            name: isDigit(fname.replace("mm", "").split(' ')[0]) ? fname.split(' ')[1] : fname
        }

        this.recalculateGraphComponents()
        this.init()
        this.draw()

        window.addEventListener("mousemove", (event) => this.interaction(event), false)
    }

    init() {
        this.canvas.width = parseInt(this.element.clientWidth-this.padding*2)*this.size;
        this.width = this.canvas.width
        this.raito = (Math.max(this.graph_main.pen_0, this.graph_sec.pen_0)/this.canvas.width)*this.raito_factor

        this.canvas.height = parseInt(this.raito*this.canvas.width);
        this.height = this.canvas.height

        this.canvas.width += this.padding*2
        this.canvas.height += this.padding*2
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.draw_base()
        this.draw_0y_divider((30 / Math.max(this.graph_main.ric_angle, this.graph_sec.ric_angle)) * this.width, "30", "°")
        this.draw_0y_divider((60 / Math.max(this.graph_main.ric_angle, this.graph_sec.ric_angle)) * this.width, "60", "°")
        this.draw_0y_divider((  Math.max(this.graph_main.ric_angle, this.graph_sec.ric_angle) 
                                        / 
                                    Math.max(this.graph_main.ric_angle, this.graph_sec.ric_angle)) * this.width, 
                                    Math.max(this.graph_main.ric_angle, this.graph_sec.ric_angle).toString(),
                                    "°")
        if (this.graph_main.ric_angle != this.graph_sec.ric_angle) {
            this.draw_0y_divider((  Math.min(this.graph_main.ric_angle, this.graph_sec.ric_angle) 
                                        / 
                                    Math.max(this.graph_main.ric_angle, this.graph_sec.ric_angle)) * this.width, 
                                    Math.min(this.graph_main.ric_angle, this.graph_sec.ric_angle).toString(),
                                    "°")
        }

        if (this.graph_main.pen_0 != this.graph_sec.pen_0) {
            this.ctx.fillStyle = this.base_lines_colors.divider_line
            this.ctx.fillText(  "(1)",
                                0, 
                                    (      
                                        Math.max(this.graph_main.pen_0, this.graph_sec.pen_0)
                                            -
                                        this.main_graph(0)
                                    )
                                        *
                                    this.raito_factor
                                        +
                                    this.padding
                                )
            this.ctx.fillText(  "(2)",
                                0, 
                                    (      
                                        Math.max(this.graph_main.pen_0, this.graph_sec.pen_0)
                                            -
                                        this.sec_graph(0)
                                    )
                                        *
                                    this.raito_factor
                                        +
                                    this.padding
                                )
        }

        

        this.ctx.beginPath();
        this.ctx.strokeStyle = "red";
        this.ctx.lineWidth = 5;

        for (var i = 0; i < this.width; i++) {
            let x = i

            let angle = (x / (this.width)) * Math.max(this.graph_main.ric_angle, this.graph_sec.ric_angle)
            
            if (this.graph_main.ric_angle >= angle) {
                let pen = this.main_graph(angle)

                let y = (Math.max(this.graph_main.pen_0, this.graph_sec.pen_0)-pen)*this.raito_factor

                if (y > this.height) {
                    y = this.height

                    this.ctx.lineTo(this.padding+x, this.padding+y);

                    break
                }

                this.ctx.lineTo(this.padding+x, this.padding+y);
            } else {
                break
            }
        }

        this.ctx.stroke();
        this.ctx.closePath();


        this.ctx.beginPath();
        this.ctx.strokeStyle = "lime";
        this.ctx.lineWidth = 5;

        for (var i = 0; i < this.width; i++) {
            let x = i

            let angle = (x / (this.width)) * Math.max(this.graph_main.ric_angle, this.graph_sec.ric_angle)
            if (this.graph_sec.ric_angle >= angle) {
                let pen = this.sec_graph(angle)

                let y = (Math.max(this.graph_main.pen_0, this.graph_sec.pen_0)-pen)*this.raito_factor

                if (y > this.height) {
                    y = this.height

                    this.ctx.lineTo(this.padding+x, this.padding+y);

                    break
                }

                this.ctx.lineTo(this.padding+x, this.padding+y);
            } else {
                break
            }
        }

        this.ctx.stroke();
        this.ctx.closePath();
    }


    interaction(event) {
        var rect = this.canvas.getBoundingClientRect();
        var x = event.clientX - rect.left - this.padding;
        var y = event.clientY - rect.top - this.padding;

        if (x < 0 || y < 0 || x > this.width || y > this.height) {
            return
        }

        let angle = (x / (this.width)) * Math.max(this.graph_main.ric_angle, this.graph_sec.ric_angle)
        let pen1 = this.main_graph(angle)
        let pen2 = this.sec_graph(angle)

        this.draw()
        this.draw_pen_line(x, angle, pen1, pen2)
    }

    draw_pen_line(x, angle, pen1, pen2) {
        this.ctx.fillStyle = currentTheme == "dark" ? "white" : "black";
        this.ctx.font = this.text_size.toString()+"px consolas";

        this.ctx.fillRect(
            this.padding+x, 0, 3, this.canvas.height
        )

        let y1 = (Math.max(this.graph_main.pen_0, this.graph_sec.pen_0)-pen1)*this.raito_factor
        let y2 = (Math.max(this.graph_main.pen_0, this.graph_sec.pen_0)-pen2)*this.raito_factor

        let text1 = `${Math.round(angle)}° ${angle <= this.graph_main.ric_angle ? Math.round(pen1) : "-"}mm (${this.graph_main.name})`
        let text2 = `${Math.round(angle)}° ${angle <= this.graph_sec.ric_angle ? Math.round(pen2) : "-"}mm (${this.graph_sec.name})`

        let text1_size = this.ctx.measureText(text1)
        let text2_size = this.ctx.measureText(text2)

        let fx = x


        if (x + Math.max(text1_size.width, text2_size.width) > this.width) {
            fx -= Math.max(text1_size.width, text2_size.width)+text1_size.hangingBaseline
        } else {
            fx += text1_size.hangingBaseline
        }


        var l_corner1_projection = (Math.max(this.graph_main.pen_0, this.graph_sec.pen_0)-this.main_graph((fx / this.width)*Math.max(this.graph_main.ric_angle, this.graph_sec.ric_angle)))*this.raito_factor
        var r_corner1_projection = (Math.max(this.graph_main.pen_0, this.graph_sec.pen_0)-this.main_graph(((fx+text1_size.width) / this.width)*Math.max(this.graph_main.ric_angle, this.graph_sec.ric_angle)))*this.raito_factor

        var l_corner2_projection = (Math.max(this.graph_main.pen_0, this.graph_sec.pen_0)-this.sec_graph((fx / this.width)*Math.max(this.graph_main.ric_angle, this.graph_sec.ric_angle)))*this.raito_factor
        var r_corner2_projection = (Math.max(this.graph_main.pen_0, this.graph_sec.pen_0)-this.sec_graph(((fx+text2_size.width) / this.width)*Math.max(this.graph_main.ric_angle, this.graph_sec.ric_angle)))*this.raito_factor

        if (r_corner1_projection < r_corner2_projection) {
            var fy1 = Math.min(l_corner1_projection, r_corner1_projection)-text1_size.hangingBaseline
            var fy2 = Math.max(l_corner2_projection, r_corner2_projection)+text2_size.hangingBaseline*2
        } else {
            var fy1 = Math.max(l_corner1_projection, r_corner1_projection)+text1_size.hangingBaseline*2
            var fy2 = Math.min(l_corner2_projection, r_corner2_projection)-text2_size.hangingBaseline
        }

        this.ctx.fillText(text1, fx+this.padding, fy1+this.padding);
        this.ctx.fillText(text2, fx+this.padding, fy2+this.padding);
    }


    recalculateGraphComponents() {
        this.main_components = getPenGraphComponents(this.graph_main.pen_0, this.graph_main.pen_30, this.graph_main.pen_60)

        this.main_graph = (angle) => this.main_components.a*(angle**2)+this.main_components.b*angle+this.main_components.c


        this.sec_components = getPenGraphComponents(this.graph_sec.pen_0, this.graph_sec.pen_30, this.graph_sec.pen_60)

        this.sec_graph = (angle) => this.sec_components.a*(angle**2)+this.sec_components.b*angle+this.sec_components.c
    }
}

class PenetrationPerDistanceGraph extends GraphBase {
    constructor(element, pen_0, caliber, shellSpeed) {
        super(element);

        this.element = element;
        this.pen_0 = pen_0;
        this.caliber = caliber;
        this.shellSpeed = shellSpeed;

        this.maxDistance = 4000

        this.base_lines.divider = 2

        if (shellSpeed <= 0) {
            console.error("Shell speed must be greater than 0")

            return
        }

        this.init()
        this.compileGraphValues()
        this.draw()

        
        window.addEventListener("mousemove", (event) => this.interaction(event), false)
    }

    init() {
        this.canvas.width = parseInt(this.element.clientWidth-this.padding*2)*this.size;
        this.width = this.canvas.width
        this.raito = (this.pen_0/this.canvas.width)*this.raito_factor

        this.canvas.height = parseInt(this.raito*this.canvas.width);
        this.height = this.canvas.height

        this.canvas.width += this.padding*2
        this.canvas.height += this.padding*2
    }

    compileGraphValues() {
        this.graph_values = []

        for (let x = 0; x < this.width+1; x++) {
            var dist = (x / (this.width)) * this.maxDistance
            this.graph_values.push({
                distance: dist,
                pen: this.getPenAtDist(dist)
            })
        }
    }

    getGraphValues(x) {
        return this.graph_values[x > this.width ? this.width : x < 0 ? 0 : x]
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.draw_base()

        for (let index = 500; index < this.maxDistance; index+=500) {
            this.draw_0y_divider((index / this.maxDistance) * this.width, index, "m")
        }
        //this.draw_0y_divider((30 / this.ric_angle) * this.width, "30", "°")
        //this.draw_0y_divider((60 / this.ric_angle) * this.width, "60", "°")
        //this.draw_0y_divider(this.width, this.ric_angle.toString(), "°")

        this.ctx.beginPath();
        this.ctx.strokeStyle = "orange";
        this.ctx.lineWidth = 5;

        for (var i = 0; i < this.width+1; i++) {
            let x = i

            let pen = this.graph_values[i].pen

            

            let y = (this.pen_0-pen)*this.raito_factor

            if (y > this.height) {
                y = this.height

                this.ctx.lineTo(this.padding+x, this.padding+y);

                break
            }

            this.ctx.lineTo(this.padding+x, this.padding+y);
        }

        this.ctx.stroke();
        this.ctx.closePath();
    }


    getPenAtDist(distance) {
        var timeStart = new Date().getTime()
        var pen = this.pen_0
        const step = 1/400
        var currentDist = 0
        
        while (currentDist < (distance * 3.57)) {
            currentDist += (this.shellSpeed * 3.57) * step
            pen -= pen * currentDist / (200 / step * this.caliber)
        }
        
        var timeEnd = new Date().getTime()
        //console.log("Calculation time:", timeEnd - timeStart, "ms")
        return pen
    }


    interaction(event) {
        var rect = this.canvas.getBoundingClientRect();
        var x = Math.round(event.clientX - rect.left - this.padding);
        var y = event.clientY - rect.top - this.padding;

        if (x < 0 || y < 0 || x > this.width || y > this.height) {
            return
        }

        let graph_val = this.getGraphValues(x)
        let dist = graph_val.distance
        let pen = graph_val.pen

        this.draw()
        this.draw_pen_line(x, dist, pen)
    }

    draw_pen_line(x, dist, pen) {
        this.ctx.fillStyle = currentTheme == "dark" ? "white" : "black";
        this.ctx.font = this.text_size.toString()+"px consolas";

        this.ctx.fillRect(
            this.padding+x, 0, 3, this.canvas.height
        )

        let text = `${Math.round(dist)}m\n${Math.round(pen)}mm`
        let text_size = this.ctx.measureText(text)

        let fx = x
        
        if (x + text_size.width > this.width) {
            fx -= text_size.width+this.text_size
        } else {
            fx += this.text_size
        }
        
        var l_corner_projection = (this.pen_0-this.getGraphValues(Math.round(fx)).pen)*this.raito_factor
        var r_corner_projection = (this.pen_0-this.getGraphValues(Math.round(fx+text_size.width)).pen)*this.maxDistance*this.raito_factor

        var height = Math.min(l_corner_projection, r_corner_projection)
        let fy = height


        this.ctx.fillText(text, this.padding+fx, this.padding+fy-text_size.hangingBaseline);
    }
}



// =================================== LOGGING =================================

function sendToDiscordWebhook(data, webhookURL) {
    let decodedWebhookURL = atob(webhookURL);
    let xhr = new XMLHttpRequest();

    xhr.open("POST", decodedWebhookURL, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            console.log('Hook completed successfully')
        } else {
            console.error('Error:', xhr.statusText)
        }
    };

    xhr.onerror = function () { console.error('') };

    let requestBody = JSON.stringify({ content: data });

    xhr.send(requestBody)
} 

function stringToHash(string) {

    let hash = 0;

    if (string.length == 0) return hash;

    for (i = 0; i < string.length; i++) {
        char = string.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }

    return hash;
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
                let userBrowser =  navigator.userAgentData
                                            .brands
                                            .map((brand) =>`${brand.brand} (${brand.version})`)
                                            .join(" > ");
                
                const urlParams = new URLSearchParams(window.location.search);

                a = window.location.pathname.split("/")
                if (a[a.length-2] === "all_objects") {
                    url_data = ""
                    if (urlParams.get("type") == undefined || 
                        urlParams.get("filters") == undefined) {
                            //nothing to do
                        } else {
                            url_data = "type: "+urlParams.get("type")
                            filters = urlParams.get("filters").split(";");
                            
                            str_filters = []
                            filters.forEach((_filter) => {
                                filter = _filter.split("|");
                                
                                filter_path = filter[0];
                                filter_sign = filter[1];
                                filter_val  = filter[2];

                                str_filters.push(`${filter_path} ${filter_sign} ${filter_val}`)
                            })

                            url_data += "\n - " + str_filters.join("\n - ")
                        }
                } else {
                    url_data = Array.from(urlParams.keys())
                                    .map((key) => `${key}: ${urlParams.get(key)}`)
                                    .join("\n - ")
                }

                var log = {
                    "id": stringToHash(btoa(address)),
                    "location": window.location.origin+window.location.pathname,
                    "data": url_data,
                    "refferer": document.referrer,
                    "deviceData": {
                        "userAgent": userAgent,
                        "userBrowser": userBrowser,
                        "screenWidth": screenWidth,
                        "screenHeight": screenHeight,
                        "browserLanguage": browserLanguage
                    }
                };

                unique_up_id = stringToHash(JSON.stringify(log))
                console.warn("UNIQUE USER-PAGE ID: "+unique_up_id)
            
                sendToDiscordWebhook(`
[ ------------------------ ]
# ID: ${log.id}
## Location:
- **Path**: <${log.location}>${log.data.length != 0 ?
`
- **Data**: 
 - ${log.data}` : ""}
- **Refferer**: ${log.refferer ? `<${log.refferer}>` : "Empty or hidden"}

## Device Data
- **User Agent**: \`\`\`${log.deviceData.userAgent}\`\`\`
- **User Browser**: \`\`\`${log.deviceData.userBrowser}\`\`\`
- **Screen**: ${log.deviceData.screenWidth}x${log.deviceData.screenHeight}
- **Browser Language**: ${log.deviceData.browserLanguage.toUpperCase()}

## Debug
- **Unique User-Page ID**: ${unique_up_id}

data: \`\`\`json
${JSON.stringify(log)}
\`\`\``, WEBHOOK_URL);
            })
            .catch(error => {
                console.error('Error fetching:', error);
    });
}