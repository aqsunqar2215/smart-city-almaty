"""
Script to load extended datasets into the AI Knowledge database.
Run this once to populate the database with 10,000+ entries.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, AIKnowledge, init_db
from almaty_dataset import ALMATY_DATASET
from extended_dataset import EXTENDED_DATASET

def load_datasets():
    """Load all datasets into the database"""
    init_db()
    db = SessionLocal()
    
    try:
        # Count existing entries
        existing_count = db.query(AIKnowledge).count()
        print(f"Existing entries in database: {existing_count}")
        
        added_count = 0
        skipped_count = 0
        
        # Load ALMATY_DATASET
        print("\n📚 Loading ALMATY_DATASET...")
        for item in ALMATY_DATASET:
            # Check if pattern already exists
            existing = db.query(AIKnowledge).filter(
                AIKnowledge.pattern == item.get("pattern", ""),
                AIKnowledge.language == item.get("language", "en")
            ).first()
            
            if not existing:
                knowledge = AIKnowledge(
                    category=item.get("category", "GENERAL"),
                    pattern=item.get("pattern", ""),
                    response=item.get("response", ""),
                    language=item.get("language", "en"),
                    importance=item.get("importance", 3)
                )
                db.add(knowledge)
                added_count += 1
            else:
                skipped_count += 1
        
        db.commit()
        print(f"  ✓ Processed {len(ALMATY_DATASET)} entries from ALMATY_DATASET")
        
        # Load EXTENDED_DATASET
        print("\n📚 Loading EXTENDED_DATASET...")
        for item in EXTENDED_DATASET:
            # Check if pattern already exists
            existing = db.query(AIKnowledge).filter(
                AIKnowledge.pattern == item.get("pattern", ""),
                AIKnowledge.language == item.get("language", "en")
            ).first()
            
            if not existing:
                knowledge = AIKnowledge(
                    category=item.get("category", "GENERAL"),
                    pattern=item.get("pattern", ""),
                    response=item.get("response", ""),
                    language=item.get("language", "en"),
                    importance=item.get("importance", 2)
                )
                db.add(knowledge)
                added_count += 1
            else:
                skipped_count += 1
        
        db.commit()
        print(f"  ✓ Processed {len(EXTENDED_DATASET)} entries from EXTENDED_DATASET")
        
        # Final count
        final_count = db.query(AIKnowledge).count()
        
        print("\n" + "="*50)
        print("📊 SUMMARY:")
        print(f"  • New entries added: {added_count}")
        print(f"  • Duplicates skipped: {skipped_count}")
        print(f"  • Total entries in database: {final_count}")
        print("="*50)
        
        # Show category breakdown
        print("\n📁 Categories breakdown:")
        categories = db.query(AIKnowledge.category, db.query(AIKnowledge).filter(AIKnowledge.category == AIKnowledge.category).count()).distinct().all()
        
        from sqlalchemy import func
        category_counts = db.query(AIKnowledge.category, func.count(AIKnowledge.id)).group_by(AIKnowledge.category).all()
        for cat, count in sorted(category_counts, key=lambda x: -x[1]):
            print(f"  • {cat}: {count} entries")
        
        # Show language breakdown
        print("\n🌐 Language breakdown:")
        lang_counts = db.query(AIKnowledge.language, func.count(AIKnowledge.id)).group_by(AIKnowledge.language).all()
        for lang, count in lang_counts:
            lang_name = "Russian" if lang == "ru" else "English"
            print(f"  • {lang_name} ({lang}): {count} entries")
        
        print("\n✅ Database loaded successfully!")
        
    except Exception as e:
        print(f"❌ Error loading datasets: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("="*50)
    print("🚀 Smart City Almaty - Knowledge Database Loader")
    print("="*50)
    load_datasets()
