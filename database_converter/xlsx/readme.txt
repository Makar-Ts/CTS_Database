How to compile a database:
1) Download the table in xlsx format - https://docs.google.com/spreadsheets/d/1DzSz5p-lAJEM74g005gZm5Vp7Ot5k8I_ESVeUJSpSXw/
2) Put the file in this folder
3) Run cts_database_xlsx.py
4) Enter the name of the xlsx file
5) After parsing is complete, check database.json for errors (I suggest using vscode or a similar code editor).
6) Move database.json to the root folder of the site
7) Run img_extractor.py
8) Enter the name of the xlsx file
9) Copy all folders inside img and paste into the root img folder with file replacement
10) Run img_path_xlsx.py
11) Enter the name of the xlsx file
12) Transfer the resulting file img_paths.json to the root folder of the site
13) Run img_checker.py (it is located in the folder a level above) and check which image/image paths are wrong, correct them.
14) It's done!