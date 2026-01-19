
import sys

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
    "Back": "Natrag",
    
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

    # ICU Strings
    ".PDF documents accepted (max {APP_DOCUMENT_UPLOAD_SIZE_LIMIT}MB)": "Prihvaćaju se .PDF dokumenti (maks. {APP_DOCUMENT_UPLOAD_SIZE_LIMIT}MB)",
    "\"{0}\" will appear on the document as it has a timezone of \"{1}\".": "\"{0}\" će se pojaviti na dokumentu jer ima vremensku zonu \"{1}\".",
    "\"{documentName}\" has been deleted by an admin.": "Admin je izbrisao dokument \"{documentName}\".",
    "“{documentName}” has been signed": "Dokument „{documentName}” je potpisan",
    "“{documentName}” was signed by all signers": "Dokument „{documentName}” su potpisali svi potpisnici",
    "\"{documentTitle}\" has been successfully deleted": "\"{documentTitle}\" je uspješno izbrisan",
    "\"{placeholderEmail}\" on behalf of \"Team Name\" has invited you to sign \"example document\".": "\"{placeholderEmail}\" u ime tima \"Team Name\" vas je pozvao da potpišete \"example document\".",
    "\"Team Name\" has invited you to sign \"example document\".": "\"Team Name\" vas je pozvao da potpišete \"example document\".",
    "{0, plural, one {(1 character over)} other {(# characters over)}}": "{0, plural, one {(# znak više)} few {(# znaka više)} other {(# znakova više)}}",
    "{0, plural, one {{1} of # row selected.} other {{2} of # rows selected.}}": "{0, plural, one {{1} od # redak odabran.} few {{2} od # retka odabrano.} other {{2} od # redaka odabrano.}}",
    "{0, plural, one {# character over the limit} other {# characters over the limit}}": "{0, plural, one {# znak preko ograničenja} few {# znaka preko ograničenja} other {# znakova preko ograničenja}}",
    "{0, plural, one {# character remaining} other {# characters remaining}}": "{0, plural, one {Preostao je # znak} few {Preostala su # znaka} other {Preostalo je # znakova}}",
    "{0, plural, one {# document} other {# documents}}": "{0, plural, one {# dokument} few {# dokumenta} other {# dokumenata}}",
    "{0, plural, one {# Event} other {# Events}}": "{0, plural, one {# Događaj} few {# Događaja} other {# Događaja}}",
    "{0, plural, one {# field} other {# fields}}": "{0, plural, one {# polje} few {# polja} other {# polja}}",
    "{0, plural, one {# folder} other {# folders}}": "{0, plural, one {# mapa} few {# mape} other {# mapa}}",
    "{0, plural, one {# recipient have been added from AI detection.} other {# recipients have been added from AI detection.}}": "{0, plural, one {# primatelj je dodan putem AI detekcije.} few {# primatelja je dodano putem AI detekcije.} other {# primatelja je dodano putem AI detekcije.}}",
    "{0, plural, one {# recipient} other {# recipients}}": "{0, plural, one {# primatelj} few {# primatelja} other {# primatelja}}",
    "{0, plural, one {# Recipient} other {# Recipients}}": "{0, plural, one {# Primatelj} few {# Primatelja} other {# Primatelja}}",
    "{0, plural, one {# team} other {# teams}}": "{0, plural, one {# tim} few {# tima} other {# timova}}",
    "{0, plural, one {# template} other {# templates}}": "{0, plural, one {# predložak} few {# predloška} other {# predložaka}}",
    "{0, plural, one {<0>You have <1>1</1> pending invitation</0>} other {<2>You have <3>#</3> pending invitations</2>}}": "{0, plural, one {<0>Imate <1>1</1> pozivnicu na čekanju</0>} few {<2>Imate <3>#</3> pozivnice na čekanju</2>} other {<2>Imate <3>#</3> pozivnica na čekanju</2>}}",
    "{0, plural, one {1 Field Remaining} other {# Fields Remaining}}": "{0, plural, one {Preostalo je 1 polje} few {Preostala su # polja} other {Preostalo je # polja}}",
    "{0, plural, one {1 Field} other {# Fields}}": "{0, plural, one {1 polje} few {# polja} other {# polja}}",
    "{0, plural, one {1 matching field} other {# matching fields}}": "{0, plural, one {1 odgovarajuće polje} few {# odgovarajuća polja} other {# odgovarajućih polja}}",
    "{0, plural, one {1 Recipient} other {# Recipients}}": "{0, plural, one {1 Primatelj} few {# Primatelja} other {# Primatelja}}",
    "{0, plural, one {Page {1} of {2} - # field found} other {Page {3} of {4} - # fields found}}": "{0, plural, one {Stranica {1} od {2} - pronađeno # polje} few {Stranica {3} od {4} - pronađena # polja} other {Stranica {3} od {4} - pronađeno # polja}}",
    "{0, plural, one {Page {1} of {2} - # recipient found} other {Page {3} of {4} - # recipients found}}": "{0, plural, one {Stranica {1} od {2} - pronađen # primatelj} few {Stranica {3} od {4} - pronađena # primatelja} other {Stranica {3} od {4} - pronađeno # primatelja}}",
    "{0, plural, one {Recipient added} other {Recipients added}}": "{0, plural, one {Primatelj dodan} few {Primatelji dodani} other {Primatelji dodani}}",
    "{0, plural, one {Waiting on 1 recipient} other {Waiting on # recipients}}": "{0, plural, one {Čeka se 1 primatelja} few {Čeka se # primatelja} other {Čeka se # primatelja}}",
    "{0, plural, one {We found # field in your document.} other {We found # fields in your document.}}": "{0, plural, one {Pronašli smo # polje u vašem dokumentu.} few {Pronašli smo # polja u vašem dokumentu.} other {Pronašli smo # polja u vašem dokumentu.}}",
    "{0, plural, one {We found # recipient in your document.} other {We found # recipients in your document.}}": "{0, plural, one {Pronašli smo # primatelja u vašem dokumentu.} few {Pronašli smo # primatelja u vašem dokumentu.} other {Pronašli smo # primatelja u vašem dokumentu.}}",
    "{0}": "{0}",
    "{0} couldn't be uploaded:": "{0} nije bilo moguće prenijeti:",
    "{0} direct signing templates": "{0} predložaka za izravno potpisivanje",
    "{0} has invited you to {recipientActionVerb} the document \"{1}\".": "{0} vas je pozvao da {recipientActionVerb} dokument \"{1}\".",
    "{0} invited you to {recipientActionVerb} a document": "{0} vas je pozvao da {recipientActionVerb} dokument",
    "{0} of {1} documents remaining this month.": "Preostalo je {0} od {1} dokumenata ovog mjeseca.",
    "{0} on behalf of \"{1}\" has invited you to {recipientActionVerb} the document \"{2}\".": "{0} u ime \"{1}\" vas je pozvao da {recipientActionVerb} dokument \"{2}\".",
    "{0} Teams": "{0} timova",
    "{browserInfo} on {os}": "{browserInfo} na {os}",
    "{charactersRemaining, plural, one {1 character remaining} other {{charactersRemaining} characters remaining}}": "{charactersRemaining, plural, one {Preostao je 1 znak} few {Preostala su {charactersRemaining} znaka} other {Preostalo je {charactersRemaining} znakova}}",
    "{expiresInMinutes, plural, one {This code will expire in # minute.} other {This code will expire in # minutes.}}": "{expiresInMinutes, plural, one {Ovaj kod istječe za # minutu.} few {Ovaj kod istječe za # minute.} other {Ovaj kod istječe za # minuta.}}",
    "{inviterName} <0>({inviterEmail})</0>": "{inviterName} <0>({inviterEmail})</0>",
    "{inviterName} has cancelled the document {documentName}, you don't need to sign it anymore.": "{inviterName} je otkazao dokument {documentName}, više ga ne morate potpisati.",
    "{inviterName} has cancelled the document<0/>\"{documentName}\"": "{inviterName} je otkazao dokument<0/>\"{documentName}\"",
    "{inviterName} has invited you to {0}<0/>\"{documentName}\"": "{inviterName} vas je pozvao da {0}<0/>\"{documentName}\"",
    "{inviterName} has invited you to {action} {documentName}": "{inviterName} vas je pozvao da {action} {documentName}",

    # HTML/Complex Strings
    "<0>\"{0}\"</0>is no longer available to sign": "<0>\"{0}\"</0>više nije dostupan za potpisivanje",
    "<0>{organisationName}</0> has requested to create an account on your behalf.": "<0>{organisationName}</0> je zatražio stvaranje računa u vaše ime.",
    "<0>{organisationName}</0> has requested to link your current Documenso account to their organisation.": "<0>{organisationName}</0> je zatražio povezivanje vašeg trenutnog Documenso računa s njihovom organizacijom.",
    "<0>{senderName} {senderEmail}</0> has invited you to approve this document": "<0>{senderName} {senderEmail}</0> vas je pozvao/la da odobrite ovaj dokument",
    "<0>{senderName} {senderEmail}</0> has invited you to assist this document": "<0>{senderName} {senderEmail}</0> vas je pozvao/la da asistirate na ovom dokumentu",
    "<0>{senderName} {senderEmail}</0> has invited you to sign this document": "<0>{senderName} {senderEmail}</0> vas je pozvao/la da potpišete ovaj dokument",
    "<0>{senderName} {senderEmail}</0> has invited you to view this document": "<0>{senderName} {senderEmail}</0> vas je pozvao/la da pregledate ovaj dokument",
    "<0>{senderName} {senderEmail}</0> on behalf of \"{0}\" has invited you to approve this document": "<0>{senderName} {senderEmail}</0> u ime \"{0}\" vas je pozvao/la da odobrite ovaj dokument",
    "<0>{senderName} {senderEmail}</0> on behalf of \"{0}\" has invited you to assist this document": "<0>{senderName} {senderEmail}</0> u ime \"{0}\" vas je pozvao/la da asistirate na ovom dokumentu",
    "<0>{senderName} {senderEmail}</0> on behalf of \"{0}\" has invited you to sign this document": "<0>{senderName} {senderEmail}</0> u ime \"{0}\" vas je pozvao/la da potpišete ovaj dokument",
    "<0>{senderName} {senderEmail}</0> on behalf of \"{0}\" has invited you to view this document": "<0>{senderName} {senderEmail}</0> u ime \"{0}\" vas je pozvao/la da pregledate ovaj dokument",
    "<0>{teamName}</0> has requested to use your email address for their team on Documenso.": "<0>{teamName}</0> je zatražio korištenje vaše adrese e-pošte za svoj tim na Documensu.",
    "<0>Account management:</0> Modify your account settings, permissions, and preferences": "<0>Upravljanje računom:</0> Izmijenite postavke računa, dozvole i postavke",
    "<0>Admins only</0> - Only admins can access and view the document": "<0>Samo administratori</0> - Samo administratori mogu pristupiti i pregledati dokument",
    "<0>Data access:</0> Access all data associated with your account": "<0>Pristup podacima:</0> Pristup svim podacima povezanim s vašim računom",
    "<0>Drawn</0> - A signature that is drawn using a mouse or stylus.": "<0>Nacrtan</0> - Potpis koji se crta mišem ili olovkom.",
    "<0>Email</0> - The recipient will be emailed the document to sign, approve, etc.": "<0>E-pošta</0> - Primatelj će e-poštom dobiti dokument za potpisivanje, odobravanje itd.",
    "<0>Events:</0> All": "<0>Događaji:</0> Sve",
    "<0>Everyone</0> - Everyone can access and view the document": "<0>Svi</0> - Svi mogu pristupiti i pregledati dokument",
    "<0>Full account access:</0> View all your profile information, settings, and activity": "<0>Potpuni pristup računu:</0> Pregled svih informacija o profilu, postavkama i aktivnostima",
    "<0>Inherit authentication method</0> - Use the global action signing authentication method configured in the \"General Settings\" step": "<0>Naslijedi metodu autentifikacije</0> - Koristite globalnu metodu autentifikacije za potpisivanje konfiguriranu u koraku \"Opće postavke\"",
    "<0>Managers and above</0> - Only managers and above can access and view the document": "<0>Voditelji i iznad</0> - Samo voditelji i osobe na višem položaju mogu pristupiti i pregledati dokument",
    "<0>No restrictions</0> - No authentication required": "<0>Bez ograničenja</0> - Autentifikacija nije potrebna",
    "<0>No restrictions</0> - The document can be accessed directly by the URL sent to the recipient": "<0>Bez ograničenja</0> - Dokumentu se može pristupiti izravno putem URL-a poslanog primatelju",
    "<0>None</0> - No authentication required": "<0>Nema</0> - Autentifikacija nije potrebna",
    "<0>None</0> - We will generate links which you can send to the recipients manually.": "<0>Nema</0> - Generirat ćemo poveznice koje možete ručno poslati primateljima.",
    "<0>Note</0> - If you use Links in combination with direct templates, you will need to manually send the links to the remaining recipients.": "<0>Napomena</0> - Ako koristite poveznice u kombinaciji s izravnim predlošcima, morat ćete ručno poslati poveznice preostalim primateljima.",
    "<0>Require 2FA</0> - The recipient must have an account and 2FA enabled via their settings": "<0>Zahtijevaj 2FA</0> - Primatelj mora imati račun i omogućenu dvofaktorsku autentifikaciju (2FA) putem svojih postavki",
    "<0>Require account</0> - The recipient must be signed in to view the document": "<0>Zahtijevaj račun</0> - Primatelj mora biti prijavljen za pregled dokumenta",
    "<0>Require passkey</0> - The recipient must have an account and passkey configured via their settings": "<0>Zahtijevaj pristupni ključ</0> - Primatelj mora imati račun i konfiguriran pristupni ključ putem svojih postavki",
    "<0>Require password</0> - The recipient must have an account and password configured via their settings, the password will be verified during signing": "<0>Zahtijevaj lozinku</0> - Primatelj mora imati račun i konfiguriranu lozinku putem svojih postavki, lozinka će biti provjerena tijekom potpisivanja",
    "<0>Sender:</0> All": "<0>Pošiljatelj:</0> Svi",
    "<0>Typed</0> - A signature that is typed using a keyboard.": "<0>Utipkana</0> - Potpis koji se upisuje pomoću tipkovnice.",
    "<0>Uploaded</0> - A signature that is uploaded from a file.": "<0>Učitana</0> - Potpis koji se učitava iz datoteke.",
    "0 Free organisations left": "0 besplatnih organizacija preostalo",
    "1 Free organisations left": "1 besplatna organizacija preostala",
    "1 month": "1 mjesec",
    "12 months": "12 mjeseci",
    "2FA": "2FA",
    "2FA Reset": "2FA resetiranje",
    "3 months": "3 mjeseca",
    "400 Error": "400 Greška",
    "401 Unauthorized": "401 Neovlašteno",
    "404 Document not found": "404 Dokument nije pronađen",
    "404 Email domain not found": "404 Domena e-pošte nije pronađena",
    "404 not found": "404 nije pronađeno",
    "404 Not found": "404 Nije pronađeno",
    "404 Not Found": "404 Nije pronađeno",
    "404 Organisation group not found": "404 Grupa organizacija nije pronađena",
    "404 Organisation not found": "404 Organizacija nije pronađena",
    "404 Profile not found": "404 Profil nije pronađen",
    "404 Team not found": "404 Tim nije pronađen",
    "404 Template not found": "404 Predložak nije pronađen",
    "404 User not found": "404 Korisnik nije pronađen",
    "404 Webhook not found": "404 Webhook nije pronađen",
    "5 documents a month": "5 dokumenata mjesečno",
    "5 Documents a month": "5 dokumenata mjesečno",
    "500 Internal Server Error": "500 Interna pogreška poslužitelja",
    "6 months": "6 mjeseci",
    "7 days": "7 dana",
    "A confirmation email has been sent, and it should arrive in your inbox shortly.": "E-mail za potvrdu je poslan i trebao bi uskoro stići u vašu pristiglu poštu.",
    "A device capable of accessing, opening, and reading documents": "Uređaj sposoban za pristup, otvaranje i čitanje dokumenata",
    "A document was created by your direct template that requires you to {recipientActionVerb} it.": "Vaš izravni predložak kreirao je dokument koji zahtijeva da ga {recipientActionVerb}.",
    "A draft document will be created": "Bit će kreiran nacrt dokumenta",
    "A field was added": "Polje je dodano",
    "A field was removed": "Polje je uklonjeno",
    "A field was updated": "Polje je ažurirano",
    "A means to print or download documents for your records": "Sredstvo za ispis ili preuzimanje dokumenata za vašu evidenciju",
    "A member has joined your organisation on Documenso": "Član se pridružio vašoj organizaciji na Documensu",
    "A member has left your organisation": "Član je napustio vašu organizaciju",
    "A member has left your organisation {organisationName}": "Član je napustio vašu organizaciju {organisationName}",
    "A member has left your organisation on Documenso": "Član je napustio vašu organizaciju na Documensu",
    "A new member has joined your organisation": "Novi član se pridružio vašoj organizaciji",
    "A new member has joined your organisation {organisationName}": "Novi član se pridružio vašoj organizaciji {organisationName}",
    "A new token was created successfully.": "Novi token je uspješno kreiran.",
    "A password reset email has been sent, if you have an account you should see it in your inbox shortly.": "Poslan je e-mail za ponovno postavljanje lozinke, ako imate račun trebali biste ga uskoro vidjeti u svojoj pristigloj pošti.",
    "A recipient was added": "Primatelj je dodan",
    "A recipient was removed": "Primatelj je uklonjen",
    "A recipient was updated": "Primatelj je ažuriran",
    "A request has been made to create an account for you": "Podnesen je zahtjev za stvaranje računa za vas",
    "A request has been made to link your Documenso account": "Podnesen je zahtjev za povezivanje vašeg Documenso računa",
    "A request to use your email has been initiated by {0} on Documenso": "Zahtjev za korištenje vaše e-pošte pokrenuo je {0} na Documensu",
    "A secret that will be sent to your URL so you can verify that the request has been sent by Documenso.": "Tajna koja će biti poslana na vaš URL kako biste mogli potvrditi da je zahtjev poslao Documenso.",
    "A stable internet connection": "Stabilna internetska veza",
    "A team you were a part of has been deleted": "Tim čiji ste bili dio je izbrisan",
    "A unique URL to access your profile": "Jedinstveni URL za pristup vašem profilu",
    "A unique URL to identify the organisation": "Jedinstveni URL za identifikaciju organizacije",
    "A unique URL to identify your organisation": "Jedinstveni URL za identifikaciju vaše organizacije",
    "A unique URL to identify your team": "Jedinstveni URL za identifikaciju vašeg tima",
    "A verification email will be sent to the provided email.": "E-mail za provjeru bit će poslan na navedenu e-adresu.",
    "Accept": "Prihvati",

    # Long strings requiring exact match
    "By proceeding with your electronic signature, you acknowledge and consent that it will be used to sign the given document and holds the same legal validity as a handwritten signature. By completing the electronic signing process, you affirm your understanding and acceptance of these conditions.": 
    "Nastavkom s elektroničkim potpisom potvrđujete i pristajete da će se koristiti za potpisivanje ovog dokumenta te da ima istu pravnu valjanost kao i vlastoručni potpis. Dovršetkom procesa elektroničkog potpisivanja potvrđujete razumijevanje i prihvaćanje ovih uvjeta."
}

file_path = "packages/lib/translations/hr/web.po"

print(f"Starting translation update for {file_path}...", flush=True)

try:
    with open(file_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    new_lines = []
    i = 0
    updated_count = 0
    
    while i < len(lines):
        line = lines[i]
        
        if line.startswith("msgid "):
            # Careful parsing
            raw_content = line.strip()
            # Expect msgid "..."
            if raw_content.startswith('msgid "') and raw_content.endswith('"'):
                current_msgid = raw_content[7:-1]
                
                new_lines.append(line)
                i += 1
                
                if i < len(lines):
                    next_line = lines[i]
                    # Check for empty msgstr
                    if next_line.strip() == 'msgstr ""':
                        if current_msgid in translations:
                            # Write translation
                            new_lines.append(f'msgstr "{translations[current_msgid]}"\n')
                            updated_count += 1
                        else:
                            new_lines.append(next_line)
                    else:
                        new_lines.append(next_line)
                    i += 1
                else:
                    # End of file reached
                    pass
            else:
                 # Multiline msgid or different format
                 new_lines.append(line)
                 i += 1
        else:
            new_lines.append(line)
            i += 1

    with open(file_path, "w", encoding="utf-8") as f:
        f.writelines(new_lines)
        
    print(f"FINISHED. Successfully updated {updated_count} translations.", flush=True)

except Exception as e:
    print(f"Error: {e}", flush=True)
