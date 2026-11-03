import re

path = r'c:\Users\DELL\OneDrive\Desktop\Enag-Partida-Contable\Enag-Partida-Contable\views\registro.html'
with open(path, 'r', encoding='utf-8') as f:
    data = f.read()

# Replace envelope emoji line entirely to be safe
data = re.sub(r'<span class="input-icon">.*?</span>\s*<input type="email"', '<span class="input-icon">📧</span>\n                        <input type="email"', data)

# Replace 'Departamento / <anything>rea' with 'Departamento / Área'
data = re.sub(r'Departamento \/ .*?rea', 'Departamento / Área', data)

with open(path, 'w', encoding='utf-8') as f:
    f.write(data)

print("Fixed registro.html using python")
