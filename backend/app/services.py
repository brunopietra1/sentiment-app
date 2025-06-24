from transformers import pipeline
from .utils import clean_text

class SentimentAnalyzer:

    def __init__(self):
        self.sentiment_pipeline = pipeline("sentiment-analysis", model="nlptown/bert-base-multilingual-uncased-sentiment")
        self.label_map = { "1 star": "negative", "2 stars": "negative", "3 stars": "neutral", "4 stars": "positive", "5 stars": "positive" }

    def analyze_sentiment(self, text: str):
        cleaned_text = clean_text(text)
        result = self.sentiment_pipeline(cleaned_text)[0]
        mapped_sentiment = self.label_map.get(result["label"], result["label"])
        return {
            "sentiment":  mapped_sentiment,
            "score": result['score']
        }

sentiment_analyzer = SentimentAnalyzer()
