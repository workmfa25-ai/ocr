import os
import json
import tempfile
import torch
from fastapi.responses import JSONResponse
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from doctr.io import DocumentFile
from doctr.models import ocr_predictor
from langchain_chroma import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.prompts import PromptTemplate
from langchain_core.embeddings import Embeddings
from transformers import AutoTokenizer, AutoModel
from ollama import chat
from docx import Document
from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
from database import files_collection, texts_collection, logs_collection
from datetime import datetime
from bson import ObjectId 

app = FastAPI()

# Allow all origins (update for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Prompt Template ===
prompt = PromptTemplate(
    template="""
You are a helpful assistant.
Only answer based on the provided context.
If the context is insufficient, say "I don't know."

{context}

Question: {question}
""",
    input_variables=["context", "question"]
)

# === Globals ===
retriever = None
last_file_id = None  # keep track of last uploaded file

# === OCR ===
def load_doctr_model():
    return ocr_predictor(pretrained=True)

def convert_pdf_to_text_doctr(pdf_path, model):
    doc = DocumentFile.from_pdf(pdf_path)
    result = model(doc)

    confidences = []
    for page_idx, page in enumerate(result.pages):
        word_confs = [word.confidence for block in page.blocks for line in block.lines for word in line.words]
        avg_conf = sum(word_confs) / len(word_confs) if word_confs else 0.0
        confidences.append((page_idx + 1, round(avg_conf * 100, 2)))

    with open("ocr_output.txt", 'w', encoding='utf-8') as f:
        f.write(result.render())

    return confidences, result.render(), "ocr_output.txt"

# === Local HF Embeddings ===
class LocalHFEmbeddings(Embeddings):
    def __init__(self, model_path):
        self.tokenizer = AutoTokenizer.from_pretrained(model_path)
        self.model = AutoModel.from_pretrained(model_path)
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model.to(self.device)

    def embed_documents(self, texts):
        return [self._embed(text) for text in texts]

    def embed_query(self, text):
        return self._embed(text)

    def _embed(self, text):
        inputs = self.tokenizer(text, return_tensors="pt", padding=True, truncation=True)
        inputs = {k: v.to(self.device) for k, v in inputs.items()}
        with torch.no_grad():
            outputs = self.model(**inputs)
            token_embeddings = outputs.last_hidden_state
            attention_mask = inputs['attention_mask']
            input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
            pooled = torch.sum(token_embeddings * input_mask_expanded, 1) / input_mask_expanded.sum(1)
        return pooled[0].cpu().numpy().tolist()

def load_embeddings():
    model_path = "/home/ocr/Desktop/ocr-full/sentence_transformer_local"
    return LocalHFEmbeddings(model_path)

# === Mistral Calls ===
def run_mistral_offline(prompt_text):
    response = chat(
        model="mistral",
        messages=[{"role": "user", "content": prompt_text}]
    )
    return response['message']['content']

def correct_spelling_with_mistral(text):
    response = chat(
        model="mistral",
        messages=[
            {"role": "system", "content": "You are given text extracted from a scanned document using OCR. The text may contain spelling mistakes, broken words, or extra spaces. Correct the spelling mistakes and fix spacing issues while keeping the meaning unchanged. Return only the corrected text."},
            {"role": "user", "content": text}
        ]
    )
    return response['message']['content']

def split_into_chunks(text, chunk_size=400):
    words = text.split()
    for i in range(0, len(words), chunk_size):
        yield " ".join(words[i:i+chunk_size])

# === API Routes ===
@app.get("/")
def read_root():
    return {"message": "OCR + RAG API running"}

@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    global retriever, last_file_id
    try:
        if file.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="Only PDF files are supported.")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        # Step 1: OCR
        doctr_model = load_doctr_model()
        page_confidences, _, ocr_file_path = convert_pdf_to_text_doctr(tmp_path, doctr_model)

        confidence_data = [{"page": p, "confidence": c} for p, c in page_confidences]

        # Step 2: Spelling correction
        with open(ocr_file_path, "r", encoding="utf-8") as f:
            raw_text = f.read()

        corrected_text = []
        for chunk in split_into_chunks(raw_text, 400):
            corrected_text.append(correct_spelling_with_mistral(chunk))
        corrected_output = "\n\n".join(corrected_text)

        with open("corrected_text.txt", "w", encoding="utf-8") as f:
            f.write(corrected_output)

        # Step 3: Create retriever
        embeddings = load_embeddings()
        splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
        chunks_for_index = splitter.create_documents([corrected_output])
        vector_store = Chroma.from_documents(
            documents=chunks_for_index,
            embedding=embeddings,
            collection_name="pdf_documents",
            persist_directory="./chroma_db"
        )

        retriever = vector_store.as_retriever(
            search_type='similarity',
            search_kwargs={'k': 4}
        )

        print("ChromaDB vector store created successfully!")

        # Step 4: Save metadata (update if filename already exists)
        file_doc = {
            "filename": file.filename,
            "upload_time": datetime.utcnow(),
            "confidence": sum(c for _, c in page_confidences) / len(page_confidences) if page_confidences else 0,
            "pages": len(page_confidences),
            "page_confidences": confidence_data,
        }
        result = await files_collection.update_one(
            {"filename": file.filename},   # filter by filename
            {"$set": file_doc},            # update fields
            upsert=True                    # insert if not exists
        )

        # fetch _id of this file
        file_record = await files_collection.find_one({"filename": file.filename})
        last_file_id = str(file_record["_id"])

        # Step 5: Save extracted text in extracted_texts collection
        text_doc = {
            "file_id": last_file_id,
            "extracted_text": corrected_output,
        }
        await texts_collection.update_one(
            {"file_id": last_file_id},
            {"$set": text_doc},
            upsert=True
        )

        print("✅ Saved metadata in files & text in extracted_texts")

        return {
            "filename": file.filename,
            "extracted_text": corrected_output,
            "confidence": file_doc["confidence"],
            "pages": file_doc["pages"],
            "page_confidences": confidence_data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Question input model
class QuestionInput(BaseModel):
    question: str

@app.post("/ask/")
async def ask_question_api(data: QuestionInput):
    global retriever, last_file_id
    if retriever is None:
        raise HTTPException(status_code=400, detail="Please upload and process a PDF first.")

    retrieved_docs = retriever.invoke(data.question)
    context = "\n\n".join(doc.page_content for doc in retrieved_docs)
    final_prompt = prompt.format(context=context, question=data.question)
    answer = run_mistral_offline(final_prompt)

    # ✅ Save query + answer in llm_logs collection
    log_doc = {
        "file_id": last_file_id,
        "question": data.question,
        "answer": answer,
        "timestamp": datetime.utcnow()
    }
    await logs_collection.insert_one(log_doc)

    return {"question": data.question, "answer": answer}

class UpdateTextInput(BaseModel):
    file_id: str
    updated_text: str

@app.post("/update_text/")
async def update_text(data: UpdateTextInput):
    try:
        # Update text in texts_collection
        result = await texts_collection.update_one(
            {"file_id": data.file_id},
            {"$set": {"extracted_text": data.updated_text}},
            upsert=True
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="File not found in extracted_texts")

        # Also update files_collection to keep things in sync
        await files_collection.update_one(
            {"_id": ObjectId(data.file_id)},
            {"$set": {"extracted_text": data.updated_text}},
            upsert=True
        )

        return {"message": "✅ Extracted text updated successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

# class SaveEditedTextInput(BaseModel):
#     file_id: str
#     edited_text: str

# @app.post("/save_edited_text/")
# async def save_edited_text(data: SaveEditedTextInput):
#     try:
#         result = await texts_collection.update_one(
#             {"file_id": data.file_id},
#             {"$set": {"extracted_text": data.edited_text, "source": "human"}},
#             upsert=True  # optional: create if not exists
#         )

#         if result.matched_count == 0 and result.upserted_id is None:
#             raise HTTPException(status_code=500, detail="Failed to save edited text")

#         return {"message": "✅ Edited text saved successfully"}

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# === Download Endpoint ===
@app.get("/download/")
async def download_file(format: str):
    if format not in ("txt", "docx", "pdf"):
        raise HTTPException(status_code=400, detail="Invalid format. Use txt|docx|pdf.")

    corrected_path = "corrected_text.txt"
    if not os.path.exists(corrected_path):
        raise HTTPException(status_code=404, detail="No processed OCR text found. Upload a PDF first.")

    with open(corrected_path, "r", encoding="utf-8") as f:
        extracted_text = f.read()

    suffix = f".{format}"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        out_path = tmp.name

    if format == "txt":
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(extracted_text)

    elif format == "docx":
        doc = Document()
        doc.add_paragraph(extracted_text)
        doc.save(out_path)

    elif format == "pdf":
        doc = SimpleDocTemplate(out_path)
        styles = getSampleStyleSheet()
        story = [Paragraph(extracted_text, styles["Normal"])]
        doc.build(story)

    filename = f"ocr_output.{format}"
    return FileResponse(out_path, filename=filename, media_type="application/octet-stream")


@app.get("/page_confidences")
def get_confidences():
    try:
        with open("page_confidences.json", "r", encoding="utf-8") as f:
            data = json.load(f)
        return JSONResponse(content=data)
    except FileNotFoundError:
        return JSONResponse(content={"error": "Confidence data not found"}, status_code=404)


from fastapi import Depends
from database import files_collection, logs_collection
from bson import ObjectId
from fastapi.responses import JSONResponse

# Fetch all files with filename + upload date
@app.get("/history/files/")
async def get_files_history():
    files = await files_collection.find({}).to_list(length=100)
    history = [
        {
            "file_id": str(f["_id"]),
            "filename": f["filename"],
            "upload_time": f["upload_time"].isoformat()
        }
        for f in files
    ]
    return JSONResponse(content=history)


# Fetch chat history for a given file
@app.get("/history/chats/{file_id}")
async def get_chat_history(file_id: str):
    chats = await logs_collection.find({"file_id": file_id}).to_list(length=100)
    history = [
        {
            "question": c["question"],
            "answer": c["answer"],
            "timestamp": c["timestamp"].isoformat()
        }
        for c in chats
    ]
    return JSONResponse(content=history)


# Fetch extracted text for a file
@app.get("/history/extracted_text/{file_id}")
async def get_extracted_text(file_id: str):
    text_doc = await texts_collection.find_one({"file_id": file_id})
    if not text_doc:
        return JSONResponse(content={"error": "Text not found"}, status_code=404)
    return JSONResponse(content={"text": text_doc["extracted_text"]})
