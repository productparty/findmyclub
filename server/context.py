from contextvars import ContextVar
from typing import Optional

# Context variable to store user_id
user_id_ctx: ContextVar[Optional[str]] = ContextVar("user_id", default=None)

def set_user_id(user_id: str):
    user_id_ctx.set(user_id)

def get_user_id() -> Optional[str]:
    return user_id_ctx.get()
