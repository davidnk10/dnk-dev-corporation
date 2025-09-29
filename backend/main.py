from fastapi import FastAPI, HTTPException, Depends, status, Path
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from sqlmodel import SQLModel, Field, Session, create_engine, select
from jose import JWTError, jwt
from datetime import datetime, timedelta

app = FastAPI(title="DNK Dev Corporation Backend")

# ===== CORS setup =====
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== Database setup =====
sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"
engine = create_engine(sqlite_url, echo=True)

class ContactMessage(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: EmailStr
    message: str

class QuoteRequest(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: EmailStr
    service: Optional[str] = None
    details: Optional[str] = None

# Create database tables
SQLModel.metadata.create_all(engine)

# ===== Auth setup =====
SECRET_KEY = "supersecretkey"  # 🔑 replace with env var in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "109110 "  # 🔑 change this before going live

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@app.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    if form_data.username == ADMIN_USERNAME and form_data.password == ADMIN_PASSWORD:
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": form_data.username}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

def get_current_admin(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username != ADMIN_USERNAME:
            raise HTTPException(status_code=401, detail="Not authorized")
        return username
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ===== Pydantic Models (for request validation) =====
class ContactRequestModel(BaseModel):
    name: str
    email: EmailStr
    message: str

class QuoteRequestModel(BaseModel):
    name: str
    email: EmailStr
    service: Optional[str] = None
    details: Optional[str] = None

# ===== Public endpoints (contact & quote forms) =====
@app.post("/contact")
async def submit_contact(contact: ContactRequestModel):
    with Session(engine) as session:
        contact_entry = ContactMessage(**contact.dict())
        session.add(contact_entry)
        session.commit()
        session.refresh(contact_entry)
    return {"message": f"Thanks {contact.name}! Your message has been received."}

@app.post("/quote")
async def submit_quote(quote: QuoteRequestModel):
    with Session(engine) as session:
        quote_entry = QuoteRequest(**quote.dict())
        session.add(quote_entry)
        session.commit()
        session.refresh(quote_entry)
    return {"message": f"Thanks {quote.name}! Your quote request has been received."}

# ===== Admin protected endpoints =====
@app.get("/contacts", response_model=List[ContactMessage])
async def get_contacts(admin: str = Depends(get_current_admin)):
    with Session(engine) as session:
        return session.exec(select(ContactMessage)).all()

@app.get("/quotes", response_model=List[QuoteRequest])
async def get_quotes(admin: str = Depends(get_current_admin)):
    with Session(engine) as session:
        return session.exec(select(QuoteRequest)).all()

@app.delete("/contact/{contact_id}")
async def delete_contact(contact_id: int, admin: str = Depends(get_current_admin)):
    with Session(engine) as session:
        contact = session.get(ContactMessage, contact_id)
        if not contact:
            raise HTTPException(status_code=404, detail="Contact not found")
        session.delete(contact)
        session.commit()
        return {"message": f"Deleted contact {contact_id}"}

@app.delete("/quote/{quote_id}")
async def delete_quote(quote_id: int, admin: str = Depends(get_current_admin)):
    with Session(engine) as session:
        quote = session.get(QuoteRequest, quote_id)
        if not quote:
            raise HTTPException(status_code=404, detail="Quote not found")
        session.delete(quote)
        session.commit()
        return {"message": f"Deleted quote {quote_id}"}
