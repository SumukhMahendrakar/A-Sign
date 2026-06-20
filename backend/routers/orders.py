from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
import json
from datetime import datetime
from database import get_db, Order, VendorProfile, ESignedDocument, User
from services.auth_service import decode_token

router = APIRouter(prefix="/orders", tags=["orders"])


def get_current_user(authorization: str = Header(...)):
    scheme, _, token = authorization.partition(" ")
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload["sub"]


class AcceptOrderResponse(BaseModel):
    success: bool
    status: str
    timeline: list


class UpdateStatusRequest(BaseModel):
    status: str
    subtext: Optional[str] = None


class SignDocumentRequest(BaseModel):
    id: int
    signature_svg: str


class WithdrawRequest(BaseModel):
    amount: float


@router.get("/")
def list_orders(status: Optional[str] = None, current_user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(Order)
    if status:
        query = query.filter(Order.status == status)
    orders = query.order_by(Order.id.desc()).all()
    
    result = []
    for o in orders:
        result.append({
            "id": o.id,
            "ref_no": o.ref_no,
            "token_name": o.token_name,
            "amount": o.amount,
            "date": o.date,
            "status": o.status,
            "time_received": o.time_received,
            "time_left": o.time_left,
            "pdf_filename": o.pdf_filename,
            "timeline": json.loads(o.timeline_json or "[]"),
            "form_data": json.loads(o.form_data or "{}")
        })
    return result


@router.get("/stats")
def get_vendor_stats(current_user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    # Find the logged-in user to make the name completely dynamic!
    user = db.query(User).filter(User.customer_id == current_user_id).first()
    user_name = user.name if (user and user.name) else "Rahul Luhar"
    
    vendor = db.query(VendorProfile).filter(VendorProfile.vendor_id == current_user_id).first()
    if not vendor:
        # Create a dynamic vendor profile for the active user if it doesn't exist
        vendor = VendorProfile(
            vendor_id=current_user_id,
            name=user_name,
            avatar_url="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&q=80",
            current_balance=3600.0,
            amount_withdrawn=5400.0,
            orders_completed=216,
            tokens_generated=217,
            revenue_generated=9000.0
        )
        db.add(vendor)
        db.commit()
        db.refresh(vendor)
    else:
        # Keep name in sync with user profile
        if user and user.name and vendor.name != user.name:
            vendor.name = user.name
            db.commit()
            db.refresh(vendor)
            
    return {
        "vendor_id": vendor.vendor_id,
        "name": vendor.name,
        "avatar_url": vendor.avatar_url,
        "current_balance": vendor.current_balance,
        "amount_withdrawn": vendor.amount_withdrawn,
        "orders_completed": vendor.orders_completed,
        "tokens_generated": vendor.tokens_generated,
        "revenue_generated": vendor.revenue_generated
    }


@router.post("/withdraw")
def withdraw_funds(req: WithdrawRequest, current_user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    vendor = db.query(VendorProfile).filter(VendorProfile.vendor_id == current_user_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor profile not found")
        
    if vendor.current_balance < req.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")
        
    vendor.current_balance -= req.amount
    vendor.amount_withdrawn += req.amount
    db.commit()
    db.refresh(vendor)
    
    return {
        "success": True,
        "current_balance": vendor.current_balance,
        "amount_withdrawn": vendor.amount_withdrawn
    }


@router.get("/{ref_no}")
def get_order(ref_no: str, current_user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.ref_no == ref_no).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {
        "id": order.id,
        "ref_no": order.ref_no,
        "token_name": order.token_name,
        "amount": order.amount,
        "date": order.date,
        "status": order.status,
        "time_received": order.time_received,
        "time_left": order.time_left,
        "pdf_filename": order.pdf_filename,
        "timeline": json.loads(order.timeline_json or "[]"),
        "form_data": json.loads(order.form_data or "{}")
    }


@router.post("/{ref_no}/accept")
def accept_order(ref_no: str, current_user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.ref_no == ref_no).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.status != "Pending":
        raise HTTPException(status_code=400, detail="Order is already accepted or completed")
    
    now_str = datetime.now().strftime("%I:%M%p").lower()
    
    # Update Order
    order.status = "Accepted"
    order.time_left = "0mins"
    timeline = [
        {"time": order.time_received, "title": "Token received", "active": True},
        {"time": now_str, "title": "Order Accepted (Rent Agreement)", "active": True},
        {"time": now_str, "title": "Token Purchased", "active": True}
    ]
    order.timeline_json = json.dumps(timeline)
    
    # Update Vendor Stats for this active user
    vendor = db.query(VendorProfile).filter(VendorProfile.vendor_id == current_user_id).first()
    if not vendor:
        # Create profile first
        user = db.query(User).filter(User.customer_id == current_user_id).first()
        user_name = user.name if (user and user.name) else "Rahul Luhar"
        vendor = VendorProfile(
            vendor_id=current_user_id,
            name=user_name,
            avatar_url="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&q=80",
            current_balance=3600.0,
            amount_withdrawn=5400.0,
            orders_completed=216,
            tokens_generated=217,
            revenue_generated=9000.0
        )
        db.add(vendor)
        db.commit()
        db.refresh(vendor)
        
    vendor.current_balance += order.amount
    vendor.revenue_generated += order.amount
    vendor.tokens_generated += 1
    
    db.commit()
    
    return {
        "success": True,
        "status": "Accepted",
        "timeline": timeline
    }


@router.post("/{ref_no}/step")
def step_order_status(ref_no: str, req: UpdateStatusRequest, current_user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.ref_no == ref_no).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    now_str = datetime.now().strftime("%I:%M%p").lower()
    timeline = json.loads(order.timeline_json or "[]")
    
    order.status = req.status
    
    # Add timeline step
    timeline_event = {
        "time": now_str,
        "title": req.status if req.status != "Out for Delivery" else "Dispatched for Delivery",
        "active": True
    }
    if req.subtext:
        timeline_event["subtext"] = req.subtext
        
    timeline.append(timeline_event)
    order.timeline_json = json.dumps(timeline)
    
    # If completed, update vendor completed count
    if req.status == "Completed":
        vendor = db.query(VendorProfile).filter(VendorProfile.vendor_id == current_user_id).first()
        if vendor:
            vendor.orders_completed += 1
            
    db.commit()
    
    return {
        "success": True,
        "status": order.status,
        "timeline": timeline
    }


# --- Mobile App Endpoints ---

@router.get("/mobile/documents")
def get_mobile_documents(current_user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    docs = db.query(ESignedDocument).order_by(ESignedDocument.id.desc()).all()
    return [{
        "id": d.id,
        "doc_name": d.doc_name,
        "status": d.status,
        "file_size": d.file_size,
        "uploaded_at": d.uploaded_at,
        "signed_at": d.signed_at,
        "signature_svg": d.signature_svg
    } for d in docs]


@router.post("/mobile/upload")
def upload_mobile_document(doc_name: str, file_size: str, current_user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M")
    doc = ESignedDocument(
        doc_name=doc_name,
        status="Pending",
        file_size=file_size,
        uploaded_at=now_str
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return {
        "success": True,
        "document": {
            "id": doc.id,
            "doc_name": doc.doc_name,
            "status": doc.status,
            "file_size": doc.file_size,
            "uploaded_at": doc.uploaded_at
        }
    }


@router.post("/mobile/sign")
def sign_mobile_document(req: SignDocumentRequest, current_user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.query(ESignedDocument).filter(ESignedDocument.id == req.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M")
    doc.status = "Signed"
    doc.signed_at = now_str
    doc.signature_svg = req.signature_svg
    
    db.commit()
    return {
        "success": True,
        "status": "Signed",
        "signed_at": now_str
    }
