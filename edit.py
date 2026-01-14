# main.py (Backend SmartUnityIA)
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
import base64

app = FastAPI()

# Autoriser ton frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def decode_image(base64_string):
    # Enlever le header "data:image/png;base64," si présent
    if "," in base64_string:
        base64_string = base64_string.split(",")[1]
    img_data = base64.b64decode(base64_string)
    nparr = np.frombuffer(img_data, np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_COLOR)

@app.post("/clean-slide")
async def clean_slide(image: str = Form(...), mask: str = Form(...)):
    # 1. Décoder les images reçues du React
    img_cv = decode_image(image)
    mask_cv = decode_image(mask)

    # 2. Préparer le masque (doit être en noir et blanc pur, 1 canal)
    mask_gray = cv2.cvtColor(mask_cv, cv2.COLOR_BGR2GRAY)
    _, mask_binary = cv2.threshold(mask_gray, 127, 255, cv2.THRESH_BINARY)

    # 3. LA MAGIE (Version OpenCV - Gratuite)
    # Telea est l'algorithme d'inpainting rapide
    result = cv2.inpaint(img_cv, mask_binary, 3, cv2.INPAINT_TELEA)

    # --- Pour la version IA PUISSANTE (Futur upgrade) ---
    # C'est ici que tu appellerais ton modèle LaMa
    # result = lama_model.predict(img_cv, mask_binary)
    # ----------------------------------------------------

    # 4. Renvoyer l'image nettoyée
    _, buffer = cv2.imencode('.jpg', result)
    jpg_as_text = base64.b64encode(buffer).decode('utf-8')
    
    return {"cleaned_image": f"data:image/jpeg;base64,{jpg_as_text}"}