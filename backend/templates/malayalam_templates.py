"""Malayalam legal document templates (Unicode text)."""

def rental_agreement_ml(data: dict, stamp_value: int) -> str:
    return f"""
വാടക കരാർ (RENTAL AGREEMENT)

സ്റ്റാമ്പ് പേപ്പർ മൂല്യം: ₹{stamp_value}

ഈ വാടക കരാർ {data.get('start_date', '______')} ന് കേരളത്തിൽ ഒപ്പിടുന്നു.

കരാർ കക്ഷികൾ:

വീട്ടുടമ (LANDLORD):
പേര്    : {data.get('owner_name', '______')}
മേൽവിലാസം : {data.get('owner_address', '______')}

വാടകക്കാരൻ (TENANT):
പേര്    : {data.get('tenant_name', '______')}
മേൽവിലാസം : {data.get('tenant_address', '______')}

വസ്തുവിന്റെ വിലാസം:
{data.get('property_address', '______')}

നിബന്ധനകൾ:

1. വാടക: പ്രതിമാസ വാടക ₹{data.get('monthly_rent', '______')} ആണ്. എല്ലാ മാസവും 5-ന് മുമ്പ് നൽകണം.

2. ഡിപ്പോസിറ്റ്: ₹{data.get('deposit_amount', '______')} തുക സെക്യൂരിറ്റി ഡിപ്പോസിറ്റ് ആയി നൽകിയിട്ടുണ്ട്. കരാർ കാലാവധി തീർന്നാൽ ഇത് തിരിച്ചു നൽകും.

3. കാലാവധി: ഈ കരാർ {data.get('duration_months', '______')} മാസത്തേക്കാണ്. {data.get('start_date', '______')} മുതൽ ആരംഭിക്കും.

4. നോട്ടീസ് കാലം: കരാർ അവസാനിപ്പിക്കാൻ {data.get('notice_period', '1 മാസം')} മുൻകൂർ അറിയിപ്പ് നൽകണം.

5. മറ്റ് നിബന്ധനകൾ: വാടകക്കാരൻ വസ്തു നന്നായി സൂക്ഷിക്കണം. വൈദ്യുതി, വെള്ളം തുടങ്ങിയ ചാർജുകൾ വാടകക്കാരൻ വഹിക്കണം.

ഒപ്പുകൾ:

വീട്ടുടമ:                              വാടകക്കാരൻ:
_______________________                 _______________________
{data.get('owner_name', '____________')}           {data.get('tenant_name', '____________')}
തീയതി: ___________________             തീയതി: ___________________


സാക്ഷികൾ:

1. പേര്: {data.get('witness1_name', '________________________')}
   ഒപ്പ്: _______________________

2. പേര്: {data.get('witness2_name', '________________________')}
   ഒപ്പ്: _______________________

(₹{stamp_value} ന്റെ നോൺ-ജുഡീഷ്യൽ സ്റ്റാമ്പ് പേപ്പറിൽ തയ്യാറാക്കിയത്)
"""

def affidavit_ml(data: dict, stamp_value: int) -> str:
    return f"""
സത്യവാങ്മൂലം (AFFIDAVIT)

സ്റ്റാമ്പ് പേപ്പർ മൂല്യം: ₹{stamp_value}

ഞാൻ, {data.get('deponent_name', '______')}, പ്രായം {data.get('deponent_age', '______')} വയസ്സ്,
താമസസ്ഥലം: {data.get('deponent_address', '______')},
തിരിച്ചറിയൽ രേഖ: {data.get('deponent_id', '______')},

ഇതിനാൽ ആണ്ടുകൊണ്ടു സത്യം ചെയ്ത് പ്രഖ്യാപിക്കുന്നു:

ഉദ്ദേശം: {data.get('purpose', '______')}

പ്രസ്താവന:
{data.get('statement', '______')}

മേൽ പ്രസ്താവിച്ച കാര്യങ്ങൾ എന്റെ അറിവിലും വിശ്വാസത്തിലും ശരിയും സത്യവുമാണ്.

{data.get('place', '______')} ൽ {data.get('date', '______')} ന് സത്യം ചെയ്ത് ഒപ്പിടുന്നു.

                                        ഒപ്പ്:
                                        _______________________
                                        {data.get('deponent_name', '____________')}

എന്റെ മുന്നിൽ സത്യം ചെയ്തു:

_______________________
നോട്ടറി / ഓത്ത് കമ്മീഷണർ
സ്ഥലം: {data.get('place', '______')}
തീയതി: {data.get('date', '______')}


സാക്ഷികൾ:

1. പേര്: {data.get('witness1_name', '________________________')}
   ഒപ്പ്: _______________________

2. പേര്: {data.get('witness2_name', '________________________')}
   ഒപ്പ്: _______________________

(₹{stamp_value} ന്റെ നോൺ-ജുഡീഷ്യൽ സ്റ്റാമ്പ് പേപ്പറിൽ തയ്യാറാക്കിയത്)
"""

def generic_ml(doc_label: str, data: dict, stamp_value: int) -> str:
    lines = [f"{k.replace('_', ' ').title()}: {v}" for k, v in data.items()]
    return f"""
{doc_label} (Malayalam)

സ്റ്റാമ്പ് പേപ്പർ മൂല്യം: ₹{stamp_value}

വിശദാംശങ്ങൾ:
{''.join(chr(10) + l for l in lines)}

ഒപ്പ്:
_______________________          _______________________
ഒന്നാം കക്ഷി                      രണ്ടാം കക്ഷി

സാക്ഷി 1: {data.get('witness1_name', '______')}  ____________________
സാക്ഷി 2: {data.get('witness2_name', '______')}  ____________________
"""

TEMPLATE_MAP_ML = {
    "rental_agreement": rental_agreement_ml,
    "affidavit": affidavit_ml,
}
