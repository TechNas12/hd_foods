from pydantic import BaseModel, field_validator, model_validator
from typing import Optional
import re

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Category name must be at least 2 characters")
        if len(v) > 100:
            raise ValueError("Category name cannot exceed 100 characters")
        return v

class CategoryCreate(CategoryBase):
    slug: Optional[str] = None
    
    @field_validator("slug")
    @classmethod
    def validate_slug(cls, v: Optional[str]) -> Optional[str]:
        if v:
            v = v.strip().lower()
            if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", v):
                raise ValueError("Slug must be lowercase letters, numbers, and hyphens only")
        return v

    @model_validator(mode="after")
    def auto_generate_slug(self) -> "CategoryCreate":
        if not self.slug and self.name:
            self.slug = re.sub(r"[^a-z0-9]+", "-", self.name.lower().strip()).strip("-")
        return self

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None

class CategoryResponse(CategoryBase):
    id: int
    slug: str
    
    model_config = {"from_attributes": True}
