
file_path = r'c:\Users\Bulen\Desktop\Yeni klasör\ships.js'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("Searching for 'Schlieffen (420 mm)'...")
for i, line in enumerate(lines):
    if 'Schlieffen (420 mm)' in line:
        print(f"Found at line {i+1}: {line.strip()}")
