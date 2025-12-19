
import re
import collections

file_path = r'c:\Users\Bulen\Desktop\Yeni klasör\ships.js'

def analyze_databases():
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split the file to separate databases
    # shipDatabase starts around the beginning, ends before attackerDatabase
    # attackerDatabase starts later
    
    # Simple split by variable declaration
    parts = content.split('let attackerDatabase =')
    if len(parts) < 2:
        parts = content.split('const attackerDatabase =') # Fallback if my previous edit failed or something
    
    if len(parts) < 2:
        print("Could not split databases.")
        return

    ship_db_text = parts[0]
    attacker_db_text = parts[1]

    print("=== SHIP DATABASE ANALYSIS ===")
    matches_ship = re.findall(r'name:\s*"([^"]+)"', ship_db_text)
    counts_ship = collections.Counter(matches_ship)
    dupes_ship = {n: c for n, c in counts_ship.items() if c > 1}
    
    if dupes_ship:
        print(f"Duplicates found in shipDatabase ({len(dupes_ship)}):")
        for n, c in dupes_ship.items():
            print(f"- {n}: {c}")
    else:
        print("No duplicates in shipDatabase.")
        
    print("\n=== ATTACKER DATABASE ANALYSIS ===")
    matches_attacker = re.findall(r'name:\s*"([^"]+)"', attacker_db_text)
    counts_attacker = collections.Counter(matches_attacker)
    dupes_attacker = {n: c for n, c in counts_attacker.items() if c > 1}
    
    if dupes_attacker:
        print(f"Duplicates found in attackerDatabase ({len(dupes_attacker)}):")
        for n, c in dupes_attacker.items():
            print(f"- {n}: {c}")
    else:
        print("No duplicates in attackerDatabase.")

    # Also check for cross-database exact naming (which is suspicious if attacker usually has caliber)
    print("\n=== SUSPICIOUS ATTACKER NAMES (No Caliber) ===")
    suspicious = [n for n in matches_attacker if '(' not in n]
    if suspicious:
        print(f"Found {len(suspicious)} entries without caliber info in attackerDatabase:")
        for n in suspicious[:20]:
            print(f"- {n}")
        if len(suspicious) > 20: 
            print("...")

if __name__ == "__main__":
    analyze_databases()
