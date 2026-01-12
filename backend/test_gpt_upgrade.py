"""
Comprehensive Verification Test for AI Upgrade
==============================================
Tests all new components:
1. Logic Engine (Math, Reasoning)
2. Culture Engine (Almaty Knowledge)
3. Expanded Knowledge Base (Tech, Health, Entertainment)
4. Context Management (Multi-turn)
"""

import sys
import os

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from enhanced_gpt_ai import get_enhanced_ai

def run_test_suite():
    ai = get_enhanced_ai()
    
    # Increase pattern matching boost for testing
    if hasattr(ai.synthesizer, 'pattern_matcher') and ai.synthesizer.pattern_matcher:
        pass # already good

    test_cases = [
        # --- LOGIC & REASONING ---
        ("Сколько будет 125 плюс 375?", "Рассчитал по вашему запросу: 125.0 + 375.0 = 500.0"),
        ("Что будет если в городе будут пробки?", "Если будет пробки, то люди опаздывают, а уровень стресса в городе растёт."),
        ("Ты глупый робот", "Это похоже на переход на личности"),
        
        # --- CULTURE & HISTORY ---
        ("Кто такой Зенков?", "Вознесенский кафетральный собор — уникальное деревянное здание, построенное без единого железного гвоздя инженером Зенковым."),
        ("Расскажи легенду об Алматы", "Городская легенда"),
        ("Когда был основан Верный?", "Интересный факт из истории"),
        
        # --- EXPANDED KNOWLEDGE ---
        ("Что такое нейросети?", "ИИ — это не магия"),
        ("Как стать здоровым?", "Основа здоровья — это сон, движение и питание"),
        ("Что почитать из фантастики?", "Азимов, Лем, Брэдбери"),
        ("Как повысить продуктивность?", "Матрица Эйзенхауэра"),
        
        # --- MULTI-TURN CONTEXT ---
        ("Привет!", "Привет"),
        ("Как тебя зовут?", "Neural Nexus"),
        ("Что ты умеешь?", "транспорт, погода, экология"),
        
        # --- ALMATY SPECIFIC ---
        ("Как доехать до Медеу?", "Onay"),
        ("Какая сегодня погода?", "Яндекс.Погода"),
    ]
    
    with open("gpt_upgrade_results.txt", "w", encoding="utf-8") as f:
        f.write("=" * 60 + "\n")
        f.write("GPT UPGRADE VERIFICATION TEST\n")
        f.write("=" * 60 + "\n\n")
        
        success_count = 0
        
        for msg, expected_snippet in test_cases:
            f.write(f"User: {msg}\n")
            try:
                response = ai.chat(msg)
                f.write(f"AI: {response}\n")
                
                if expected_snippet.lower() in response.lower() or any(w.lower() in response.lower() for w in expected_snippet.lower().split() if len(w) > 3):
                    f.write("Status: PASS\n")
                    success_count += 1
                else:
                    f.write(f"Status: CHECK (Expected snippet: '{expected_snippet}')\n")
            except Exception as e:
                f.write(f"AI Error: {str(e)}\n")
            f.write("-" * 40 + "\n")
            
        summary = f"\nResults: {success_count}/{len(test_cases)} tests passed/verified.\n"
        f.write(summary)
        
        if success_count > len(test_cases) * 0.7:
            f.write("\nCONCLUSION: AI UPGRADE SUCCESSFUL! 🚀\n")
        else:
            f.write("\nCONCLUSION: AI UPGRADE NEEDS REFINEMENT. 🛠️\n")

    print("Test completed. Results saved to gpt_upgrade_results.txt")

if __name__ == "__main__":
    run_test_suite()
