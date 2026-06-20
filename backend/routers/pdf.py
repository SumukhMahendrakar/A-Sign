from fastapi import APIRouter, Depends, HTTPException, Header
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import json, os
from database import get_db, Document
from services.auth_service import decode_token
from services.pdf_service import generate_pdfs

router = APIRouter(prefix="/pdf", tags=["pdf"])


def get_current_user(authorization: str = Header(...)):
    scheme, _, token = authorization.partition(" ")
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload["sub"]


@router.post("/{doc_id}/generate")
def generate(doc_id: str, customer_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.doc_id == doc_id, Document.customer_id == customer_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    form_data = json.loads(doc.form_data or "{}")
    paths = generate_pdfs(doc_id, doc.doc_type, form_data, doc.stamp_value)

    doc.pdf_en_path = paths["en"]
    doc.pdf_ml_path = paths["ml"]
    doc.status = "generated"
    db.commit()

    return {"success": True, "en": f"/pdf/{doc_id}/download/en", "ml": f"/pdf/{doc_id}/download/ml"}


@router.get("/{doc_id}/download/{lang}")
def download(doc_id: str, lang: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.doc_id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    path = doc.pdf_en_path if lang == "en" else doc.pdf_ml_path
    if not path or not os.path.exists(path):
        raise HTTPException(status_code=404, detail="PDF not generated yet")

    filename = f"{doc_id}_{lang}.pdf"
    return FileResponse(path, media_type="application/pdf", filename=filename)
