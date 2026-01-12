from database import SessionLocal, AIKnowledge
from almaty_dataset import ALMATY_DATASET
import re

def sync_knowledge():
    db = SessionLocal()
    try:
        current_patterns = {k.pattern for k in db.query(AIKnowledge).all()}
        new_count = 0
        
        print(f"Syncing Knowledge Base... (Current count: {len(current_patterns)})")
        
        for item in ALMATY_DATASET:
            if item["pattern"] not in current_patterns:
                knowledge = AIKnowledge(
                    category=item["category"],
                    pattern=item["pattern"],
                    response=item["response"],
                    language=item["language"],
                    importance=item.get("importance", 1)
                )
                db.add(knowledge)
                new_count += 1
        
        db.commit()
        print(f"Sync complete. Added {new_count} new knowledge entries.")
    except Exception as e:
        print(f"Error syncing knowledge: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    sync_knowledge()
