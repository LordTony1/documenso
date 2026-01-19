
import sys

file_path = "packages/lib/translations/hr/web.po"

replacements = {
    # UI Elements from Screenshot
    'Sign Document': 'Potpiši dokument',
    'Sign Documents': 'Potpiši dokumente',
    '1 Field Remaining': 'Preostalo je 1 polje',
    'Next Field': 'Sljedeće polje',
    'Full Name': 'Puno ime',
    'Download PDF': 'Preuzmi PDF',
    'Reject Document': 'Odbij dokument',
    'Return': 'Povratak',
    
    # Email Content
    'Continue by signing the document.': 'Nastavite s potpisivanjem dokumenta.',
    
    # Email Variations - Addressing the specific "potpišete the document" issue
    '{inviterName} on behalf of "{0}" has invited you to {recipientActionVerb} the document "{1}".': 
    '{inviterName} u ime "{0}" vas je pozvao da {recipientActionVerb} dokument "{1}".',
    
    '{0} on behalf of "{1}" has invited you to {recipientActionVerb} the document "{2}".':
    '{0} u ime "{1}" vas je pozvao da {recipientActionVerb} dokument "{2}".',

    '{0} has invited you to {recipientActionVerb} the document "{1}".':
    '{0} vas je pozvao da {recipientActionVerb} dokument "{1}".'
}

try:
    with open(file_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    new_lines = []
    i = 0
    updated_count = 0
    
    while i < len(lines):
        line = lines[i]
        
        if line.startswith("msgid "):
            raw_content = line.strip()
            if raw_content.startswith('msgid "') and raw_content.endswith('"'):
                current_msgid = raw_content[7:-1]
                # Unescape for matching
                clean_msgid = current_msgid.replace('\\"', '"')
                
                if clean_msgid in replacements:
                    new_lines.append(line)
                    i += 1
                    # Skip existing msgstr if present
                    if i < len(lines) and lines[i].startswith('msgstr'):
                         # Re-escape for writing
                        trans = replacements[clean_msgid].replace('"', '\\"')
                        new_lines.append(f'msgstr "{trans}"\n')
                        updated_count += 1
                        i += 1
                        continue
        
        new_lines.append(line)
        i += 1

    with open(file_path, "w", encoding="utf-8") as f:
        f.writelines(new_lines)
        
    print(f"Applied {updated_count} translation fixes.")

except Exception as e:
    print(f"Error: {e}")
