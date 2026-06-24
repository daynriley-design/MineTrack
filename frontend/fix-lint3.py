import os
import re

def replace_in_file(path, target, replacement):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace(target, replacement)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# MinerLayout.jsx
min_path = 'src/components/miner/MinerLayout.jsx'
replace_in_file(min_path, "  const { i18n } = useTranslation();\n", "")

# ToastContext.jsx
toast_path = 'src/contexts/ToastContext.jsx'
replace_in_file(toast_path, "import { createContext, useContext, useState, useEffect } from 'react';", "import React, { createContext, useContext, useState } from 'react';")

# ModulePage.jsx
mod_path = 'src/components/ModulePage.jsx'
with open(mod_path, 'r', encoding='utf-8') as f:
    mod = f.read()
mod = mod.replace("    // eslint-disable-next-line react-hooks/exhaustive-deps\n    fetchItems();\n  }, []);", "    // eslint-disable-next-line react-hooks/exhaustive-deps\n    // fetchItems();\n    api.get(`/${apiPath}`).then(res => setItems(res.data)).catch(console.error);\n  }, [api, apiPath]);")
mod = mod.replace("  // eslint-disable-next-line react-hooks/exhaustive-deps\n  // fetchItems();\n  api.get(`/${apiPath}`).then(res => setItems(res.data)).catch(console.error);\n}, [api, apiPath]);", "  // eslint-disable-next-line react-hooks/exhaustive-deps\n  api.get(`/${apiPath}`).then(res => setItems(res.data)).catch(console.error);\n}, [api, apiPath]);")

with open(mod_path, 'w', encoding='utf-8') as f:
    f.write(mod)

# SupervisorAlerts.jsx
sup_path = 'src/pages/supervisor/SupervisorAlerts.jsx'
replace_in_file(sup_path, ".catch(() => {})", ".catch(console.error)")
