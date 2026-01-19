
import re

translations = {
    # Navigation & General
    "Documents": "Dokumenti",
    "Templates": "Predlošci",
    "Settings": "Postavke",
    "Log out": "Odjava",
    "Sign out": "Odjava",
    "Profile": "Profil",
    "Dashboard": "Nadzorna ploča",
    "Create Template": "Izradi predložak",
    "Upload Document": "Učitaj dokument",
    "Subject": "Predmet",
    "Message": "Poruka",
    "Send": "Pošalji",
    "Share": "Podijeli",
    "My Documents": "Moji dokumenti",
    "Team": "Tim",
    "Teams": "Timovi",
    "Billing": "Naplata",
    "Users": "Korisnici",
    
    # Signing Interface - Actions
    "Review and sign": "Pregledaj i potpiši",
    "Sign": "Potpiši",
    "Complete": "Završi",
    "Finish": "Dovrši",
    "Decline": "Odbij",
    "Reject": "Odbij",
    "Adopt and Sign": "Usvoji i potpiši",
    "Adopt and sign": "Usvoji i potpiši",
    "Clear": "Očisti",
    "Cancel": "Odustani",
    "Save": "Spremi",
    "Insert": "Umetni",
    "Edit": "Uredi",
    "Delete": "Obriši",
    "Download": "Preuzmi",
    "Print": "Ispiši",
    
    # Signing Interface - Fields & Tabs
    "Signature": "Potpis",
    "Initials": "Inicijali",
    "Type": "Tipkanje",
    "Draw": "Crtanje",
    "Upload": "Učitavanje",
    "Name": "Ime",
    "Email": "E-pošta",
    "Date": "Datum",
    "Text": "Tekst",
    "Checkbox": "Potvrdni okvir",
    "Radio Group": "Radio gumb",
    "Dropdown": "Padajući izbornik",
    
    # Statuses
    "Waiting for you": "Čeka na vas",
    "Completed": "Dovršeno",
    "Rejected": "Odbijeno",
    "Draft": "Nacrt",
    "Pending": "Na čekanju",
    "Archived": "Arhivirano",
    
    # Emails & Notifications
    "Please sign this document": "Molimo potpišite ovaj dokument",
    "You have been invited to sign a document": "Pozvani ste da potpišete dokument",
    "View Document": "Prikaži dokument",
    "View Document to sign": "Prikaži dokument za potpis",
    "View Document to approve": "Prikaži dokument za odobrenje",
    "View Document to assist": "Prikaži dokument za pomoć",
    "Document signed": "Dokument je potpisan",
    
    # Legal & Misc
    "I agree to the terms": "Prihvaćam uvjete",
    "(You)": "(Vi)",
    "Required": "Obavezno",
    "Optional": "Neobavezno",
    "Actions": "Radnje",
    "Recipient": "Primatelj",
    "Recipients": "Primatelji",
    "Add Recipient": "Dodaj primatelja",
}

# Long strings requiring exact match
long_strings = {
    "By proceeding with your electronic signature, you acknowledge and consent that it will be used to sign the given document and holds the same legal validity as a handwritten signature. By completing the electronic signing process, you affirm your understanding and acceptance of these conditions.": 
    "Nastavkom s elektroničkim potpisom potvrđujete i pristajete da će se koristiti za potpisivanje ovog dokumenta te da ima istu pravnu valjanost kao i vlastoručni potpis. Dovršetkom procesa elektroničkog potpisivanja potvrđujete razumijevanje i prihvaćanje ovih uvjeta."
}

translations.update(long_strings)

file_path = "packages/lib/translations/hr/web.po"

try:
    with open(file_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    new_lines = []
    i = 0
    updated_count = 0
    
    while i < len(lines):
        line = lines[i]
        
        # Check for msgid
        if line.startswith("msgid "):
            current_msgid = line.strip()[7:-1] # Remove "msgid " and quotes
            
            # Flush simple msgid
            new_lines.append(line)
            i += 1
            
            # Handle empty msgstr
            if i < len(lines) and lines[i].startswith('msgstr ""'):
                # Check if we have a translation
                if current_msgid in translations:
                    new_lines.append(f'msgstr "{translations[current_msgid]}"\n')
                    updated_count += 1
                else:
                    new_lines.append(lines[i])
                i += 1
            else:
                 # Logic for multiline msgstr or filled msgstr would go here, 
                 # but for now we assume standard empty msgstr "" follows msgid
                 pass
        else:
            new_lines.append(line)
            i += 1

    with open(file_path, "w", encoding="utf-8") as f:
        f.writelines(new_lines)
        
    print(f"Successfully updated {updated_count} translations.")

except Exception as e:
    print(f"Error: {e}")
