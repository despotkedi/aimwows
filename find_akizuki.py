
# Script to find Akizuki line in ships.js
filename = r'c:\Users\Bulen\Desktop\Yeni klasör\ships.js'
with open(filename, 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if 'Akizuki' in line and '100 mm' in line:
            print(f"Line {i+1}: {line.strip()}")
