import re

with open('src/components/CentralSecuritySettings.tsx', 'r') as f:
    content = f.read()

replacements = {
    r'bg-white': 'bg-white dark:bg-[#0a1930]',
    r'bg-slate-50\b': 'bg-slate-50 dark:bg-slate-900',
    r'bg-slate-100\b': 'bg-slate-100 dark:bg-slate-800',
    r'text-slate-900\b': 'text-slate-900 dark:text-white',
    r'text-slate-800\b': 'text-slate-800 dark:text-slate-200',
    r'text-slate-700\b': 'text-slate-700 dark:text-slate-300',
    r'text-slate-600\b': 'text-slate-600 dark:text-slate-400',
    r'text-slate-500\b': 'text-slate-500 dark:text-slate-400',
    r'border-slate-300\b': 'border-slate-300 dark:border-slate-700',
    r'border-slate-200\b': 'border-slate-200 dark:border-slate-700',
    r'border-slate-100\b': 'border-slate-100 dark:border-slate-800',
    r'border-b-2 border-amber-500': 'border-b-2 border-amber-500 dark:border-amber-600',
}

for old, new in replacements.items():
    content = re.sub(old, new, content)

with open('src/components/CentralSecuritySettings.tsx', 'w') as f:
    f.write(content)
