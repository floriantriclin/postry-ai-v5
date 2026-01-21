import os
from datetime import datetime

# 1. Configuration
output_dir = "docs"
output_file = "docs/structure.md"
# On liste les dossiers à ignorer
exclude = {'.git', 'node_modules', '.next', '__pycache__', 'venv'}

# 2. Création du dossier docs s'il n'existe pas
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# 3. Récupération des fichiers
file_list = []
for root, dirs, files in os.walk("."):
    # On filtre les dossiers à ignorer
    dirs[:] = [d for d in dirs if d not in exclude]
    
    for file in files:
        # On crée le chemin relatif
        rel_path = os.path.join(root, file)
        file_list.append(rel_path)

# 4. Écriture du fichier Markdown
with open(output_file, "w", encoding="utf-8") as f:
    f.write("# Structure du projet\n")
    f.write(f"Généré le : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
    f.write("```text\n")
    for item in sorted(file_list):
        f.write(f"{item}\n")
    f.write("```")

print(f"OK : {output_file} a été généré avec succès !")