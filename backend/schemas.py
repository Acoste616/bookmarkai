from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class CategoryBase(BaseModel):
    name: str
    color: Optional[str] = None
    icon: Optional[str] = None
    parent_id: Optional[int] = None

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int
    children: Optional[List['Category']] = []
    class Config:
        orm_mode = True

Category.update_forward_refs()

class TagBase(BaseModel):
    name: str

class TagCreate(TagBase):
    pass

class Tag(TagBase):
    id: int
    class Config:
        orm_mode = True

class BookmarkBase(BaseModel):
    url: str
    title: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    tag_ids: Optional[List[int]] = []

class BookmarkCreate(BookmarkBase):
    pass

class BookmarkSummaryBase(BaseModel):
    summary: str

class BookmarkSummaryCreate(BookmarkSummaryBase):
    pass

class BookmarkSummary(BookmarkSummaryBase):
    id: int
    created_at: datetime
    class Config:
        orm_mode = True

class Bookmark(BookmarkBase):
    id: int
    created_at: datetime
    tags: List[Tag] = []
    summaries: List[BookmarkSummary] = []
    class Config:
        orm_mode = True 