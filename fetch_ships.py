import requests
import json
import time

APP_ID = "958ff05fbaa850b4c2bd0d171eb7e9cc"
BASE_URL = "https://api.worldofwarships.eu/wows/encyclopedia/ships/"

# Fields to map
ships_list = []

def fetch_ships():
    page_no = 1
    while True:
        print(f"Fetching page {page_no}...")
        try:
            params = {
                "application_id": APP_ID,
                "limit": 100,
                "page_no": page_no,
                "language": "en", # Or can specific 'tr' but English names are often standard for IDs
                # "db_check": 1 # To check if date changed? Not needed.
            }
            response = requests.get(BASE_URL, params=params)
            data = response.json()
            
            if data['status'] != 'ok':
                print("Error:", data['error'])
                break
                
            count = data['meta']['count']
            if count == 0:
                break
                
            for ship_id, ship_data in data['data'].items():
                tier = ship_data.get('tier')
                if tier and tier >= 8: # Filter for Tier 8+
                    
                    # Extract Profile Data
                    profile = ship_data.get('default_profile')
                    if not profile:
                        continue # Skip ships with no profile data
                        
                    artillery = profile.get('artillery') or {}
                    hull = profile.get('hull') or {}
                    mobility = profile.get('mobility') or {}
                    concealment = profile.get('concealment') or {}
                    
                    # Safe extraction helper
                    def get_val(source, key, default="-"):
                        return source.get(key, default) if source else default

                    # Shells
                    shells = artillery.get('shells') if artillery else {}
                    he_shell = shells.get('HE') or {}
                    ap_shell = shells.get('AP') or {}
                    
                    velocity = he_shell.get('bullet_speed') or ap_shell.get('bullet_speed') or 0
                    
                    # Construct Object
                    ship_entry = {
                        "id": ship_data['name'], # Using name as ID for consistency with existing db if possible, or ship_id? Existing uses Name.
                        "name": ship_data['name'],
                        "tier": str(tier),
                        "type": map_type(ship_data['type']),
                        "nation": map_nation(ship_data['nation']),
                        "image": ship_data['images']['small'],
                        
                        # New Stats
                        "hp": hull.get('health', "-"),
                        "speed": mobility.get('max_speed', "-"),
                        "rudder": mobility.get('rudder_time', "-"),
                        "turn_radius": mobility.get('turning_radius', "-"),
                        "concealment": concealment.get('detect_distance_by_ship', "-"),
                        "reload": artillery.get('shot_delay', "-"),
                        "range": artillery.get('distance', "-"),
                        "he_damage": he_shell.get('damage', "-"),
                        "ap_damage": ap_shell.get('damage', "-"),
                        "velocity": velocity,
                        "caliber": f"{get_caliber(artillery)} mm" if artillery else "-"
                    }
                    ships_list.append(ship_entry)
            
            page_no += 1
            time.sleep(0.2) # Polite delay
            
        except Exception as e:
            print(f"Exception: {e}")
            break

def map_type(t):
    mapping = {
        "Destroyer": "DD",
        "Cruiser": "CA", # Or CL, generic CA
        "Battleship": "BB",
        "AirCarrier": "CV",
        "Submarine": "SUB"
    }
    return mapping.get(t, t)

def map_nation(n):
    # Capitalize first letter
    if n == "usa": return "USA"
    if n == "ussr": return "USSR"
    if n == "uk": return "UK"
    return n.capitalize()

def get_caliber(artillery):
    # Try to find caliber from slots or generic
    # Often not directly in 'artillery' root, need to look at slots or shell name?
    # Actually API usually has 'guns' info inside.
    # We will try to parse from shell name or look deeper.
    # For now, let's leave generic or try to extract.
    # Artillery root usually doesn't have caliber directly, shells DO have it implicitly
    return "-" # Placeholder or improve logic if critical

def is_clone(name):
    # Normalize name to remove non-breaking spaces (\u00a0)
    name = name.replace('\u00a0', ' ')
    
    # 0. STRICT BLOCKLIST (Test ships, specific unwanted clones)
    blocklist = [
        "Yamato Kai", 
        "Montana 2", 
        "[Yamato]", 
        "[Moskva]", 
        "[Gearing]", 
        "[Shimakaze]", 
        "[Hindenburg]", 
        "[Zaō]", 
        "[Hakuryū]",
        "Brennus", # Often a test clone
        "Patrie", # Test versions often leak
    ]
    if name in blocklist:
        return True

    # 1. Test ships: start with [
    if name.startswith('['): return True
    
    # 2. Collaboration/Variant suffixes to exclude
    clones = [" B", " Golden", " CLR", " ARP", " AL ", " BA ", " BLACK", " Ignis ", " Ragnarok", " & ", " SE", " VL", " FE", " TE", " Purgatio", " State", " Hovercraft", " Orlov", " Zuckerhoff", " 2"]
    
    for marker in clones:
        if marker in name:
            return True
            
    # 3. Specific known clones or prefixes
    if name.startswith("ARP "): return True
    if name.startswith("AL "): return True
    if name.startswith("BA "): return True
    
    return False

fetch_ships()

# Generate JS file content
# Filtered list extraction
unique_ships = []
seen_names = set()

# First pass: Collect all base names to help identify if a "clone" is actually the only version (rare)
# But strictly, user wants to remove duplicates.
# We will just apply the is_clone filter.

for ship in ships_list:
    if not is_clone(ship['name']):
        if ship['name'] not in seen_names:
            unique_ships.append(ship)
            seen_names.add(ship['name'])

js_content = "let shipDatabase = " + json.dumps(unique_ships, indent=4) + ";"
js_content += "\n\n// Attacker DB is clone for now\nlet attackerDatabase = JSON.parse(JSON.stringify(shipDatabase));"

with open(r'c:\Users\Bulen\Desktop\Yeni klasör\ships_new.js', 'w', encoding='utf-8') as f:
    f.write(js_content)
    
print(f"Saved {len(unique_ships)} unique ships (filtered from {len(ships_list)}) to ships_new.js")
