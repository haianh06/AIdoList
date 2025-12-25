import os
from huggingface_hub import hf_hub_download

def download_model():
    model_name = "Qwen/Qwen2.5-1.5B-Instruct-GGUF"
    filename = "qwen2.5-1.5b-instruct-q4_k_m.gguf"
    
    local_dir = "./models"
    
    if not os.path.exists(f"{local_dir}/{filename}"):
        print("Downloading model...")
        hf_hub_download(
            repo_id=model_name,
            filename=filename,
            local_dir=local_dir
        )
        print("Complete!")
    else:
        print("Model already exists. Ready to use.")

    return f"{local_dir}/{filename}"