import os
import glob

def clean_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove `import React from 'react';` or `import React, { ... } from 'react';`
    lines = content.split('\n')
    new_lines = []
    for line in lines:
        if line.startswith("import React from 'react';"):
            continue
        if line.startswith("import React,"):
            # keep the destructured parts
            part = line.split("import React,")[1]
            # it might be `import React, { useState } from 'react';`
            line = "import" + part
        new_lines.append(line)

    with open(path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(new_lines))

for path in glob.glob('src/**/*.jsx', recursive=True):
    clean_file(path)

# Special fix for SupervisorAlerts.jsx
alerts_path = 'src/pages/supervisor/SupervisorAlerts.jsx'
with open(alerts_path, 'r', encoding='utf-8') as f:
    alerts_content = f.read()

if "const fetchAlerts = () => {" in alerts_content:
    import re
    # move fetchAlerts before useEffect
    match = re.search(r'(  const fetchAlerts = \(\) => \{.*?\n  \};\n\n)', alerts_content, re.DOTALL)
    if match:
        func = match.group(1)
        alerts_content = alerts_content.replace(func, '')
        alerts_content = alerts_content.replace('  useEffect(() => {', func + '  useEffect(() => {')
        
        with open(alerts_path, 'w', encoding='utf-8') as f:
            f.write(alerts_content)
