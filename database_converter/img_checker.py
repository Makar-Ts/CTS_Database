import json
import os, sys

def check_image_existence(data):
    for category, items in data.items():
        print(f"======================== Checking images for {category}: ========================")
        for name, img_path in items.items():
            if not os.path.exists(sys.path[0]+"\\..\\"+img_path):
                print(f"Image for '{name}' in '{category}' does not exist at '{img_path}'")

# Read JSON data from file
with open(sys.path[0]+"\\..\\imgPaths.json", "r") as file:
    json_data = json.load(file)

check_image_existence(json_data)