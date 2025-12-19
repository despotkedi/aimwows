
import re
import collections

file_path = r'c:\Users\Bulen\Desktop\Yeni klasör\ships.js'

def get_duplicates():
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split into two parts to analyze separately if needed, but for now let's looking broadly
    # Find all name: "..."
    # The pattern should look for name: "Value"
    
    # We want to be careful not to capture things that aren't ship names if possible, but the file structure is consistent.
    matches = re.findall(r'name:\s*"([^"]+)"', content)
    
    # Count all names
    counts = collections.Counter(matches)
    
    # Filter for > 1
    duplicates = {name: count for name, count in counts.items() if count > 1}
    
    print(f"Total ship entries found: {len(matches)}")
    print(f"Unique names: {len(set(matches))}")
    print(f"Duplicate names found: {len(duplicates)}")
    print("-" * 30)
    
    if duplicates:
        print("Duplicate Ship Names (Exact Match in File):")
        for name, count in sorted(duplicates.items(), key=lambda x: x[1], reverse=True):
            print(f"{name}: {count} times")
    else:
        print("No exact name duplicates found.")

    print("-" * 30)
    # Also check normalized names (removing caliber info)
    print("Checking normalized names (removing ' (XXX mm)'):")
    
    normalized_names = []
    for m in matches:
        # Remove caliber info like " (406 mm)" or " (406 mm) (406 mm)"
        norm = re.sub(r'\s\(\d+.*?\)', '', m).strip()
        normalized_names.append(norm)

    norm_counts = collections.Counter(normalized_names)
    norm_duplicates = {name: count for name, count in norm_counts.items() if count > 1}
    
    if norm_duplicates:
        print(f"Duplicate Normalized Names: {len(norm_duplicates)}")
        count = 0
        for name, cnt in sorted(norm_duplicates.items(), key=lambda x: x[1], reverse=True):
            if count < 50: # Limit output
                print(f"{name}: {cnt} times")
            count += 1
        if count >= 50:
            print("... and more.")
    else:
        print("No normalized duplicates found.")

if __name__ == "__main__":
    get_duplicates()
