from sqlalchemy.orm import Session
from . import models, schemas
from typing import List, Optional

def get_category(db: Session, category_id: int):
    return db.query(models.Category).filter(models.Category.id == category_id).first()

def get_categories(db: Session):
    return db.query(models.Category).all()

def create_category(db: Session, category: schemas.CategoryCreate):
    db_category = models.Category(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def update_category(db: Session, category_id: int, category: schemas.CategoryCreate):
    db_category = get_category(db, category_id)
    if not db_category:
        return None
    for key, value in category.dict().items():
        setattr(db_category, key, value)
    db.commit()
    db.refresh(db_category)
    return db_category

def delete_category(db: Session, category_id: int):
    db_category = get_category(db, category_id)
    if not db_category:
        return None
    db.delete(db_category)
    db.commit()
    return db_category

# Tag CRUD

def get_tag(db: Session, tag_id: int):
    return db.query(models.Tag).filter(models.Tag.id == tag_id).first()

def get_tags(db: Session):
    return db.query(models.Tag).all()

def create_tag(db: Session, tag: schemas.TagCreate):
    db_tag = models.Tag(**tag.dict())
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag

def update_tag(db: Session, tag_id: int, tag: schemas.TagCreate):
    db_tag = get_tag(db, tag_id)
    if not db_tag:
        return None
    for key, value in tag.dict().items():
        setattr(db_tag, key, value)
    db.commit()
    db.refresh(db_tag)
    return db_tag

def delete_tag(db: Session, tag_id: int):
    db_tag = get_tag(db, tag_id)
    if not db_tag:
        return None
    db.delete(db_tag)
    db.commit()
    return db_tag

# Bookmark CRUD

def get_bookmark(db: Session, bookmark_id: int):
    return db.query(models.Bookmark).filter(models.Bookmark.id == bookmark_id).first()

def get_bookmarks(db: Session):
    return db.query(models.Bookmark).all()

def create_bookmark(db: Session, bookmark: schemas.BookmarkCreate):
    db_bookmark = models.Bookmark(
        url=bookmark.url,
        title=bookmark.title,
        description=bookmark.description,
        category_id=bookmark.category_id
    )
    if bookmark.tag_ids:
        db_bookmark.tags = db.query(models.Tag).filter(models.Tag.id.in_(bookmark.tag_ids)).all()
    db.add(db_bookmark)
    db.commit()
    db.refresh(db_bookmark)
    return db_bookmark

def update_bookmark(db: Session, bookmark_id: int, bookmark: schemas.BookmarkCreate):
    db_bookmark = get_bookmark(db, bookmark_id)
    if not db_bookmark:
        return None
    for key, value in bookmark.dict(exclude={"tag_ids"}).items():
        setattr(db_bookmark, key, value)
    if bookmark.tag_ids is not None:
        db_bookmark.tags = db.query(models.Tag).filter(models.Tag.id.in_(bookmark.tag_ids)).all()
    db.commit()
    db.refresh(db_bookmark)
    return db_bookmark

def delete_bookmark(db: Session, bookmark_id: int):
    db_bookmark = get_bookmark(db, bookmark_id)
    if not db_bookmark:
        return None
    db.delete(db_bookmark)
    db.commit()
    return db_bookmark

# BookmarkSummary CRUD
def get_summaries_for_bookmark(db: Session, bookmark_id: int):
    return db.query(models.BookmarkSummary).filter(models.BookmarkSummary.bookmark_id == bookmark_id).order_by(models.BookmarkSummary.created_at.desc()).all()

def create_summary_for_bookmark(db: Session, bookmark_id: int, summary: str):
    db_summary = models.BookmarkSummary(bookmark_id=bookmark_id, summary=summary)
    db.add(db_summary)
    db.commit()
    db.refresh(db_summary)
    return db_summary

def delete_summary(db: Session, summary_id: int):
    summary = db.query(models.BookmarkSummary).filter(models.BookmarkSummary.id == summary_id).first()
    if not summary:
        return None
    db.delete(summary)
    db.commit()
    return summary

# Related bookmarks (prosta similarity: wspólne tagi, ta sama kategoria)
def get_related_bookmarks(db: Session, bookmark_id: int, limit: int = 5):
    bookmark = get_bookmark(db, bookmark_id)
    if not bookmark:
        return []
    tag_ids = [tag.id for tag in bookmark.tags]
    q = db.query(models.Bookmark).filter(models.Bookmark.id != bookmark_id)
    if bookmark.category_id:
        q = q.filter(models.Bookmark.category_id == bookmark.category_id)
    if tag_ids:
        q = q.filter(models.Bookmark.tags.any(models.Tag.id.in_(tag_ids)))
    return q.limit(limit).all() 