from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class SoftDeleteMixin(BaseModel):
    is_deleted: bool = False
    deleted_at: Optional[datetime] = None
