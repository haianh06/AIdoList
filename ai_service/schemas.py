from pydantic import BaseModel, Field
from typing import Optional, Literal

class AICommand(BaseModel):
    intent: Literal["chat", "create_event", "update_event", "delete_event"] = Field(
        ..., description="Ý định: chat, create_event, update_event, delete_event"
    )
    response_text: str = Field(..., description="Câu trả lời cho user")
    event_data: Optional[dict] = Field(
        None, 
        description="Dữ liệu sự kiện: {title, start_time, end_time} (ISO format)"
    )