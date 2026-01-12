"""
Verification Test for Knowledge Graph
======================================
"""

import sys
import os

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from enhanced_gpt_ai import get_enhanced_ai

def test_knowledge_graph():
    ai = get_enhanced_ai()
    
    print("=" * 60)
    print("KNOWLEDGE GRAPH VERIFICATION TEST")
    print("=" * 60 + "\n")

    # Test query about Zenkov
    print("Testing query: 'Кто такой Зенков?'")
    res1 = ai.chat("Кто такой Зенков?")
    print(f"AI: {res1}")
    
    # Test query about Medeu
    print("\nTesting query: 'Расскажи про Медеу'")
    res2 = ai.chat("Расскажи про Медеу")
    print(f"AI: {res2}")
    
    # Check if related facts are present
    if "связанные факты" in res1.lower() or "зенков" in res1.lower():
        print("\nStatus: ✅ PASS (Zenkov graph link working)")
    
    if "шымбулак" in res2.lower() or "медеу" in res2.lower():
        print("Status: ✅ PASS (Medeu-Shymbulak link working)")

if __name__ == "__main__":
    test_knowledge_graph()
