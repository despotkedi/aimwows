
import re

file_path = r'c:\Users\Bulen\Desktop\Yeni klasör\ships.js'

def clean_attacker_db():
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split into parts: before attackerDatabase, attackerDatabase definition, and maybe after?
    # Actually, attackerDatabase seems to be the last huge variable.
    
    # Locate start of attackerDatabase
    start_marker = 'let attackerDatabase = ['
    start_idx = content.find(start_marker)
    
    if start_idx == -1:
        print("Could not find start of attackerDatabase")
        return

    # Everything before attackerDatabase
    pre_content = content[:start_idx + len(start_marker)]
    
    # The content of attackerDatabase array
    # We need to find the closing ]; for this array.
    # Assuming it ends at the end of the file or we can find the matching brackets.
    # Given the file structure, it likely ends with ];
    
    rest_content = content[start_idx + len(start_marker):]
    
    # We will iterate line by line for the rest, because the entries are line-based.
    lines = rest_content.splitlines()
    
    new_lines = []
    removed_count = 0
    
    # We expect a list of objects like { ... },
    # We want to keep lines that have "name:" and "(" inside the value (indicating caliber),
    # OR lines that are just closing brackets like "];"
    
    for line in lines:
        stripped = line.strip()
        
        # Check if it's a ship entry line
        if stripped.startswith('{') and 'name:' in stripped:
            # Check for caliber info in name (indicated by parenthesis)
            # Regex to find name: "Name (Caliber)"
            # If no parenthesis in the name value, it's likely invalid for attackerDatabase
            
            # Extract name value safely
            name_match = re.search(r'name:\s*"([^"]+)"', line)
            if name_match:
                name_val = name_match.group(1)
                if '(' not in name_val:
                    # Invalid attacker entry (no caliber info)
                    print(f"Removing invalid attacker entry: {name_val}")
                    removed_count += 1
                    continue
                
                # Double check: if it's one of the known duplicates like 'Dmitri Donskoi'
                # The logic above handles it because 'Dmitri Donskoi' has no parens.
                
        new_lines.append(line)

    result_content = pre_content + '\n'.join(new_lines)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(result_content)
        
    print(f"\nDone. Removed {removed_count} invalid entries from attackerDatabase.")

if __name__ == "__main__":
    clean_attacker_db()
