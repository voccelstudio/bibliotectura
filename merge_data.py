import json
import os

data_dir = 'data'

def merge_files(base_file, extra_file):
    base_path = os.path.join(data_dir, base_file)
    extra_path = os.path.join(data_dir, extra_file)
    
    if os.path.exists(base_path) and os.path.exists(extra_path):
        print(f"Merging {base_file} and {extra_file}")
        try:
            with open(base_path, 'r', encoding='utf-8') as f:
                base_data = json.load(f)
            with open(extra_path, 'r', encoding='utf-8') as f:
                extra_data = json.load(f)
                
            if isinstance(base_data, list) and isinstance(extra_data, list):
                existing_ids = {item.get('id') for item in base_data if 'id' in item}
                for item in extra_data:
                    if item.get('id') not in existing_ids:
                        base_data.append(item)
                        existing_ids.add(item.get('id'))
                    else:
                        print(f"- Duplicate ID skipped: {item.get('id')}")
                        
                with open(base_path, 'w', encoding='utf-8') as f:
                    json.dump(base_data, f, indent=2, ensure_ascii=False)
                print(f"- Wrote {len(base_data)} items to {base_file}")
                
                # Cleanup extra file
                os.remove(extra_path)
            else:
                print(f"Skipping {base_file} - content is not a list")
                
        except Exception as e:
            print(f"Error merging {base_file}: {e}")

merge_files('estilos.json', 'estilos-extra.json')
merge_files('interiores.json', 'interiores-extra.json')
merge_files('materiales.json', 'materiales-extra.json')

print("Merge completed.")
