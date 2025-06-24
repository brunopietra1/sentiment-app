from flask import Blueprint, request, jsonify, Response
from .services import sentiment_analyzer 
from .models import AnalysisHistory, db
import io 
import csv 

bp = Blueprint("main", __name__)

@bp.route("/analyze", methods=["POST"])
def analyze_text():
    data = request.get_json()
    if not data or "text" not in data:
        return jsonify({"error": "Missing 'text' in request body"}), 400
    text_to_analyze = data["text"]
    result = sentiment_analyzer.analyze_sentiment(text_to_analyze)

    try:
        db.connect()     
        AnalysisHistory.create(
        text=text_to_analyze,
        sentiment=result["sentiment"],
        score=result["score"]
        )
    except Exception as e:
        print(f"Erro ao salvar no banco de dados: {e}")
        
    finally:
        if not db.is_closed():
            db.close() 

    
    return jsonify(result), 200


@bp.route("/history", methods=["GET"])
def get_history():
    history_list = []

    try:
        db.connect()
        for entry in AnalysisHistory.select():
            history_list.append({
            "id": entry.id,
            "text": entry.text,
            "sentiment": entry.sentiment,
            "score": entry.score,
            "timestamp": entry.timestamp.isoformat() 
            })

    except Exception as e:
        print(f"Erro ao buscar histórico: {e}")
        return jsonify({"error": "Could not retrieve history"}), 500
    
    finally:
        if not db.is_closed():
            db.close()

    return jsonify(history_list), 200


@bp.route("/feedback/<int:analysis_id>", methods=["PUT"])
def submit_feedback(analysis_id):
    data = request.get_json()
    if not data or "corrected_sentiment" not in data:
        return jsonify({"error": "Missing \'corrected_sentiment\' in request body"}), 400

    corrected_sentiment = data["corrected_sentiment"]
    try:
        db.connect()
        analysis_entry = AnalysisHistory.get_or_none(AnalysisHistory.id ==
        analysis_id)
        if not analysis_entry:
            return jsonify({"error": "Analysis entry not found"}), 404
        
        analysis_entry.corrected_sentiment = corrected_sentiment
        analysis_entry.save() 

        return jsonify({"message": "Feedback submitted successfully"}), 200
    
    except Exception as e:
        print(f"Erro ao submeter feedback: {e}")
        return jsonify({"error": "Could not submit feedback"}), 500
    
    finally:
        if not db.is_closed():
            db.close()


@bp.route("/export", methods=["GET"])
def export_history():
    format = request.args.get("format", "csv").lower() 

    if format not in ["csv", "txt"]:
        return jsonify({"error": "Invalid format. Supported formats are csv and txt."}), 400
    
    history_data = []
    
    try:
        db.connect()
        for entry in AnalysisHistory.select():
            history_data.append({
            "id": entry.id,
            "text": entry.text,
            "sentiment": entry.sentiment,
            "score": entry.score,
            "timestamp": entry.timestamp.isoformat(),
            "corrected_sentiment": entry.corrected_sentiment if
            entry.corrected_sentiment else ""
            })

    except Exception as e:
        print(f"Erro ao buscar histórico para exportação: {e}")
    
        return jsonify({"error": "Could not retrieve history for export"}), 500
    
    finally:
        if not db.is_closed():
            db.close()

    if format == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["ID", "Texto", "Sentimento", "Score", "Data/Hora",
        "Sentimento Corrigido"])
        for row in history_data:
            writer.writerow([
            row["id"],
            row["text"],
            row["sentiment"],
            row["score"],
            row["timestamp"],
            row["corrected_sentiment"]
            ])

        csv_output = output.getvalue()

        return Response(
            csv_output,
            mimetype="text/csv",
            headers={
            "Content-Disposition":
            "attachment;filename=sentiment_history.csv"
            }
        
        )

    elif format == "txt":
        output_lines = []
        for row in history_data:
            output_lines.append(f"ID: {row['id']}")
            output_lines.append(f"Texto: {row['text']}")
            output_lines.append(f"Sentimento: {row['sentiment']}")
            output_lines.append(f"Score: {row['score']}")
            output_lines.append(f"Data/Hora: {row['timestamp']}")
            output_lines.append(f"Sentimento Corrigido: {row['corrected_sentiment']}")
            output_lines.append("----------------------------------------")

    txt_output = "\n".join(output_lines)

    return Response(
        txt_output,
        mimetype="text/plain",
        headers={
        "Content-Disposition":
        "attachment;filename=sentiment_history.txt"
        }
    )


@bp.route("/status", methods=["GET"])
def status():
    return jsonify({"status": "Backend is running!"}), 200