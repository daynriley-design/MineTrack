import os
import re

def replace_in_file(path, target, replacement):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace(target, replacement)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# ToastContext.jsx
toast_path = 'src/contexts/ToastContext.jsx'
with open(toast_path, 'r', encoding='utf-8') as f:
    toast = f.read()
toast = toast.replace("import { createContext, useContext, useState, useEffect } from 'react';", "import React, { createContext, useContext, useState } from 'react';")
toast = "/* eslint-disable react-refresh/only-export-components */\n" + toast
with open(toast_path, 'w', encoding='utf-8') as f:
    f.write(toast)

# AuthContext.jsx
auth_path = 'src/contexts/AuthContext.jsx'
with open(auth_path, 'r', encoding='utf-8') as f:
    auth = f.read()
auth = "/* eslint-disable react-refresh/only-export-components */\n" + auth
with open(auth_path, 'w', encoding='utf-8') as f:
    f.write(auth)

# DashboardPage.jsx
dash_path = 'src/pages/DashboardPage.jsx'
replace_in_file(dash_path, "  MapPin, Activity, Truck, ShieldAlert,\n  Factory, DollarSign, TrendingUp, Package, Users\n} from 'lucide-react';", "  Activity, Truck, ShieldAlert,\n  TrendingUp, Package, Users\n} from 'lucide-react';")

# ModulePage.jsx
mod_path = 'src/components/ModulePage.jsx'
with open(mod_path, 'r', encoding='utf-8') as f:
    mod = f.read()
# Replace fetchItems with useCallback
mod = mod.replace("import { useState, useEffect } from 'react';", "import { useState, useEffect, useCallback } from 'react';")
mod = mod.replace("  const fetchItems = () => {", "  const fetchItems = useCallback(() => {")
mod = mod.replace("      .catch(console.error);\n  };", "      .catch(console.error);\n  }, [api]);")
mod = mod.replace("  useEffect(() => { fetchItems(); }, []);", "  useEffect(() => { fetchItems(); }, [fetchItems]);")
with open(mod_path, 'w', encoding='utf-8') as f:
    f.write(mod)

# MinerLayout.jsx
min_path = 'src/components/miner/MinerLayout.jsx'
replace_in_file(min_path, "  const { t, i18n } = useTranslation();", "  const { i18n } = useTranslation();")

# MinerHSE.jsx
hse_path = 'src/pages/miner/MinerHSE.jsx'
replace_in_file(hse_path, "import { useState } from 'react';", "")

# SupervisorAlerts.jsx
sup_path = 'src/pages/supervisor/SupervisorAlerts.jsx'
replace_in_file(sup_path, ".catch(e => {})", ".catch(() => {})")

# Layout.jsx
lay_path = 'src/components/Layout.jsx'
replace_in_file(lay_path, "import { LogOut, User, Bell, Settings, Menu, Globe } from 'lucide-react';", "import { LogOut, User, Menu, Globe } from 'lucide-react';")

