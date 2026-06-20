from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routers import auth, documents, ai, pdf, orders

app = FastAPI(
    title="LegalSeva Kerala API",
    description="AI-powered Kerala Legal Document Generation Platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(ai.router)
app.include_router(pdf.router)
app.include_router(orders.router)


@app.on_event("startup")
def on_startup():
    init_db()
    print("LegalSeva Kerala API started | DB initialized")


@app.get("/")
def root():
    return {"message": "LegalSeva Kerala API v1.0", "status": "running"}


@app.get("/health")
def health():
    return {"status": "ok"}
