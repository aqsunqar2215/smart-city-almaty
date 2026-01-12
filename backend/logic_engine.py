"""
Logical Reasoning and Problem Solving Engine
============================================
This module implements symbolic logic, mathematical reasoning, 
and logical puzzle solving capabilities for the AI.

Features:
- Symbolic logic processor
- Mathematical expression evaluator
- Logical fallacy detector
- Causal reasoning simulation
- World fact reasoning
"""

import re
import math
import operator
from typing import List, Dict, Any, Optional, Tuple, Callable
from dataclasses import dataclass, field

# ============================================
# SYMBOLIC LOGIC PROCESSOR
# ============================================

class SymbolicLogicProcessor:
    """Proccesses IF-THEN rules and syllogisms"""
    
    def __init__(self):
        self.knowledge_base = []
        self.rules = []
        
    def add_fact(self, fact: str):
        self.knowledge_base.append(fact.lower())
        
    def add_rule(self, condition: str, consequence: str):
        self.rules.append((condition.lower(), consequence.lower()))
        
    def infer(self, query: str) -> Optional[str]:
        """Simple forward chaining inference"""
        query_lower = query.lower()
        
        # Check direct facts
        for fact in self.knowledge_base:
            if fact in query_lower:
                return f"Это известный факт: {fact}."
                
        # Check rules
        for condition, consequence in self.rules:
            if condition in query_lower:
                return f"Поскольку {condition}, то {consequence}."
                
        return None

# ============================================
# MATHEMATICAL REASONING
# ============================================

class MathReasoningEngine:
    """Solves mathematical word problems and expressions"""
    
    OPERATIONS = {
        '+': operator.add, '-': operator.sub, 
        '*': operator.mul, '/': operator.truediv,
        '^': operator.pow
    }
    
    WORDS_TO_OP = {
        "плюс": "+", "минус": "-", "умножить": "*", "разделить": "/",
        "plus": "+", "minus": "-", "times": "*", "divided by": "/"
    }
    
    def solve(self, query: str) -> Optional[str]:
        """Identify and solve math in query"""
        # Try to find numeric expression
        expr = re.search(r'(\d+[\s\+\-\*\/\^]+\d+)', query)
        if expr:
            try:
                # Be careful with eval - cleaning first
                clean_expr = re.sub(r'[^\d\+\-\*\/\^\.]', '', expr.group(1))
                result = eval(clean_expr.replace('^', '**'))
                return f"Результат вычисления: {result}"
            except:
                pass
                
        # Word-based math
        for word, op in self.WORDS_TO_OP.items():
            if word in query.lower():
                nums = re.findall(r'\d+', query)
                if len(nums) >= 2:
                    try:
                        a, b = float(nums[0]), float(nums[1])
                        res = self.OPERATIONS[op](a, b)
                        return f"Рассчитал по вашему запросу: {a} {op} {b} = {res}"
                    except:
                        pass
        
        return None

# ============================================
# CAUSAL REASONING
# ============================================

class CausalReasoningEngine:
    """Simulates 'what if' scenarios and causal links"""
    
    CAUSAL_LINKS = {
        "ru": {
            "дождь": "земля становится мокрой, а воздух — чище",
            "пробки": "люди опаздывают, а уровень стресса в городе растёт",
            "смог": "видимость падает и становится труднее дышать",
            "выходные": "люди отдыхают и парки наполняются жизнью",
            "зима": "становится холодно и выпадает снег",
        },
        "en": {
            "rain": "the ground gets wet and the air becomes cleaner",
            "traffic": "people get late and stress levels in the city rise",
            "smog": "visibility drops and it becomes harder to breathe",
            "weekend": "people relax and parks get lively",
        }
    }
    
    def what_if(self, query: str, lang: str = "ru") -> Optional[str]:
        """Handle 'what happens if' queries"""
        query_lower = query.lower()
        if any(w in query_lower for w in ["что если", "если будет", "что будет", "what if"]):
            for cause, effect in self.CAUSAL_LINKS[lang].items():
                if cause in query_lower:
                    if lang == "ru":
                        return f"Если будет {cause}, то {effect}."
                    return f"If there is {cause}, then {effect}."
        return None

# ============================================
# LOGICAL FALLACY DETECTOR
# ============================================

class FallacyDetector:
    """Identifies common logical fallacies in user input"""
    
    FALLACIES = {
        "ad_hominem": {
            "pattern": r"(ты|вы)\s+(глупый|тупой|ничего не понимаешь|робот)",
            "response_ru": "Это похоже на переход на личности (ad hominem). Давайте вернёмся к сути вопроса?",
            "response_en": "That looks like an ad hominem attack. Let's focus on the argument instead?"
        },
        "false_dilemma": {
            "pattern": r"(или|либо)\s+.*(или|либо)",
            "response_ru": "Мир не всегда чёрно-белый. Часто существуют и другие варианты, кроме этих двух.",
            "response_en": "The world isn't always black and white. There are often more than just these two options."
        }
    }
    
    def detect(self, query: str, lang: str = "ru") -> Optional[str]:
        for name, data in self.FALLACIES.items():
            if re.search(data["pattern"], query.lower()):
                return data[f"response_{lang}"]
        return None

# ============================================
# LOGIC ENGINE WRAPPER
# ============================================

class LogicEngine:
    """Main wrapper for all logic sub-engines"""
    
    def __init__(self):
        self.symbolic = SymbolicLogicProcessor()
        self.math = MathReasoningEngine()
        self.causal = CausalReasoningEngine()
        self.fallacy = FallacyDetector()
        
        self._setup_knowledge()
        
    def _setup_knowledge(self):
        # Sample rules
        self.symbolic.add_rule("алматы горы", "можно поехать на Медеу или Шымбулак")
        self.symbolic.add_rule("хочу пить", "стоит поискать кофейню или купить воды")
        self.symbolic.add_rule("плохой воздух", "лучше остаться дома или надеть маску")
        
    def reason(self, query: str, lang: str = "ru") -> Optional[str]:
        """Attempt to reason about the query using available sub-engines"""
        
        # 1. Check for fallacies first
        fallacy_check = self.fallacy.detect(query, lang)
        if fallacy_check:
            return fallacy_check
            
        # 2. Try math
        math_res = self.math.solve(query)
        if math_res:
            return math_res
            
        # 3. Try causal
        causal_res = self.causal.what_if(query, lang)
        if causal_res:
            return causal_res
            
        # 4. Try symbolic logic
        symbolic_res = self.symbolic.infer(query)
        if symbolic_res:
            return symbolic_res
            
        return None

# ================= ===========================
# SINGLETON
# ============================================

_logic_engine: Optional[LogicEngine] = None

def get_logic_engine() -> LogicEngine:
    global _logic_engine
    if _logic_engine is None:
        _logic_engine = LogicEngine()
    return _logic_engine
