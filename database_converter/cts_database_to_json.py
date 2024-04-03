import csv, sys
import re
import modules_templates as templates

DATABASE_NAME = input()
DATABASE_PATH = sys.path[0]+"\\"+DATABASE_NAME
JSON_PATH = sys.path[0]+"\\"+"database.json"

def as_string(a): return '"'+a.replace('"', '\\"')+'"'

data = []

with open(DATABASE_PATH, 'r') as csvfile:
    spamreader = csv.reader(csvfile, delimiter=';')
    for row in spamreader:
        data.append(row)

hulls_string = ""
turrets_string = ""
guns_string = ""

for i in range(1, len(data[0])-1):
    if data[0][i] == "": break
    
    if i != 1:
        hulls_string += ","
    
    add_obtain = ""
    obtain_str_prev = data[17][i]
    if "Offsale" in data[17][i]:
        add_obtain = ", Offsale"
        obtain_str_prev = obtain_str_prev.replace("Offsale\n", "")
    
    if "Blueprints" in obtain_str_prev:
        arr = obtain_str_prev.split("\n")[1:]
        for j in arr:
            if j == "":
                arr.remove(j)
        
        obtain_str = "Blueprints"+add_obtain
        resources = '{"' + ', "'.join(map(lambda x: x.replace(":", '":'), arr)) +'}'
    else:
        obtain_str = obtain_str_prev+add_obtain
        resources = "{}"
    
    armor = list(map(lambda x: x.split("(")[0].replace("~", ""), data[5][i].split("/")))
    if len(armor) != 3:
        armor = [0, 0, 0, 0]
    
    speed = data[6][i].split("/")
    
    ammo = data[10][i].replace("(", "").replace(")", "").replace("?", "").replace(",", ".")
    blowout = -1
    if "None" in ammo:
        ammo = 0
    else:
        if "Blowout" in ammo:
            if "Partial Blowout" in ammo:
                blowout = 0
            else:
                blowout = 1
        ammo = ammo.split()[0]
    
    match(data[11][i]):
        case "No":
            aim=0
        case "Yes":
            aim=2
        case "Suspension only":
            aim=1
        case _:
            aim=-1
    
    if data[12][i] == "N/A":
        have_gun = "false"
        hull_gun = "{}"
    else:
        have_gun = "true"
        
        reload_multi = data[12][i].replace(",", ".").split()
        if len(reload_multi) != 2:
            reload_multi = [reload_multi[0], "0"]
        
        limits_hor = data[13][i].split("/")
        limits_ver = data[14][i].split("/")
        
        hull_gun = templates.HULL_GUN.format(
            reload_multi=reload_multi[0],
            reload_multi_caliber=reload_multi[1].replace("(", "").replace(")", "").replace("mm", ""),
            limits_up=limits_hor[1],
            limits_down=limits_hor[0].replace("-", ""),
            limits_left=limits_ver[1].replace("-", ""),
            limits_right=limits_ver[0]
        )
    
    aps = data[15][i].replace("N/A", "No")
    if "Yes" in aps:
        aps = "true"
    else:
        aps = "false"
    
    string = templates.HULL.format(
        name=data[0][i].replace("\n", "\\n").replace('"', '\\"'),
        description=as_string(data[1][i]),
        tier=data[2][i],
        rarity=as_string(data[3][i]),
        obtain=as_string(obtain_str.replace("\n", "")),
        resources=resources,
        weight= data[8][i] if re.match(r'^-?\d+(?:\.\d+)$', data[8][i]) is not None else -1,
        armor_front=armor[0],
        armor_back=armor[2],
        armor_side=armor[1],
        speed_acceleration=data[4][i],
        speed_forward=speed[0],
        speed_backward=speed[1],
        speed_torque=data[7][i].replace("k", ""),
        speed_rate=data[9][i].replace("m", ""),
        weapon_ammo_storage=ammo,
        weapon_blowout=blowout,
        weapon_hull_aim=aim,
        weapon_aps=aps,
        weapon_have_gun=have_gun,
        weapon_gun=hull_gun,
        crew='["'+data[16][i].replace("\n", '", "')+'"]',
        based_on=as_string(" ".join(data[18][i].split())),
        paired_gun=as_string(" ".join(data[19][i].split()[:-1])),
        paired_turret=as_string(" ".join(data[20][i].split()[:-1]))
    )
    
    print(string)
    
    hulls_string += string.replace("#VALUE!", "0").replace("°", "").replace("�", "")
    
for i in range(1, len(data[22])-1):
    if data[22][i] == "": break
    
    if i != 1:
        turrets_string += ","
    
    add_obtain = ""
    obtain_str_prev = data[36][i]
    if "Offsale" in data[36][i]:
        add_obtain = ", Offsale"
        obtain_str_prev = obtain_str_prev.replace("Offsale\n", "")
    
    if "Blueprints" in obtain_str_prev:
        obtain_str = "Blueprints"+add_obtain
        resources = '{"' + ', "'.join(map(lambda x: x.replace(":", '":'), obtain_str_prev.split("\n")[1:])) +'}'
    else:
        obtain_str = obtain_str_prev+add_obtain
        resources = "{}"
    
    ammo = data[31][i].replace("(", "").replace(")", "").replace("?", "").replace(",", ".")
    blowout = -1
    
    if "None" in ammo:
        ammo = 0
    else:
        if "Blowout" in ammo:
            if "Partial Blowout" in ammo:
                blowout = 0
            else:
                blowout = 1
        ammo = ammo.split()[0]
    
    
    armor = list(map(lambda x: x.split("(")[0].replace("~", ""), data[34][i].split("/")))
    if len(armor) != 3:
        armor = [0, 0, 0, 0]
    
    aps = data[34][i].replace("N/A", "No")
    if "Yes" in aps:
        aps = "true"
    else:
        aps = "false"
        
    stab = data[27][i].replace("N/A", "No")
    if "Yes" in aps:
        stab = "true"
    else:
        stab = "false"
        
    fcs = data[33][i].replace("?", "No").replace("N/A", "No").replace("Up to ", "").replace("km", "")
    
    reload_multi = data[32][i].replace(",", ".").split()
    if len(reload_multi) != 2:
        reload_multi = [reload_multi[0], "0"]

    limits_ver = data[29][i].split("/")
    speed = data[28][i].replace(" ", "").split("/")
    
    
    string = templates.TURRET.format(
        name=data[22][i].replace("\n", "\\n").replace('"', '\\"'),
        description=as_string(data[23][i]),
        tier=data[24][i],
        rarity=as_string(data[25][i]),
        obtain=as_string(obtain_str.replace("\n", "")),
        resources=resources,
        weight= data[30][i] if re.match(r'^-?\d+(?:\.\d+)$', data[30][i]) is not None else -1,
        armor_front=armor[0],
        armor_back=armor[2],
        armor_side=armor[1],
        weapon_ammo_storage=ammo,
        weapon_blowout=blowout,
        weapon_aps=aps,
        weapon_fcs=fcs if fcs.isdigit() else -1,
        weapon_stabilizer=stab,
        weapon_gun_reload_multi=reload_multi[0],
        weapon_gun_reload_multi_caliber=reload_multi[1].replace("(", "").replace(")", "").replace("mm", ""),
        weapon_gun_limits_up=limits_hor[1],
        weapon_gun_limits_down=limits_hor[0].replace("-", ""),
        weapon_gun_speed_vertical=speed[1][1:],
        weapon_gun_speed_horizontal=speed[0][1:],
        crew='["'+data[35][i].replace("\n", '", "')+'"]',
        based_on=as_string(" ".join(data[37][i].split())),
        paired_gun=as_string(" ".join(data[39][i].split()[:-1])),
        paired_hull=as_string(" ".join(data[38][i].split()[:-1]))
    )
    
    print(string)
    
    turrets_string += string.replace("#VALUE!", "0").replace("°", "")
    
for i in range(1, len(data[41])-1):
    if data[41][i] == "": break
    
    if i != 1:
        guns_string += ","
        
    add_obtain = ""
    obtain_str_prev = data[54][i]
    if "Offsale" in data[54][i]:
        add_obtain = ", Offsale"
        obtain_str_prev = obtain_str_prev.replace("Offsale\n", "")
    
    if "Blueprints" in obtain_str_prev:
        obtain_str = "Blueprints"+add_obtain
        resources = '{"' + ', "'.join(map(lambda x: x.replace(":", '":'), obtain_str_prev.split("\n")[1:])) +'}'
    else:
        obtain_str = obtain_str_prev+add_obtain
        resources = "{}"
    
    ammunition = ""
    for j in range(4):
        dtd = data[50+j][i].split("\n")
        
        if dtd[0] == "": break
        
        if j != 0: ammunition += ",\n"
        
        if "AP" in dtd[0] and not "APHE" in dtd[0]:
            stats="""{}"""
        elif "APHE" in dtd[0]:
            stats=templates.AMMO_TYPES["APHE"].format(
                fuse_sensitive=dtd[6].split(":")[1].replace("mm", ""),
                fuse_delay=dtd[7].split(":")[1].replace("m", ""),
                explosive_mass=as_string(dtd[8].split(":")[1])
            )
        elif "HEAT" in dtd[0]:
            stats=templates.AMMO_TYPES["HEAT"].format(
                fuse_radius=dtd[6].split(":")[1].replace("m", "") if len(dtd) > 6 else -1,
                arming_distance=dtd[7].split(":")[1].replace("m", "") if len(dtd) > 6 else -1
            )
        elif "HE" in dtd[0] or "HESH" in dtd[0]:
            stats=templates.AMMO_TYPES["HE"].format(
                explosive_mass=as_string(dtd[6].split(":")[1]),
                fuse_radius=dtd[7].split(":")[1].replace("m", "") if len(dtd) > 7 else -1,
                arming_distance=dtd[8].split(":")[1].replace("m", "") if len(dtd) > 7 else -1
            )
        elif "ATGM" in dtd[0]:
            stats=templates.AMMO_TYPES["ATGM"].format(
                range=dtd[6].split(":")[1].replace("km", ""),
                fuse_radius=dtd[7].split(":")[1].replace("m", "") if len(dtd) > 7 else -1,
                arming_distance=dtd[8].split(":")[1].replace("m", "") if len(dtd) > 7 else -1
            )
        else:
            stats="""{}"""
        
        
        ammunition += templates.AMMUNITION.format(
            type=as_string(dtd[0]),
            penetration_0deg=dtd[1].split(":")[1].replace("mm", ""),
            penetration_30deg=dtd[2].split(":")[1].replace("mm", ""),
            penetration_60deg=dtd[3].split(":")[1].replace("mm", ""),
            velocity=dtd[4].split(":")[1].replace("m/s", ""),
            ricochet_angle=dtd[5].split(":")[1],
            stats=stats
        )
            
    
    
    string = templates.GUNS.format(
        name=data[41][i].replace("\n", "\\n").replace('"', '\\"'),
        description=as_string(data[42][i]),
        tier=data[43][i],
        rarity=as_string(data[44][i]),
        obtain=as_string(obtain_str.replace("\n", "")),
        resources=resources,
        weight= data[49][i] if re.match(r'^-?\d+(?:\.\d+)$', data[49][i]) is not None else -1,
        weapon_reload=data[48][i].replace("s", "") if re.match(r'^-?\d+(?:\.\d+)$', data[48][i].replace("s", "")) else -1,
        weapon_accuracy=data[45][i] if data[45][i].isdigit() else -1,
        weapon_ammo_volume=data[46][i] if re.match(r'^-?\d+(?:\.\d+)$', data[46][i]) else -1,
        weapon_caliber=data[47][i].replace("mm", ""),
        weapon_ammunition=ammunition,
        based_on=as_string(" ".join(data[55][i].split())),
        paired_turret=as_string(" ".join(data[56][i].split()[:-1])),
        paired_hull=as_string(" ".join(data[57][i].split()[:-1]))
    )
    
    print(string)
    
    guns_string += string.replace("#VALUE!", "0").replace("°", "")
    


output_string = templates.DATABASE.format(
    hulls=hulls_string,
    turrets=turrets_string,
    guns=guns_string
)
with open(JSON_PATH, 'w') as f:
    f.write(output_string)