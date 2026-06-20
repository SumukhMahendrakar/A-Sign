import random
import string
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from database import OTPRecord

def generate_otp() -> str:
    return "".join(random.choices(string.digits, k=6))

def create_otp(db: Session, phone: str) -> str:
    otp = generate_otp()
    db.query(OTPRecord).filter(OTPRecord.phone == phone, OTPRecord.used == False).delete()
    record = OTPRecord(
        phone=phone,
        otp=otp,
        expires_at=datetime.utcnow() + timedelta(minutes=10),
        used=False,
    )
    db.add(record)
    db.commit()
    print(f"[OTP] Phone: {phone}  OTP: {otp}")
    return otp

def verify_otp(db: Session, phone: str, otp: str) -> bool:
    record = (
        db.query(OTPRecord)
        .filter(
            OTPRecord.phone == phone,
            OTPRecord.otp == otp,
            OTPRecord.used == False,
            OTPRecord.expires_at > datetime.utcnow(),
        )
        .first()
    )
    if record:
        record.used = True
        db.commit()
        return True
    return False
