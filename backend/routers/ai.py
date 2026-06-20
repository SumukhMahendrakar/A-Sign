from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
import json
from database import get_db, Document, ConversationMessage
from services.auth_service import decode_token
from services.ai_service import chat_with_ai, start_conversation
from datetime import datetime

router = APIRouter(prefix="/ai", tags=["ai"])


def get_current_user(authorization: str = Header(...)):
    scheme, _, token = authorization.partition(" ")
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload["sub"]


class ChatRequest(BaseModel):
    message: str


@router.post("/{doc_id}/start")
async def start_chat(doc_id: str, customer_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.doc_id == doc_id, Document.customer_id == customer_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Clear old messages
    db.query(ConversationMessage).filter(ConversationMessage.doc_id == doc_id).delete()
    db.commit()

    result = await start_conversation(doc.doc_type)

    msg = ConversationMessage(doc_id=doc_id, role="assistant", content=result["message"])
    db.add(msg)
    db.commit()

    return result


@router.post("/{doc_id}/chat")
async def chat(doc_id: str, req: ChatRequest, customer_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.doc_id == doc_id, Document.customer_id == customer_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    history = db.query(ConversationMessage).filter(
        ConversationMessage.doc_id == doc_id
    ).order_by(ConversationMessage.timestamp).all()

    history_list = [{"role": m.role, "content": m.content} for m in history]
    form_data = json.loads(doc.form_data or "{}")

    # Save user message
    db.add(ConversationMessage(doc_id=doc_id, role="user", content=req.message))
    db.commit()

    result = await chat_with_ai(doc.doc_type, history_list, req.message, form_data)

    # Update form_data if a field was extracted
    if result.get("field") and result.get("value"):
        form_data[result["field"]] = result["value"]
        doc.form_data = json.dumps(form_data)
        if result.get("all_done"):
            doc.status = "confirmed"
        db.commit()

    # Save assistant reply
    db.add(ConversationMessage(doc_id=doc_id, role="assistant", content=result["message"]))
    db.commit()

    return {**result, "form_data": form_data}


@router.get("/{doc_id}/history")
def chat_history(doc_id: str, customer_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.doc_id == doc_id, Document.customer_id == customer_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    msgs = db.query(ConversationMessage).filter(
        ConversationMessage.doc_id == doc_id
    ).order_by(ConversationMessage.timestamp).all()
    return [{"role": m.role, "content": m.content, "timestamp": m.timestamp.isoformat()} for m in msgs]
