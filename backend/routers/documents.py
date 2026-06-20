from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import json, uuid
from datetime import datetime
from database import get_db, Document, ConversationMessage
from services.auth_service import decode_token
from services.document_schemas import DOCUMENT_QUESTIONS, DOCUMENT_LABELS

router = APIRouter(prefix="/documents", tags=["documents"])


def get_current_user(authorization: str = Header(...)):
    scheme, _, token = authorization.partition(" ")
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload["sub"]


class CreateDocRequest(BaseModel):
    doc_type: str
    stamp_value: int = 100

class UpdateDocRequest(BaseModel):
    form_data: dict
    status: Optional[str] = None


@router.get("/")
def list_documents(customer_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    docs = db.query(Document).filter(Document.customer_id == customer_id).order_by(Document.created_at.desc()).all()
    result = []
    for d in docs:
        result.append({
            "doc_id": d.doc_id,
            "doc_type": d.doc_type,
            "doc_label": DOCUMENT_LABELS.get(d.doc_type, d.doc_type),
            "stamp_value": d.stamp_value,
            "status": d.status,
            "created_at": d.created_at.isoformat(),
            "has_pdf_en": bool(d.pdf_en_path),
            "has_pdf_ml": bool(d.pdf_ml_path),
        })
    return result


@router.post("/")
def create_document(req: CreateDocRequest, customer_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    count = db.query(Document).filter(Document.customer_id == customer_id).count()
    doc_id = f"DOC-{customer_id}-{str(count + 1).zfill(3)}"
    doc = Document(
        doc_id=doc_id,
        customer_id=customer_id,
        doc_type=req.doc_type,
        stamp_value=req.stamp_value,
        status="draft",
        form_data="{}",
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return {"doc_id": doc_id, "doc_type": req.doc_type, "status": "draft"}


@router.get("/{doc_id}")
def get_document(doc_id: str, customer_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.doc_id == doc_id, Document.customer_id == customer_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return {
        "doc_id": doc.doc_id,
        "doc_type": doc.doc_type,
        "doc_label": DOCUMENT_LABELS.get(doc.doc_type, doc.doc_type),
        "stamp_value": doc.stamp_value,
        "status": doc.status,
        "form_data": json.loads(doc.form_data or "{}"),
        "created_at": doc.created_at.isoformat(),
        "pdf_en_path": doc.pdf_en_path,
        "pdf_ml_path": doc.pdf_ml_path,
    }


@router.patch("/{doc_id}")
def update_document(doc_id: str, req: UpdateDocRequest, customer_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.doc_id == doc_id, Document.customer_id == customer_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    doc.form_data = json.dumps(req.form_data)
    if req.status:
        doc.status = req.status
    doc.updated_at = datetime.utcnow()
    db.commit()
    return {"success": True}


@router.get("/{doc_id}/questions")
def get_questions(doc_id: str, customer_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.doc_id == doc_id, Document.customer_id == customer_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"questions": DOCUMENT_QUESTIONS.get(doc.doc_type, [])}
