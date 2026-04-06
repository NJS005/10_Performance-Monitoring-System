import sys
from PyPDF2 import PdfReader

try:
    pdf_path = "C:/Users/panka/Desktop/Boookss/Syllabi.pdf"
    output_path = "src/main/resources/nitc_syllabus.txt"
    print(f"Opening {pdf_path}...")
    reader = PdfReader(pdf_path)
    text = ""
    for i, page in enumerate(reader.pages):
        text += page.extract_text() + "\n\n"
        if i % 10 == 0:
            print(f"Extracted page {i}/{len(reader.pages)}")

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(text)
    
    print(f"Successfully extracted {len(reader.pages)} pages to {output_path}!")
except Exception as e:
    print(f"Error: {str(e)}")
