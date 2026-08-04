import json
import os

files = {
    'en': 'd:/Alparai/messages/en.json',
    'tr': 'd:/Alparai/messages/tr.json'
}

keys_en = {
    "nav_takedown": "Takedowns",
    "nav_ai_orchestrator": "AI Orchestrator",
    "nav_expert_analysis": "Expert Analysis",
    "nav_dual_channel": "Dual Channel Scoring",
    "nav_cron_health": "Cron Health",
    "nav_startup_health": "Startup Health",
    "nav_api_keys": "API Keys",
    "nav_settings": "Settings",
    "nav_codebase_hygiene": "Codebase Hygiene",
    "nav_modular_arch": "Modular Architecture"
}

keys_tr = {
    "nav_takedown": "Kaldırma Talepleri",
    "nav_ai_orchestrator": "AI Orkestratör",
    "nav_expert_analysis": "Uzman Analizi",
    "nav_dual_channel": "Çift Kanallı Skorlama",
    "nav_cron_health": "Cron Sağlığı",
    "nav_startup_health": "Sistem Sağlığı",
    "nav_api_keys": "API Anahtarları",
    "nav_settings": "Ayarlar",
    "nav_codebase_hygiene": "Kod Tabanı Hijyeni",
    "nav_modular_arch": "Modüler Mimari"
}

for lang, path in files.items():
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    if lang == 'en':
        data['admin'].update(keys_en)
    else:
        data['admin'].update(keys_tr)
        
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
