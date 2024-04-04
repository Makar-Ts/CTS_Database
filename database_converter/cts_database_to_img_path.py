import csv, sys
import re
import modules_templates as templates

DATABASE_NAME = input()
DATABASE_PATH = sys.path[0]+"\\"+DATABASE_NAME
JSON_PATH = sys.path[0]+"\\"+"imgPaths.json"
PATH_IMG = "./img/"

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
        hulls_string += ", \n"
    
    hulls_string += '"'+data[0][i].replace("\n", "\\n").replace('"', '\\"')+'"'+": "+'"'+PATH_IMG+f"hulls/Tier {data[2][i]}/"+data[0][i].replace("\n", "\\n").replace('"', '\\"')+" Plain.png"+'"'

for i in range(1, len(data[22])-1):
    if data[22][i] == "": break
    
    if i != 1:
        turrets_string += ", \n"
    
    turrets_string += '"'+data[22][i].replace("\n", "\\n").replace('"', '\\"')+'"'+": "+'"'+PATH_IMG+f"turrets/Tier {data[24][i]}/"+data[22][i].replace("\n", "\\n").replace('"', '\\"')+" Plain.png"+'"'

for i in range(1, len(data[41])-1):
    if data[41][i] == "": break
    
    if i != 1:
        guns_string += ", \n"
    
    guns_string += '"'+data[41][i].replace("\n", "\\n").replace('"', '\\"')+'"'+": "+'"'+PATH_IMG+f"hulls/Tier {data[43][i]}/"+data[41][i].replace("\n", "\\n").replace('"', '\\"')+".png"+'"'

output_string = templates.DATABASE.format(
    hulls=hulls_string.replace(" (!)", ""),
    turrets=turrets_string.replace(" (!)", ""),
    guns=guns_string.replace(" (!)", "")
)
with open(JSON_PATH, 'w') as f:
    f.write(output_string)