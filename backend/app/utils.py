import re

def clean_text(text: str):
    text = text.lower() 
    text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE) 
    text = re.sub(r'\@\w+|\#\w+', '', text) 
    text = re.sub(r'[^a-z0-9áéíóúàèìòùãõâêîôûç\s]', '', text) 
    text = re.sub(r'\s+', ' ', text).strip() 

    return text
