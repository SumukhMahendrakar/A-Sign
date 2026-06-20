from sqlalchemy import create_engine, Column, String, Integer, DateTime, Text, Boolean, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(String, unique=True, index=True)  # KL0001
    phone = Column(String, unique=True, index=True)
    name = Column(String, nullable=True)
    email = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class OTPRecord(Base):
    __tablename__ = "otp_records"
    id = Column(Integer, primary_key=True)
    phone = Column(String, index=True)
    otp = Column(String)
    expires_at = Column(DateTime)
    used = Column(Boolean, default=False)


class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    doc_id = Column(String, unique=True, index=True)  # DOC-KL0001-001
    customer_id = Column(String, index=True)
    doc_type = Column(String)  # rental_agreement, affidavit, etc.
    stamp_value = Column(Integer, default=100)
    status = Column(String, default="draft")  # draft, confirmed, generated
    form_data = Column(Text, default="{}")    # JSON
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    pdf_en_path = Column(String, nullable=True)
    pdf_ml_path = Column(String, nullable=True)


class ConversationMessage(Base):
    __tablename__ = "conversation_messages"
    id = Column(Integer, primary_key=True)
    doc_id = Column(String, index=True)
    role = Column(String)   # user / assistant
    content = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)


class VendorProfile(Base):
    __tablename__ = "vendor_profiles"
    id = Column(Integer, primary_key=True)
    vendor_id = Column(String, unique=True, index=True)
    name = Column(String)
    avatar_url = Column(String)
    current_balance = Column(Float, default=3600.0)
    amount_withdrawn = Column(Float, default=5400.0)
    orders_completed = Column(Integer, default=216)
    tokens_generated = Column(Integer, default=217)
    revenue_generated = Column(Float, default=9000.0)


class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True)
    ref_no = Column(String, unique=True, index=True)
    token_name = Column(String)
    amount = Column(Float)
    date = Column(String)
    status = Column(String)  # Pending, Accepted, Out for Delivery, Completed
    time_received = Column(String)
    time_left = Column(String)
    timeline_json = Column(Text)  # JSON list of events
    pdf_filename = Column(String)
    form_data = Column(Text)  # JSON string
    customer_id = Column(String, nullable=True)


class ESignedDocument(Base):
    __tablename__ = "e_signed_documents"
    id = Column(Integer, primary_key=True)
    doc_name = Column(String)
    status = Column(String)  # Signed, Pending
    file_size = Column(String)
    uploaded_at = Column(String)
    signed_at = Column(String, nullable=True)
    signature_svg = Column(Text, nullable=True)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def seed_db(db):
    import json
    # Seed Vendor
    vendor = db.query(VendorProfile).filter(VendorProfile.vendor_id == "12t37211").first()
    if not vendor:
        vendor = VendorProfile(
            vendor_id="12t37211",
            name="Rahul Luhar",
            avatar_url="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&q=80",
            current_balance=3600.0,
            amount_withdrawn=5400.0,
            orders_completed=216,
            tokens_generated=217,
            revenue_generated=9000.0
        )
        db.add(vendor)
        db.commit()

    # Seed Orders
    if db.query(Order).count() == 0:
        orders = [
            Order(
                ref_no="HJGJ7867868",
                token_name="Rent Agreement",
                amount=250.0,
                date="12/05/2023",
                status="Pending",
                time_received="11:16am",
                time_left="1hr 23mins",
                timeline_json=json.dumps([
                    {"time": "11:16am", "title": "Token received", "active": True}
                ]),
                pdf_filename="ResidentialRentalAgreement.pdf",
                form_data=json.dumps({
                    "city": "Chennai",
                    "state": "Tamil Nadu",
                    "date": "12",
                    "month": "May",
                    "year": "2023",
                    "landlord_name": "P. Chandrasekhar",
                    "landlord_address": "New No.11, Old No.8, 2nd Street, Mangalapuram, Chetpet, Chennai - 31"
                })
            ),
            Order(
                ref_no="HJGJ7867869",
                token_name="Rent Agreement",
                amount=250.0,
                date="11/03/2022",
                status="Out for Delivery",
                time_received="10:00am",
                time_left="0mins",
                timeline_json=json.dumps([
                    {"time": "10:00am", "title": "Token received", "active": True},
                    {"time": "10:15am", "title": "Order Accepted", "active": True},
                    {"time": "10:30am", "title": "Token Purchased", "active": True},
                    {"time": "10:45am", "title": "Dispatched for Delivery", "active": True, "subtext": "Delivery address lorem ipsum de sans color"}
                ]),
                pdf_filename="ResidentialRentalAgreement.pdf",
                form_data=json.dumps({
                    "city": "Chennai",
                    "state": "Tamil Nadu",
                    "date": "11",
                    "month": "March",
                    "year": "2022",
                    "landlord_name": "Rahul Luhar",
                    "landlord_address": "123 Street"
                })
            )
        ]
        
        # Add 6 completed orders to fill the dashboard and completed orders list
        for i in range(1, 9):
            orders.append(
                Order(
                    ref_no=f"HJGJ786787{i}",
                    token_name="Rent Agreement",
                    amount=250.0,
                    date="11/03/2022",
                    status="Completed",
                    time_received="09:00am",
                    time_left="0mins",
                    timeline_json=json.dumps([
                        {"time": "09:00am", "title": "Token received", "active": True},
                        {"time": "09:15am", "title": "Order Accepted", "active": True},
                        {"time": "09:30am", "title": "Token Purchased", "active": True},
                        {"time": "09:45am", "title": "Dispatched for Delivery", "active": True},
                        {"time": "10:15am", "title": "Order Completed", "active": True}
                    ]),
                    pdf_filename="ResidentialRentalAgreement.pdf",
                    form_data=json.dumps({
                        "city": "Chennai",
                        "state": "Tamil Nadu",
                        "date": "11",
                        "month": "March",
                        "year": "2022",
                        "landlord_name": "Rahul Luhar",
                        "landlord_address": "123 Street"
                    })
                )
            )
        
        for o in orders:
            db.add(o)
        db.commit()

    # Seed Mobile ESigned Documents
    if db.query(ESignedDocument).count() == 0:
        docs = [
            ESignedDocument(
                doc_name="RentalAgreement_Draft.pdf",
                status="Pending",
                file_size="1.2 MB",
                uploaded_at="2026-05-25 09:12"
            ),
            ESignedDocument(
                doc_name="Affidavit_Signed.pdf",
                status="Signed",
                file_size="840 KB",
                uploaded_at="2026-05-24 14:30",
                signed_at="2026-05-24 14:35",
                signature_svg="M 10 50 Q 50 20 90 50"
            )
        ]
        for d in docs:
            db.add(d)
        db.commit()


def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_db(db)
    finally:
        db.close()
