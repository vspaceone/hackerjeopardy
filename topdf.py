import os
import json
from fpdf import FPDF
from PIL import Image
import pathlib

class JeopardyPDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 12)
        self.cell(0, 10, 'Hackerjeopardy Round', 0, 1, 'C')

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

def create_jeopardy_pdf(round_path):
    with open(round_path, 'r') as f:
        round_data = json.load(f)
    
    pdf = JeopardyPDF()
    pdf.add_page()
    
    # Add turn information
    pdf.set_font('Arial', 'B', 16)
    pdf.cell(0, 10, round_data['name'], 0, 1, 'C')
    pdf.set_font('Arial', '', 12)
    pdf.cell(0, 10, f"Difficulty: {round_data['difficulty']}", 0, 1)
    pdf.cell(0, 10, f"Author: {round_data['author']}", 0, 1)
    pdf.cell(0, 10, f"Date: {round_data['date']}", 0, 1)
    pdf.ln(10)

    # Process each category
    for folder in round_data['categories']:
        cat_path = os.path.join(os.path.dirname(round_path), folder, 'cat.json')
        try:
            with open(cat_path, 'r') as f:
                cat_data = json.load(f)
            
            pdf.set_font('Arial', 'B', 14)
            pdf.cell(0, 10, cat_data['name'], 0, 1)
            
            for question in cat_data['questions']:
                pdf.set_font('Arial', '', 12)
                pdf.multi_cell(0, 10, f"Question: {question['question']}")
                
                if 'image' in question:
                    img_path = os.path.join(os.path.dirname(cat_path), question['image'])
                    if os.path.exists(img_path):
                        pdf.image(img_path, x=10, w=30)
                        pdf.ln(10)  # Adjust this value based on your image sizes
                
                if 'answer' in question:
                    pdf.set_font('Arial', 'I', 12)
                    pdf.multi_cell(0, 10, f"Answer: {question['answer']}")
                
                pdf.ln(5)
        except: 
            pass
        
        pdf.add_page()

    output_path = pathlib.Path(".") / f"{round_data['name']}.pdf"
    pdf.output(output_path)
    print(f"PDF created: {output_path}")

def process_all_rounds(base_path):
    for root, dirs, files in os.walk(base_path):
        if 'round.json' in files:
            round_path = os.path.join(root, 'round.json')
            print(f"Working on {round_path}")
            create_jeopardy_pdf(round_path)

# Usage
base_path = pathlib.Path("src/assets")
process_all_rounds(base_path)
