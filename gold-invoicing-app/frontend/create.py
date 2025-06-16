import os

def read_selected_files():
    output_file = "console.txt"
    current_dir = os.getcwd()
    valid_extensions = {'.css', '.js','.jsx','.json', '.py'}

    with open(output_file, 'w', encoding='utf-8') as out_f:
        for foldername, subfolders, filenames in os.walk(current_dir):
            for filename in filenames:
                filepath = os.path.join(foldername, filename)

                # Skip the output file itself
                if os.path.abspath(filepath) == os.path.abspath(output_file):
                    continue

                # Check file extension
                _, ext = os.path.splitext(filename)
                if ext.lower() not in valid_extensions:
                    continue

                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        out_f.write(f"\n\n--- START OF FILE: {filepath} ---\n")
                        out_f.write(f.read())
                        out_f.write(f"\n--- END OF FILE: {filepath} ---\n")
                except Exception as e:
                    print(f"Skipping file {filepath}: {e}")

if __name__ == '__main__':
    read_selected_files()
    print("Done. All .css, .js, and .py files written to 'console.txt'.")