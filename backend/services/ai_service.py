"""
AI conversational service using Mistral API.
AI only collects user data - never writes legal text.
"""
import json
from mistralai.client import Mistral
from config import settings
from services.document_schemas import DOCUMENT_QUESTIONS, DOCUMENT_LABELS

client = Mistral(api_key=settings.MISTRAL_API_KEY)

SYSTEM_PROMPT = """You are a friendly legal document assistant for a Kerala legal services platform called LegalSeva Kerala.

Your ONLY job is to:
1. Ask the user the next unanswered question from the provided list
2. Validate and confirm their answer
3. Extract the exact answer value
4. Move to the next question

STRICT RULES:
- Never write legal clauses, contracts, or legal opinions
- Never hallucinate legal content
- Ask ONE question at a time
- Be warm, simple and easy to understand (many users may be elderly)
- Speak in simple English
- If the user's answer seems unclear, politely ask for clarification
- When all questions are answered, say: "✅ All information collected! Please review your details."
- You MUST use the exact 'field_name' provided in the context for extraction.

Response format (always JSON):
{
  "message": "Your conversational message to the user",
  "field": "EXACT_FIELD_NAME_FROM_CONTEXT",
  "value": "extracted value from user response",
  "next_field": "name of next field to ask or null if done",
  "all_done": false
}
"""

def get_next_question_prompt(doc_type: str, collected: dict) -> str:
    questions = DOCUMENT_QUESTIONS.get(doc_type, [])
    unanswered = [q for q in questions if q["field"] not in collected or not collected[q["field"]]]
    if not unanswered:
        return None
    return unanswered[0]

async def chat_with_ai(doc_type: str, conversation_history: list, user_message: str, collected_data: dict) -> dict:
    """
    Runs one turn of the conversation.
    Returns: { message, field, value, next_field, all_done }
    """
    questions = DOCUMENT_QUESTIONS.get(doc_type, [])
    doc_label = DOCUMENT_LABELS.get(doc_type, doc_type)
    
    # Build context for the AI
    answered = {q["field"]: collected_data.get(q["field"]) for q in questions if q["field"] in collected_data}
    unanswered = [q for q in questions if q["field"] not in collected_data]
    
    context = f"""
Document Type: {doc_label}
Questions to collect: {json.dumps([{'field': q['field'], 'question': q['question']} for q in questions], ensure_ascii=False)}
Already collected: {json.dumps(answered, ensure_ascii=False)}
Still need to collect: {json.dumps([{'field': q['field'], 'question': q['question']} for q in unanswered], ensure_ascii=False)}
Current user message: "{user_message}"

You must extract the value for the first question in 'Still need to collect' using its EXACT 'field' string.
"""

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    
    # Add history (last 10 messages)
    for msg in conversation_history[-10:]:
        messages.append({"role": msg["role"], "content": msg["content"]})
    
    messages.append({"role": "user", "content": context})

    response = client.chat.complete(
        model="mistral-small-latest",
        messages=messages,
        response_format={"type": "json_object"},
        max_tokens=600,
    )

    content = response.choices[0].message.content
    try:
        result = json.loads(content)
    except Exception:
        result = {
            "message": content,
            "field": None,
            "value": None,
            "next_field": None,
            "all_done": len(unanswered) == 0,
        }

    # Force all_done logic based on actual field extraction
    if len(unanswered) == 1 and result.get("field") == unanswered[0]["field"] and result.get("value"):
        result["all_done"] = True
    elif len(unanswered) == 0:
        result["all_done"] = True
    else:
        result["all_done"] = False
        
    return result


async def start_conversation(doc_type: str) -> dict:
    """Returns the first question to ask."""
    questions = DOCUMENT_QUESTIONS.get(doc_type, [])
    if not questions:
        return {"message": "Unknown document type.", "field": None, "all_done": True}
    
    doc_label = DOCUMENT_LABELS.get(doc_type, doc_type)
    first_q = questions[0]
    
    return {
        "message": f"Hello! I'll help you prepare your {doc_label}. Let's get started!\n\n{first_q['question']}",
        "field": first_q["field"],
        "value": None,
        "next_field": questions[1]["field"] if len(questions) > 1 else None,
        "all_done": False,
    }
