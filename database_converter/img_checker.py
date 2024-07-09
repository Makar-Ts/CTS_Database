import json
import os, sys
import os.path

def check_image_existence(data, database):
    for category, items in database.items():
        if category == "secondaries": break
        
        print(f"======================== Checking images for {category}: ========================")
        for name, img_path in items.items():
            if not name in data[category]:
                print(f"⬛ Image for '{name}' in '{category}' does not exist in DATABASE")
                continue
            
            if not os.path.exists(os.path.join(sys.path[0], "..", data[category][name])):
                print(f"⬜ Image for '{name}' in '{category}' does not exist at '{data[category][name]}'")

# Read JSON data from file
with open(os.path.join(sys.path[0], "..", "imgPaths.json"), "r") as file:
    json_data = json.load(file)

with open(os.path.join(sys.path[0], "..", "database.json"), "r", encoding="utf-8") as database:
    print(database)
    database_data = json.load(database)

check_image_existence(json_data, database_data)
