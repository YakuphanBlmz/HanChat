from dataclasses import dataclass
from datetime import datetime
from typing import Optional

@dataclass
class Message:
    sender: str
    content: str
    timestamp: datetime
    type: str = "text"  # text, image, video, audio, sticker
    is_group: bool = False
    id: Optional[str] = None  # Unique hash or ID if available

    def to_dict(self):
        return {
            "sender": self.sender,
            "content": self.content,
            "timestamp": self.timestamp.isoformat(),
            "type": self.type,
            "is_group": self.is_group,
            "id": self.id
        }
