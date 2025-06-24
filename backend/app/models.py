from peewee import * 
import datetime
import os
from urllib.parse import urlparse

DATABASE_URL = os.environ.get("DATABASE_URL")

if DATABASE_URL:
    # Se DATABASE_URL existe, parseia e usa PostgreSQL
    url = urlparse(DATABASE_URL)
    db = PostgresqlDatabase(database=url.path[1:], user=url.username, password=url.password, host=url.hostname, port=url.port)

else:
    # Caso contrário, usa SQLite localmente
    DB_FILE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "sentiment_analysis.db")
    db = SqliteDatabase(DB_FILE_PATH)

class BaseModel(Model):
    class Meta:
        database = db

class AnalysisHistory(BaseModel):
    text = TextField()

    sentiment = CharField()

    score = FloatField()

    timestamp = DateTimeField(default=datetime.datetime.now)

    corrected_sentiment = CharField(null=True)

    class Meta:
        order_by = ("-timestamp",)

def initialize_db():
    db.connect()

    db.create_tables([AnalysisHistory])

    db.close()

initialize_db()