FROM python:3.9-slim

WORKDIR /app

# Copy requirements.txt first for caching
COPY ocr-full/requirements.txt .

# Install system dependencies including bash for source command
RUN apt-get update && apt-get install -y \
    build-essential \
    libssl-dev \
    libffi-dev \
    libgl1 \
    libglib2.0-0 \
    bash \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy virtual environment and application code
#COPY dev-env /app/dev-env
COPY ocr-full/dev-env /app/dev-env
COPY ocr-full/ /app

EXPOSE 5000

# Activate virtual environment and run uvicorn using bash
CMD ["/bin/bash", "-c", "source /app/dev-env/bin/activate && uvicorn main:app --host 0.0.0.0 --port 5000 --reload"]
