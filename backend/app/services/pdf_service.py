import base64

import fitz  # PyMuPDF


def pdf_to_base64_image(pdf_path: str, page_index: int = 0) -> str:
    doc = fitz.open(pdf_path)
    page = doc[page_index]
    mat = fitz.Matrix(2.0, 2.0)  # 2x Zoom → bessere OCR-Qualität
    pix = page.get_pixmap(matrix=mat)
    img_bytes = pix.tobytes("png")
    return base64.b64encode(img_bytes).decode("utf-8")
