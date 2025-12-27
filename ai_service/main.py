from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
from typing import List, Dict
import os
from langchain_community.chat_models import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from schemas import AICommand

app = FastAPI()

class ChatRequest(BaseModel):
    user_id: str
    message: str
    current_time: str

# 1. Cấu hình Ollama
llm = ChatOllama(
    model="llama3.1", 
    base_url="http://host.docker.internal:11434", 
    temperature=0,
    format="json" 
)

# 2. Setup Parser
parser = JsonOutputParser(pydantic_object=AICommand)

# 3. Prompt
system_prompt = """
Bạn là trợ lý lịch trình AIdoList. Thời gian hiện tại: {current_time}.
Nhiệm vụ: Phân tích câu nói của user và trả về JSON chuẩn.

HƯỚNG DẪN OUTPUT (BẮT BUỘC JSON):
{format_instructions}

QUY TẮC:
- Nếu tạo lịch: start_time phải là ISO 8601 (YYYY-MM-DDTHH:mm:ss).
- Nếu không rõ ngày, hãy hỏi lại (intent: chat).
- Trả lời ngắn gọn bằng tiếng Việt.
"""

prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    ("human", "{input}"),
])

# Inject format instruction vào prompt
chain = prompt | llm | parser

@app.post("/analyze")
async def analyze_intent(req: ChatRequest, x_internal_token: str = Header(None)):
    if x_internal_token != os.getenv("INTERNAL_API_KEY", "secret_key"):
        raise HTTPException(status_code=403, detail="Unauthorized")

    try:
        print(f"--> User: {req.message} | Time: {req.current_time}")
        
        result = await chain.ainvoke({
            "current_time": req.current_time,
            "input": req.message,
            "format_instructions": parser.get_format_instructions()
        })
        
        print(f"<-- AI: {result}")
        return result
        
    except Exception as e:
        print(f"Error: {e}")
        return {
            "intent": "chat",
            "response_text": "Sorry I can't understand. Please try again.",
            "event_data": None
        }