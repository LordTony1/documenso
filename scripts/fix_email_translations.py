
import sys

file_path = "packages/lib/translations/hr/web.po"

# Target specific msgids for replacement
replacements = {
    # Fix 1: "on behalf of" translation in invitation
    '{inviterName} on behalf of "{teamName}" has invited you to {0}<0/>"{documentName}"': 
    '{inviterName} u ime "{teamName}" vas je pozvao da {0}<0/>"{documentName}"',

    # Fix 2: Another variation of the invitation string
    '{inviterName} on behalf of "{teamName}" has invited you to {action} {documentName}':
    '{inviterName} u ime "{teamName}" vas je pozvao da {action} {documentName}',

    # Fix 3: Remove Documenso footer (ensure it's effectively empty)
    'This document was sent using <0>Documenso</0>.': ' ',
    
    # Fix 4: Fix "on behalf of" for generic inviter (if present)
    '{inviterName} on behalf of "{0}" has invited you to {recipientActionVerb} the document "{1}".':
    '{inviterName} u ime "{0}" vas je pozvao da {recipientActionVerb} dokument "{1}".'
}

# Context-aware replacement for "Sign" verb
# We need to find `msgid "Sign"` that is preceded by `msgctxt "Recipient role action verb"`
# and ensure it is set to "potpišete"

try:
    with open(file_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    new_lines = []
    i = 0
    updated_count = 0
    
    while i < len(lines):
        line = lines[i]
        
        # 1. Handle Context-Aware Verb "Sign"
        if line.strip() == 'msgctxt "Recipient role action verb"':
            new_lines.append(line)
            i += 1
            if i < len(lines) and lines[i].strip() == 'msgid "Sign"':
                new_lines.append(lines[i]) # msgid "Sign"
                i += 1
                if i < len(lines) and lines[i].startswith('msgstr'):
                    new_lines.append('msgstr "potpišete"\n') # Force correct form
                    updated_count += 1
                    i += 1
                    continue
        
        # 2. Handle Standard Replacements
        if line.startswith("msgid "):
            raw_content = line.strip()
            # Basic parsing of msgid "..."
            if raw_content.startswith('msgid "') and raw_content.endswith('"'):
                current_msgid = raw_content[7:-1]
                # Unescape quotes for matching
                clean_msgid = current_msgid.replace('\\"', '"')
                
                if clean_msgid in replacements:
                    new_lines.append(line)
                    i += 1
                    if i < len(lines) and lines[i].startswith('msgstr'):
                        # Apply translation with re-escaped quotes
                        trans = replacements[clean_msgid].replace('"', '\\"')
                        new_lines.append(f'msgstr "{trans}"\n')
                        updated_count += 1
                        i += 1
                        continue
        
        new_lines.append(line)
        i += 1

    with open(file_path, "w", encoding="utf-8") as f:
        f.writelines(new_lines)

    print(f"Updates applied. Modified approx {updated_count} entries.")

except Exception as e:
    print(f"Error: {e}")
