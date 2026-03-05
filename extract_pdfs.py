import os
from pypdf import PdfReader

def extract_text(pdf_path, txt_path):
    print(f"Extracting {pdf_path}...")
    try:
        reader = PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        
        with open(txt_path, "w", encoding="utf-8") as f:
            f.write(text)
        print(f"Saved to {txt_path}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    mat_dir = r"D:\Quiz\Material"
    pdf1 = os.path.join(mat_dir, "POLÍTICA DE SEGURANÇA DA INFORMAÇÃO - PSI.pdf")
    txt1 = os.path.join(mat_dir, "psi_text.txt")
    
    pdf2 = os.path.join(mat_dir, "POLÍTICA DE proteção e privacidade de dados - PPDP.pdf")
    txt2 = os.path.join(mat_dir, "ppdp_text.txt")
    
    extract_text(pdf1, txt1)
    extract_text(pdf2, txt2)
