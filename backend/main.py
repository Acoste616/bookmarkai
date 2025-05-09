from fastapi import FastAPI, HTTPException, Depends, Path
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
from sqlalchemy.orm import Session
from typing import List
from backend import models, schemas, crud
from backend.database import SessionLocal, init_db

app = FastAPI()

# CORS do frontendu
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Healthcheck
@app.get("/health")
def health():
    return {"status": "ok"}

# Model do zapytań do LLM
class LLMRequest(BaseModel):
    prompt: str

# Proxy do lokalnego LLM
@app.post("/llm/ask")
def ask_llm(req: LLMRequest):
    try:
        response = requests.post(
            "http://127.0.0.1:1234/v1/chat/completions",
            json={
                "model": "qwen3-14b",
                "messages": [
                    {"role": "user", "content": req.prompt}
                ]
            },
            timeout=30
        )
        response.raise_for_status()
        data = response.json()
        return {"response": data["choices"][0]["message"]["content"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Dependency do sesji DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.on_event("startup")
def on_startup():
    init_db()

# Kategorie
@app.get("/categories", response_model=List[schemas.Category])
def list_categories(db: Session = Depends(get_db)):
    return crud.get_categories(db)

@app.post("/categories", response_model=schemas.Category)
def create_category(category: schemas.CategoryCreate, db: Session = Depends(get_db)):
    return crud.create_category(db, category)

@app.put("/categories/{category_id}", response_model=schemas.Category)
def update_category(category_id: int, category: schemas.CategoryCreate, db: Session = Depends(get_db)):
    return crud.update_category(db, category_id, category)

@app.delete("/categories/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db)):
    return crud.delete_category(db, category_id)

# Tagi
@app.get("/tags", response_model=List[schemas.Tag])
def list_tags(db: Session = Depends(get_db)):
    return crud.get_tags(db)

@app.post("/tags", response_model=schemas.Tag)
def create_tag(tag: schemas.TagCreate, db: Session = Depends(get_db)):
    return crud.create_tag(db, tag)

@app.put("/tags/{tag_id}", response_model=schemas.Tag)
def update_tag(tag_id: int, tag: schemas.TagCreate, db: Session = Depends(get_db)):
    return crud.update_tag(db, tag_id, tag)

@app.delete("/tags/{tag_id}")
def delete_tag(tag_id: int, db: Session = Depends(get_db)):
    return crud.delete_tag(db, tag_id)

# Zakładki
@app.get("/bookmarks", response_model=List[schemas.Bookmark])
def list_bookmarks(db: Session = Depends(get_db)):
    return crud.get_bookmarks(db)

@app.post("/bookmarks", response_model=schemas.Bookmark)
def create_bookmark(bookmark: schemas.BookmarkCreate, db: Session = Depends(get_db)):
    return crud.create_bookmark(db, bookmark)

@app.put("/bookmarks/{bookmark_id}", response_model=schemas.Bookmark)
def update_bookmark(bookmark_id: int, bookmark: schemas.BookmarkCreate, db: Session = Depends(get_db)):
    return crud.update_bookmark(db, bookmark_id, bookmark)

@app.delete("/bookmarks/{bookmark_id}")
def delete_bookmark(bookmark_id: int, db: Session = Depends(get_db)):
    return crud.delete_bookmark(db, bookmark_id)

@app.get("/bookmarks/{bookmark_id}", response_model=schemas.Bookmark)
def get_bookmark(bookmark_id: int, db: Session = Depends(get_db)):
    bookmark = crud.get_bookmark(db, bookmark_id)
    if not bookmark:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    return bookmark

# Historia AI-podsumowań
@app.get("/bookmarks/{bookmark_id}/summaries", response_model=List[schemas.BookmarkSummary])
def get_summaries(bookmark_id: int, db: Session = Depends(get_db)):
    return crud.get_summaries_for_bookmark(db, bookmark_id)

@app.post("/bookmarks/{bookmark_id}/summaries", response_model=schemas.BookmarkSummary)
def create_summary(bookmark_id: int, db: Session = Depends(get_db)):
    bookmark = crud.get_bookmark(db, bookmark_id)
    if not bookmark:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    # Generowanie podsumowania przez LLM
    prompt = f"Stwórz podsumowanie dla tej strony: {bookmark.title or ''} {bookmark.url} {bookmark.description or ''}"
    try:
        response = requests.post(
            "http://127.0.0.1:1234/v1/chat/completions",
            json={
                "model": "qwen3-14b",
                "messages": [
                    {"role": "user", "content": prompt}
                ]
            },
            timeout=60
        )
        response.raise_for_status()
        data = response.json()
        summary = data["choices"][0]["message"]["content"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM error: {e}")
    return crud.create_summary_for_bookmark(db, bookmark_id, summary)

@app.delete("/summaries/{summary_id}")
def delete_summary(summary_id: int, db: Session = Depends(get_db)):
    summary = crud.delete_summary(db, summary_id)
    if not summary:
        raise HTTPException(status_code=404, detail="Summary not found")
    return {"ok": True}

# Powiązane zakładki
@app.get("/bookmarks/{bookmark_id}/related", response_model=List[schemas.Bookmark])
def get_related(bookmark_id: int, db: Session = Depends(get_db)):
    return crud.get_related_bookmarks(db, bookmark_id) 