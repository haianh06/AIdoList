from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from llama_cpp import Llama
from model_load import download_model
import json
import datetime

app = FastAPI()

# 1. Load Model (Chạy 1 lần khi start server)
model_path = download_model()

# n_ctx=2048: Độ dài ngữ cảnh tối đa
# n_gpu_layers=0: Chạy thuần CPU cho ổn định (trên docker dev). 
# Nếu muốn dùng GPU Nitro V15 thì cần setup thêm driver nvidia-container, để sau.
llm = Llama(model_path=model_path, n_ctx=2048, n_threads=4, verbose=False)

class AIRequest(BaseModel):
    message: str
    current_time: str # Cần thời gian hiện tại để AI tính toán "ngày mai", "tuần sau"

# 2. System Prompt - "Luật rừng" cho AI
SYSTEM_PROMPT = """
Bạn là một AI Event Parser chuyên nghiệp. Nhiệm vụ duy nhất: Chuyển đổi ngôn ngữ tự nhiên thành JSON cấu trúc.

--- QUY TẮC CỐT LÕI (BẮT BUỘC TUÂN THỦ) ---
1. **Output Format**: Chỉ trả về JSON thuần túy. KHÔNG Markdown (```json), KHÔNG giải thích thêm.
2. **Time Format**:
   - Luôn sử dụng định dạng: "YYYY-MM-DD HH:MM" (ISO 8601 rút gọn).
   - BẮT BUỘC quy đổi giờ sang định dạng 24H. (Ví dụ: "2h chiều" -> "14:00", "8h tối" -> "20:00").
   - Nếu người dùng không nói rõ ngày (ví dụ: "họp lúc 9h"), hãy dùng ngày từ biến `current_time`.
   - Nếu người dùng nói thời gian tương đối (ví dụ: "mai", "tuần sau"), hãy TÍNH TOÁN dựa trên `current_time`.
3. **End Time Logic**:
   - Nếu không có giờ kết thúc: Mặc định = Giờ bắt đầu + 1 tiếng.
4. **Data Fields**:
   - `action`: Chỉ nhận "create" | "update" | "delete".
   - `summary`: Tên sự kiện ngắn gọn.
   - `location`: Địa điểm (nếu có), nếu không thì null.
   - `start_time`: Thời gian bắt đầu.
   - `end_time`: Thời gian kết thúc.

--- VÍ DỤ ---
Context Time: 2025-12-24 09:00
Input: "Chiều mai 2h đi gặp khách ở Landmark 81"
Output Logic:
- "Chiều mai" = 2025-12-25 (Mai) + Chiều (PM)
- "2h" = 14:00
JSON Output:
[
  {
    "action": "create",
    "summary": "Gặp khách",
    "location": "Landmark 81",
    "start_time": "2025-12-25 14:00",
    "end_time": "2025-12-25 15:00"
  }
]
"""

@app.post("/api/v1/chat")
async def chat_process(request: AIRequest):
    try:
        user_input = request.message
        now = request.current_time

        prompt = f"""<|im_start|>system
{SYSTEM_PROMPT}
Thời gian hiện tại là: {now}
<|im_end|>
<|im_start|>user
{user_input}
<|im_end|>
<|im_start|>assistant
"""
        
        # Gọi model generate
        output = llm(
            prompt, 
            max_tokens=512, 
            stop=["<|im_end|>"], 
            echo=False,
            temperature=0.1 # Giảm sáng tạo xuống tối thiểu để output chuẩn JSON
        )
        
        text_result = output['choices'][0]['text'].strip()
        
        # Xử lý chuỗi JSON (đôi khi AI bị ngáo thêm markdown ```json ... ```)
        clean_json = text_result.replace("```json", "").replace("```", "").strip()
        
        # Parse thử xem có đúng JSON ko
        try:
            parsed_data = json.loads(clean_json)
        except json.JSONDecodeError:
            # Fallback nếu AI trả lời lung tung
            return {
                "success": False, 
                "raw_response": text_result,
                "error": "AI response is not valid JSON"
            }

        return {
            "success": True,
            "data": parsed_data
        }

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/")
def health_check():
    return {"status": "alive"}