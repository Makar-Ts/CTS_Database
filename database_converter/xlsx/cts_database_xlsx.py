from openpyxl import load_workbook
import csv, sys, os.path
import re
import codecs
import time

start_time = time.time()

parent_dir = os.path.dirname(os.path.realpath(__file__ + "/../"))
sys.path.append(parent_dir)
import modules_templates as templates

HULLS_OFFSET = 1    #Index offset
TURRETS_OFFSET = 23
GUNS_OFFSET = 44

DATABASE_NAME = input()
DATABASE_PATH = os.path.join(sys.path[0], DATABASE_NAME)
JSON_PATH = os.path.join(sys.path[0], "database.json")

def as_string(a): return '"'+a.replace('"', '\\"')+'"' if a else '""'

wb = load_workbook(filename=DATABASE_PATH, read_only=True, data_only=True)
ws = wb['Raw Data']

hulls_string = ""
turrets_string = ""
guns_string = ""

def obtain_parcing(obtain):
    add_obtain = ""
    obtain_str_prev = obtain
    
    arr = obtain_str_prev.split("\n")[1:]
    for j in arr:
        if j == "":
            arr.remove(j)
    
    requires_module_type = "None"
    requires_module_name = ""
    
    if len(arr) > 0 and "Requires" in arr[0]:
        dnb = arr[0].replace("Requires ", "").split(" [")
        requires_module_type = dnb[1].replace("]", "").lower()+"s"
        requires_module_name = dnb[0]
        
        arr = arr[1:]

    requires = [requires_module_type, requires_module_name]

    if "Offsale" in obtain:
        add_obtain = ", Offsale"
        obtain_str_prev = obtain_str_prev.replace("Offsale\n", "")
    
    if "Blueprints" in obtain_str_prev:
        obtain_str = "Blueprints"+add_obtain
        resources = '{"' + ', "'.join(map(lambda x: x.replace(":", '":'), arr)) +'}'
    else: # Joe Shack or Monthly reward
        obtain_str = obtain_str_prev+add_obtain
        resources = "{}"
        
    print(obtain_str, resources, requires, "|", obtain_str_prev)
    
    return obtain_str, resources, requires

hulls_converting_time = 0
turrets_converting_time = 0
guns_converting_time = 0

#  HULLS PARCING
preapre_time = time.time()-start_time
after_time = time.time()
print("Prepare time: " + str(preapre_time))

i = 2
while ws.cell(HULLS_OFFSET+0, i).value is not None:
    if i != 2:
        hulls_string += ","
    print(ws.cell(HULLS_OFFSET+0, i).value)
    
    obtain_str, resources, requires = obtain_parcing(ws.cell(HULLS_OFFSET+17, i).value)
    
    armor = list(map(lambda x: x.split("(")[0].replace("~", ""), ws.cell(HULLS_OFFSET+5, i).value.split("/")))
    if len(armor) != 3:
        print("armor:", armor, ws.cell(HULLS_OFFSET+0, i).value.replace("\n", "\\n").replace('"', '\\"'))
        armor = [0, 0, 0, 0]
    
    speed = ws.cell(HULLS_OFFSET+6, i).value.split("/")
    
    ammo = ws.cell(HULLS_OFFSET+10, i).value.replace("(", "").replace(")", "").replace("?", "").replace(",", ".")
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
    
    if "No" in ws.cell(HULLS_OFFSET+11, i).value: #Hull aim
        aim = 0
    elif "Yes" in ws.cell(HULLS_OFFSET+11, i).value:
        aim = 2
    elif "Suspension Only".lower() in ws.cell(HULLS_OFFSET+11, i).value.lower():
        aim = 1
    else:
        print("aim:", ws.cell(HULLS_OFFSET+11, i).value, ws.cell(HULLS_OFFSET+0, i).value.replace("\n", "\\n").replace('"', '\\"'))
        aim = -1
    
    
    if ws.cell(HULLS_OFFSET+12, i).value == "N/A":
        have_gun = "false"
        hull_gun = "{}"
    else:
        have_gun = "true"
        
        
        reload_multi = ws.cell(HULLS_OFFSET+12, i).value
        if type(reload_multi) == str:
            reload_multi = reload_multi.replace(",", ".").split()
            if len(reload_multi) != 2:
                print("reload:", reload_multi, ws.cell(HULLS_OFFSET+0, i).value.replace("\n", "\\n").replace('"', '\\"'))
                reload_multi = [reload_multi[0], "0"]
        else:
            reload_multi = [reload_multi, "0"]
        
        limits_hor = ws.cell(HULLS_OFFSET+13, i).value.split("/")
        limits_ver = ws.cell(HULLS_OFFSET+14, i).value.split("/")
        
        hull_gun = templates.HULL_GUN.format(
            reload_multi=reload_multi[0],
            reload_multi_caliber=reload_multi[1].replace("(", "").replace(")", "").replace("mm", ""),
            limits_up=limits_ver[1],
            limits_down=limits_ver[0].replace("-", ""),
            limits_left=limits_hor[0].replace("-", ""),
            limits_right=limits_hor[1]
        )
    
    aps = ws.cell(HULLS_OFFSET+15, i).value.replace("N/A", "No")
    if "Yes" in aps:
        aps = "true"
    else:
        aps = "false"
    
    string = templates.HULL.format(
        name=ws.cell(HULLS_OFFSET+0, i).value.replace("\n", "\\n").replace('"', '\\"'),
        description=as_string(ws.cell(HULLS_OFFSET+1, i).value),
        tier=ws.cell(HULLS_OFFSET+2, i).value,
        rarity=as_string(ws.cell(HULLS_OFFSET+3, i).value),
        obtain=as_string(obtain_str.replace("\n", "")),
        resources=resources,
        weight= ws.cell(HULLS_OFFSET+8, i).value if re.match(r'^-?\d+(?:\.\d+)$', ws.cell(HULLS_OFFSET+8, i).value) is not None else -1,
        requires_type = as_string(requires[0]),
        requires_name = as_string(requires[1]),
        armor_front=armor[0],
        armor_back=armor[2],
        armor_side=armor[1],
        speed_acceleration=ws.cell(HULLS_OFFSET+4, i).value,
        speed_forward=speed[0],
        speed_backward=speed[1],
        speed_torque=ws.cell(HULLS_OFFSET+7, i).value.replace("k", ""),
        speed_rate=ws.cell(HULLS_OFFSET+9, i).value.replace("m", ""),
        weapon_ammo_storage=ammo,
        weapon_blowout=blowout,
        weapon_hull_aim=aim,
        weapon_aps=aps,
        weapon_have_gun=have_gun,
        weapon_gun=hull_gun,
        crew='["'+ws.cell(HULLS_OFFSET+16, i).value.replace("\n", '", "')+'"]',
        based_on=as_string(" ".join(ws.cell(HULLS_OFFSET+18, i).value.split()) if ws.cell(HULLS_OFFSET+18, i).value is not None else "None"),
        paired_gun=as_string(" ".join(ws.cell(HULLS_OFFSET+20, i).value.split()[:-1]) if ws.cell(HULLS_OFFSET+20, i).value is not None else "None"),
        paired_turret=as_string(" ".join(ws.cell(HULLS_OFFSET+19, i).value.split()[:-1]) if ws.cell(HULLS_OFFSET+19, i).value is not None else "None")
    )
    
    hulls_string += string.replace("#VALUE!", "0").replace("°", "").replace("�", "").replace(" (!)", "")

    i += 1


hulls_converting_time = round(time.time()-start_time-preapre_time, 2)
print("Hulls converting time: " + str(hulls_converting_time))    
# TURRETS PARCING

i = 2
while ws.cell(TURRETS_OFFSET+0, i).value is not None:
    if i != 2:
        turrets_string += ","
    print(ws.cell(TURRETS_OFFSET+0, i).value)
    
    obtain_str, resources, requires = obtain_parcing(ws.cell(TURRETS_OFFSET+16, i).value)
    
    ammo = ws.cell(TURRETS_OFFSET+9, i).value.replace("(", "").replace(")", "").replace("?", "").replace(",", ".")
    blowout = -1
    clip = 0
    
    if "None" in ammo:
        ammo = 0
    else:
        if "Blowout" in ammo:
            if "Partial Blowout" in ammo:
                blowout = 0
            else:
                blowout = 1
            
        if "Ready Rack" in ammo:
            clip = 1
        ammo = ammo.split()[0]
    
    
    armor = list(map(lambda x: x.split("(")[0].replace("~", ""), ws.cell(TURRETS_OFFSET+4, i).value.split("/")))
    if len(armor) != 3:
        print("armor:",armor, ws.cell(TURRETS_OFFSET, i).value.replace("\n", "\\n").replace('"', '\\"'))
        armor = [0, 0, 0, 0]
    
    aps = ws.cell(TURRETS_OFFSET+14, i).value.replace("N/A", "No")
    if "Yes" in aps:
        aps = "true"
    else:
        aps = "false"
    
    thermal = ws.cell(TURRETS_OFFSET+12, i).value.replace("N/A", "No").replace("?", "No")
    if "No" in thermal:
        thermal = "0"
    else:
        thermal = thermal.replace("Gen ", "")
        
    zoom_str = ws.cell(TURRETS_OFFSET+13, i).value.replace("N/A", "?")
    if "?" in zoom_str:
        zoom = [-1, -1]
    else:
        zoom = zoom_str.replace("x", "").split("-")
        
    stab = ws.cell(TURRETS_OFFSET+5, i).value.replace("N/A", "No")
    if "Yes" in stab:
        stab = "true"
    else:
        stab = "false"
        
    fcs = ws.cell(TURRETS_OFFSET+11, i).value.replace("?", "No").replace("N/A", "No").replace("Up to ", "").replace("km", "")
    
    reload_multi = ws.cell(TURRETS_OFFSET+10, i).value.replace(",", ".").split()
    if len(reload_multi) != 2:
        reload_multi = [reload_multi[0], "0"]

    limits_ver = ws.cell(TURRETS_OFFSET+7, i).value.split("/")
    speed = ws.cell(TURRETS_OFFSET+6, i).value.replace(" ", "").split("/")
    
    
    string = templates.TURRET.format(
        name=ws.cell(TURRETS_OFFSET, i).value.replace("\n", "\\n").replace('"', '\\"'),
        description=as_string(ws.cell(TURRETS_OFFSET+1, i).value),
        tier=ws.cell(TURRETS_OFFSET+2, i).value,
        rarity=as_string(ws.cell(TURRETS_OFFSET+3, i).value),
        obtain=as_string(obtain_str.replace("\n", "")),
        resources=resources,
        weight= ws.cell(TURRETS_OFFSET+8, i).value if re.match(r'^-?\d+(?:\.\d+)$', ws.cell(TURRETS_OFFSET+8, i).value) is not None else -1,
        requires_type = as_string(requires[0]),
        requires_name = as_string(requires[1]),
        armor_front=armor[0],
        armor_back=armor[2],
        armor_side=armor[1],
        weapon_ammo_storage=ammo,
        weapon_blowout=blowout,
        weapon_clip=clip,
        weapon_aps=aps,
        weapon_fcs=fcs if re.match(r'^\d+(\.\d+|)$', fcs) is not None  else -1,
        weapon_stabilizer=stab,
        weapon_sight_thermal = thermal,
        weapon_zoom_lower = zoom[0],
        weapon_zoom_upper = zoom[1],
        weapon_gun_reload_multi=reload_multi[0],
        weapon_gun_reload_multi_caliber=reload_multi[1].replace("(", "").replace(")", "").replace("mm", ""),
        weapon_gun_limits_up=limits_ver[1],
        weapon_gun_limits_down=limits_ver[0].replace("-", ""),
        weapon_gun_speed_vertical=speed[1][1:],
        weapon_gun_speed_horizontal=speed[0][1:],
        crew='["'+ws.cell(TURRETS_OFFSET+15, i).value.replace("\n", '", "')+'"]',
        based_on=as_string(" ".join(ws.cell(TURRETS_OFFSET+17, i).value.split()) if ws.cell(TURRETS_OFFSET+17, i).value is not None else "None"),
        paired_gun=as_string(" ".join(ws.cell(TURRETS_OFFSET+19, i).value.split()[:-1]) if ws.cell(TURRETS_OFFSET+19, i).value is not None else "None"),
        paired_hull=as_string(" ".join(ws.cell(TURRETS_OFFSET+18, i).value.split()[:-1]) if ws.cell(TURRETS_OFFSET+18, i).value is not None else "None")
    )
    
    turrets_string += string.replace("#VALUE!", "0").replace("°", "").replace(" (!)", "")
    
    i += 1
    

turrets_converting_time = round(time.time()-start_time-preapre_time-hulls_converting_time, 2)
print("Turrets converting time: " + str(turrets_converting_time))    
# GUNS PARCING

i = 2
while ws.cell(GUNS_OFFSET+0, i).value is not None:
    if i != 2:
        guns_string += ","
    print(ws.cell(GUNS_OFFSET+0, i).value)
    
    obtain_str, resources, requires = obtain_parcing(ws.cell(GUNS_OFFSET+14, i).value)
    
    ammunition = ""
    for j in range(4):
        dtd = ws.cell(GUNS_OFFSET+10+j, i).value #Ammo stats
        if dtd is None: break
        
        dtd = dtd.split("\n")
        
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
        name=ws.cell(GUNS_OFFSET, i).value.replace("\n", "\\n").replace('"', '\\"'),
        description=as_string(ws.cell(GUNS_OFFSET+1, i).value),
        tier=ws.cell(GUNS_OFFSET+2, i).value,
        rarity=as_string(ws.cell(GUNS_OFFSET+3, i).value),
        obtain=as_string(obtain_str.replace("\n", "")),
        resources=resources,
        weight= ws.cell(GUNS_OFFSET+8, i).value if re.match(r'^-?\d+(?:\.\d+)$', ws.cell(GUNS_OFFSET+8, i).value) is not None else -1,
        requires_type = as_string(requires[0]),
        requires_name = as_string(requires[1]),
        weapon_clip=ws.cell(GUNS_OFFSET+9, i).value if type(ws.cell(GUNS_OFFSET+9, i).value) == int else 0,
        weapon_reload=ws.cell(GUNS_OFFSET+7, i).value.replace("s", "") if re.match(r'^-?\d+(?:\.\d+)$', ws.cell(GUNS_OFFSET+7, i).value.replace("s", "")) else -1,
        weapon_accuracy=ws.cell(GUNS_OFFSET+4, i).value if ws.cell(GUNS_OFFSET+4, i).value.isdigit() else -1,
        weapon_ammo_volume=ws.cell(GUNS_OFFSET+5, i).value if re.match(r'^-?\d+(?:\.\d+)$', ws.cell(GUNS_OFFSET+5, i).value) else -1,
        weapon_caliber=ws.cell(GUNS_OFFSET+6, i).value.replace("mm", ""),
        weapon_ammunition=ammunition,
        based_on=as_string(" ".join(ws.cell(GUNS_OFFSET+15, i).value.split()) if ws.cell(GUNS_OFFSET+14, i).value is not None else "None"),
        paired_turret=as_string(" ".join(ws.cell(GUNS_OFFSET+16, i).value.split()[:-1]) if ws.cell(GUNS_OFFSET+15, i).value is not None else "None"),
        paired_hull=as_string(" ".join(ws.cell(GUNS_OFFSET+17, i).value.split()[:-1]) if ws.cell(GUNS_OFFSET+16, i).value is not None else "None")
    )
    
    guns_string += string.replace("#VALUE!", "0").replace("°", "").replace(" (!)", "")
    
    i += 1

guns_converting_time = round(time.time()-start_time-preapre_time-hulls_converting_time-turrets_converting_time, 2)
print("Guns converting time: " + str(guns_converting_time))

output_string = templates.DATABASE.format(
    hulls=hulls_string,
    turrets=turrets_string,
    guns=guns_string
)
with codecs.open(JSON_PATH,mode='w',encoding='utf-8') as f:
    f.write(output_string)

print("\n\nConverting time: " + str(time.time()-start_time))
print("Hulls: " + str(hulls_converting_time))
print("Turrets: " + str(turrets_converting_time))
print("Guns: " + str(guns_converting_time))
