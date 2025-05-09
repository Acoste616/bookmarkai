from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Table, Text
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime

Base = declarative_base()

# Relacja wiele-do-wielu zakładki <-> tagi
bookmark_tag = Table(
    'bookmark_tag', Base.metadata,
    Column('bookmark_id', Integer, ForeignKey('bookmarks.id')),
    Column('tag_id', Integer, ForeignKey('tags.id'))
)

class Category(Base):
    __tablename__ = 'categories'
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    color = Column(String, nullable=True)
    icon = Column(String, nullable=True)
    parent_id = Column(Integer, ForeignKey('categories.id'), nullable=True)
    parent = relationship('Category', remote_side=[id], backref='children')

class Tag(Base):
    __tablename__ = 'tags'
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True)

class Bookmark(Base):
    __tablename__ = 'bookmarks'
    id = Column(Integer, primary_key=True)
    url = Column(String, nullable=False)
    title = Column(String, nullable=True)
    description = Column(String, nullable=True)
    category_id = Column(Integer, ForeignKey('categories.id'), nullable=True)
    category = relationship('Category')
    tags = relationship('Tag', secondary=bookmark_tag, backref='bookmarks')
    created_at = Column(DateTime, default=datetime.utcnow)

class BookmarkSummary(Base):
    __tablename__ = 'bookmark_summaries'
    id = Column(Integer, primary_key=True)
    bookmark_id = Column(Integer, ForeignKey('bookmarks.id'))
    summary = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    bookmark = relationship('Bookmark', backref='summaries') 