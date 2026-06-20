"""Legal document templates – English versions."""

from datetime import datetime

def rental_agreement_en(data: dict, stamp_value: int) -> str:
    return f"""
RENTAL AGREEMENT

This Rental Agreement is executed on {data.get('start_date', '______')} at Kerala, India.

STAMP PAPER VALUE: ₹{stamp_value}

BETWEEN:

OWNER / LANDLORD:
Name    : {data.get('owner_name', '______')}
Address : {data.get('owner_address', '______')}
(Hereinafter referred to as "the Landlord")

AND

TENANT:
Name    : {data.get('tenant_name', '______')}
Address : {data.get('tenant_address', '______')}
(Hereinafter referred to as "the Tenant")

PROPERTY DETAILS:
The Landlord agrees to let out the property situated at:
{data.get('property_address', '______')}

TERMS AND CONDITIONS:

1. RENT: The monthly rent payable shall be ₹{data.get('monthly_rent', '______')} (Rupees {data.get('monthly_rent', '______')} Only), payable on or before the 5th of every month.

2. SECURITY DEPOSIT: The Tenant has paid a refundable security deposit of ₹{data.get('deposit_amount', '______')} (Rupees {data.get('deposit_amount', '______')} Only), which shall be returned at the end of the tenancy after deducting any dues.

3. DURATION: This agreement is for a period of {data.get('duration_months', '______')} months, commencing from {data.get('start_date', '______')}.

4. NOTICE PERIOD: Either party shall give {data.get('notice_period', '1 month')} written notice for termination of this agreement.

5. MAINTENANCE: The Tenant shall maintain the property in good condition and shall not make any structural changes without prior written consent of the Landlord.

6. SUB-LETTING: The Tenant shall not sub-let or assign the premises without the Landlord's written consent.

7. UTILITIES: The Tenant shall bear all electricity, water, and other utility charges during the tenancy.

8. GOVERNING LAW: This agreement shall be governed by the laws of Kerala, India.

IN WITNESS WHEREOF, the parties hereto have signed this agreement on the day and year first above written.

LANDLORD:                               TENANT:
_______________________                 _______________________
{data.get('owner_name', '____________')}           {data.get('tenant_name', '____________')}
Date: ___________________               Date: ___________________


WITNESSES:

1. Name: {data.get('witness1_name', '________________________')}
   Signature: _______________________
   Date: ___________________________

2. Name: {data.get('witness2_name', '________________________')}
   Signature: _______________________
   Date: ___________________________

(This document is executed on non-judicial stamp paper of ₹{stamp_value})
"""

def affidavit_en(data: dict, stamp_value: int) -> str:
    return f"""
AFFIDAVIT

STAMP PAPER VALUE: ₹{stamp_value}

I, {data.get('deponent_name', '______')}, aged {data.get('deponent_age', '______')} years,
residing at {data.get('deponent_address', '______')},
holding {data.get('deponent_id', '______')},

do hereby solemnly affirm and declare as follows:

PURPOSE: {data.get('purpose', '______')}

STATEMENT:
{data.get('statement', '______')}

I further state that the facts stated above are true and correct to the best of my knowledge and belief, and nothing material has been concealed therefrom.

Solemnly affirmed at {data.get('place', '______')} on this {data.get('date', '______')}.

                                        DEPONENT:
                                        _______________________
                                        {data.get('deponent_name', '____________')}

Sworn before me,

_______________________
Notary Public / Oath Commissioner
Place: {data.get('place', '______')}
Date:  {data.get('date', '______')}


WITNESSES:

1. Name: {data.get('witness1_name', '________________________')}
   Signature: _______________________

2. Name: {data.get('witness2_name', '________________________')}
   Signature: _______________________

(Executed on non-judicial stamp paper of ₹{stamp_value})
"""

def power_of_attorney_en(data: dict, stamp_value: int) -> str:
    return f"""
POWER OF ATTORNEY

STAMP PAPER VALUE: ₹{stamp_value}

Know all men by these presents that I/We,

PRINCIPAL:
Name    : {data.get('principal_name', '______')}
Address : {data.get('principal_address', '______')}
ID No.  : {data.get('principal_id', '______')}

do hereby appoint and constitute:

AGENT / ATTORNEY:
Name    : {data.get('agent_name', '______')}
Address : {data.get('agent_address', '______')}
ID No.  : {data.get('agent_id', '______')}

as my/our true and lawful Attorney to act on my/our behalf.

POWERS GRANTED:
{data.get('powers_granted', '______')}

PROPERTY / ASSETS INVOLVED:
{data.get('property_details', '______')}

DURATION: {data.get('duration', 'Until revoked in writing')}

The Principal ratifies and confirms all acts done by the Agent in exercise of the powers hereby granted.

Executed at {data.get('place', '______')} on {data.get('date', '______')}.

PRINCIPAL:                              AGENT (Acceptance):
_______________________                 _______________________
{data.get('principal_name', '____________')}       {data.get('agent_name', '____________')}
Date: ___________________               Date: ___________________


WITNESSES:

1. Name: {data.get('witness1_name', '________________________')}
   Signature: _______________________

2. Name: {data.get('witness2_name', '________________________')}
   Signature: _______________________

(Executed on non-judicial stamp paper of ₹{stamp_value})
"""

def sale_agreement_en(data: dict, stamp_value: int) -> str:
    return f"""
AGREEMENT FOR SALE

STAMP PAPER VALUE: ₹{stamp_value}

This Agreement for Sale is made on {data.get('completion_date', '______')} at Kerala, India.

BETWEEN:

SELLER:
Name    : {data.get('seller_name', '______')}
Address : {data.get('seller_address', '______')}
(Hereinafter called "the Vendor")

AND

BUYER:
Name    : {data.get('buyer_name', '______')}
Address : {data.get('buyer_address', '______')}
(Hereinafter called "the Purchaser")

PROPERTY DESCRIPTION:
{data.get('property_address', '______')}
Survey No. / Plot No.: {data.get('survey_no', '______')}

TERMS OF SALE:

1. SALE PRICE: The total agreed sale consideration is ₹{data.get('sale_price', '______')} (Rupees {data.get('sale_price', '______')} Only).

2. ADVANCE PAID: The Purchaser has paid an advance/token amount of ₹{data.get('advance_paid', '______')} on the date of this agreement, the receipt of which the Vendor hereby acknowledges.

3. BALANCE PAYMENT: The balance amount of ₹{data.get('balance_due', '______')} shall be paid at the time of registration.

4. COMPLETION DATE: The sale deed shall be registered on or before {data.get('completion_date', '______')}.

5. TITLE: The Vendor declares that the property is free from encumbrances and has clear marketable title.

6. DEFAULT: In case of default by the Purchaser, the advance shall be forfeited. In case of default by the Vendor, the advance shall be returned with an equal penalty.

VENDOR:                                 PURCHASER:
_______________________                 _______________________
{data.get('seller_name', '____________')}          {data.get('buyer_name', '____________')}
Date: ___________________               Date: ___________________


WITNESSES:

1. Name: {data.get('witness1_name', '________________________')}
   Signature: _______________________

2. Name: {data.get('witness2_name', '________________________')}
   Signature: _______________________

(Executed on non-judicial stamp paper of ₹{stamp_value})
"""

def loan_agreement_en(data: dict, stamp_value: int) -> str:
    return f"""
LOAN AGREEMENT / BOND

STAMP PAPER VALUE: ₹{stamp_value}

This Loan Agreement is made on {data.get('date', '______')} at Kerala, India.

BETWEEN:

LENDER:
Name    : {data.get('lender_name', '______')}
Address : {data.get('lender_address', '______')}
(Hereinafter called "the Lender")

AND

BORROWER:
Name    : {data.get('borrower_name', '______')}
Address : {data.get('borrower_address', '______')}
(Hereinafter called "the Borrower")

LOAN DETAILS:

1. LOAN AMOUNT: The Lender agrees to lend and the Borrower agrees to borrow a sum of ₹{data.get('loan_amount', '______')} (Rupees {data.get('loan_amount', '______')} Only).

2. PURPOSE: {data.get('loan_purpose', '______')}

3. INTEREST: The loan shall carry interest at the rate of {data.get('interest_rate', '______')}.

4. DURATION: The loan shall be repaid within {data.get('duration_months', '______')} months from the date of this agreement.

5. REPAYMENT SCHEDULE: {data.get('repayment_schedule', '______')}

6. DEFAULT: In the event of default, the entire outstanding amount shall become immediately due and payable along with accrued interest.

7. GOVERNING LAW: This agreement shall be governed by the laws of Kerala, India.

LENDER:                                 BORROWER:
_______________________                 _______________________
{data.get('lender_name', '____________')}           {data.get('borrower_name', '____________')}
Date: ___________________               Date: ___________________


WITNESSES:

1. Name: {data.get('witness1_name', '________________________')}
   Signature: _______________________

2. Name: {data.get('witness2_name', '________________________')}
   Signature: _______________________

(Executed on non-judicial stamp paper of ₹{stamp_value})
"""

TEMPLATE_MAP = {
    "rental_agreement":  rental_agreement_en,
    "affidavit":         affidavit_en,
    "power_of_attorney": power_of_attorney_en,
    "sale_agreement":    sale_agreement_en,
    "loan_agreement":    loan_agreement_en,
}
