from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db, User
from services.otp_service import create_otp, verify_otp
from services.auth_service import create_access_token
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["auth"])


def next_customer_id(db: Session) -> str:
    count = db.query(User).count()
    return f"KL{str(count + 1).zfill(4)}"


class SendOTPRequest(BaseModel):
    phone: str

class VerifyOTPRequest(BaseModel):
    phone: str
    otp: str
    name: str = ""

class LoginRequest(BaseModel):
    identifier: str  # phone or customer_id


@router.post("/send-otp")
def send_otp(req: SendOTPRequest, db: Session = Depends(get_db)):
    otp = create_otp(db, req.phone)
    # MVP: OTP printed to console; production: send via SMS
    return {"success": True, "message": f"OTP sent to {req.phone}", "dev_otp": otp}


@router.post("/verify-otp")
def verify_otp_route(req: VerifyOTPRequest, db: Session = Depends(get_db)):
    if not verify_otp(db, req.phone, req.otp):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    user = db.query(User).filter(User.phone == req.phone).first()
    if not user:
        cid = next_customer_id(db)
        user = User(customer_id=cid, phone=req.phone, name=req.name or "")
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token({"sub": user.customer_id, "phone": user.phone})
    return {
        "access_token": token,
        "token_type": "bearer",
        "customer_id": user.customer_id,
        "name": user.name,
        "is_new": user.name == "",
    }


@router.post("/login")
def login_by_id(req: LoginRequest, db: Session = Depends(get_db)):
    user = (
        db.query(User).filter(User.customer_id == req.identifier).first()
        or db.query(User).filter(User.phone == req.identifier).first()
    )
    if not user:
        raise HTTPException(status_code=404, detail="User not found. Please sign up.")
    token = create_access_token({"sub": user.customer_id, "phone": user.phone})
    return {
        "access_token": token,
        "token_type": "bearer",
        "customer_id": user.customer_id,
        "name": user.name,
    }
