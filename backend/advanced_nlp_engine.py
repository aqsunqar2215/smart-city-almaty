"""
Advanced NLP Engine for Smart City Almaty AI
============================================
This module implements GPT-like natural language processing capabilities:
- Tokenization and text preprocessing
- TF-IDF based semantic search
- N-gram language model for text generation
- Markov chain for coherent response generation
- Sentiment analysis
- Entity extraction
- Context understanding

Total: ~1200 lines of advanced NLP logic
"""

import re
import math
import json
import random
import hashlib
from typing import List, Dict, Tuple, Optional, Set, Any
from collections import defaultdict, Counter
from dataclasses import dataclass, field
from datetime import datetime
import os

# ============================================
# CONSTANTS AND CONFIGURATION
# ============================================

# Russian stopwords for better text processing
RUSSIAN_STOPWORDS = {
    "а", "без", "более", "больше", "будет", "будто", "бы", "был", "была", "были",
    "было", "быть", "в", "вам", "вас", "ведь", "весь", "вот", "все", "всё", "всего",
    "всех", "вы", "да", "даже", "для", "до", "его", "ее", "её", "ей", "ему", "если",
    "есть", "еще", "ещё", "же", "за", "здесь", "и", "из", "или", "им", "их", "к",
    "как", "какая", "какой", "когда", "кто", "ли", "либо", "мне", "может", "мы",
    "на", "над", "надо", "наш", "не", "него", "нее", "неё", "нет", "ни", "них",
    "но", "ну", "о", "об", "один", "он", "она", "они", "оно", "от", "очень", "по",
    "под", "при", "про", "с", "сам", "свой", "себя", "сказать", "так", "также",
    "такой", "там", "те", "тебя", "тем", "то", "того", "тоже", "той", "только",
    "том", "ты", "у", "уж", "уже", "чего", "чей", "чем", "что", "чтоб", "чтобы",
    "эта", "эти", "это", "этого", "этой", "этом", "этот", "эту", "я"
}

ENGLISH_STOPWORDS = {
    "a", "an", "the", "is", "are", "was", "were", "be", "been", "being", "have",
    "has", "had", "do", "does", "did", "will", "would", "could", "should", "may",
    "might", "must", "shall", "can", "need", "dare", "ought", "used", "to", "of",
    "in", "for", "on", "with", "at", "by", "from", "as", "into", "through", "during",
    "before", "after", "above", "below", "between", "under", "again", "further",
    "then", "once", "here", "there", "when", "where", "why", "how", "all", "each",
    "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only",
    "own", "same", "so", "than", "too", "very", "just", "and", "but", "if", "or",
    "because", "until", "while", "about", "against", "between", "into", "through",
    "during", "before", "after", "above", "below", "up", "down", "out", "off",
    "over", "under", "again", "further", "then", "once", "i", "me", "my", "myself",
    "we", "our", "ours", "ourselves", "you", "your", "yours", "yourself", "yourselves",
    "he", "him", "his", "himself", "she", "her", "hers", "herself", "it", "its",
    "itself", "they", "them", "their", "theirs", "themselves", "what", "which",
    "who", "whom", "this", "that", "these", "those", "am"
}

# Sentiment lexicons
POSITIVE_WORDS_RU = {
    "хорошо", "отлично", "прекрасно", "замечательно", "великолепно", "чудесно",
    "здорово", "супер", "класс", "круто", "молодец", "спасибо", "благодарю",
    "рад", "счастлив", "доволен", "нравится", "люблю", "обожаю", "восхищаюсь",
    "красиво", "интересно", "полезно", "удобно", "приятно", "легко", "быстро",
    "надежно", "качественно", "профессионально", "вежливо", "дружелюбно"
}

NEGATIVE_WORDS_RU = {
    "плохо", "ужасно", "отвратительно", "кошмар", "беда", "проблема", "ошибка",
    "неудобно", "медленно", "долго", "сложно", "трудно", "непонятно", "грубо",
    "невежливо", "грязно", "шумно", "опасно", "страшно", "боюсь", "ненавижу",
    "раздражает", "бесит", "злит", "расстраивает", "разочарован", "обижен"
}

POSITIVE_WORDS_EN = {
    "good", "great", "excellent", "wonderful", "amazing", "fantastic", "awesome",
    "nice", "beautiful", "helpful", "useful", "convenient", "fast", "quick",
    "reliable", "quality", "professional", "friendly", "love", "like", "enjoy",
    "happy", "pleased", "satisfied", "glad", "thankful", "grateful", "perfect"
}

NEGATIVE_WORDS_EN = {
    "bad", "terrible", "awful", "horrible", "poor", "problem", "issue", "error",
    "slow", "difficult", "hard", "confusing", "rude", "dirty", "noisy", "dangerous",
    "scary", "hate", "dislike", "angry", "frustrated", "disappointed", "upset"
}

# ============================================
# DATA CLASSES
# ============================================

@dataclass
class Token:
    """Represents a processed token with metadata"""
    text: str
    original: str
    pos: str = "UNKNOWN"  # Part of speech
    is_stopword: bool = False
    is_entity: bool = False
    entity_type: Optional[str] = None
    sentiment: float = 0.0  # -1.0 to 1.0

@dataclass
class Document:
    """Represents a document in the knowledge base"""
    id: str
    text: str
    tokens: List[Token] = field(default_factory=list)
    tf_idf: Dict[str, float] = field(default_factory=dict)
    category: str = "general"
    language: str = "ru"
    importance: float = 1.0

@dataclass
class ConversationContext:
    """Maintains conversation state and history"""
    messages: List[Dict[str, str]] = field(default_factory=list)
    entities: Dict[str, Any] = field(default_factory=dict)
    topics: List[str] = field(default_factory=list)
    sentiment_history: List[float] = field(default_factory=list)
    user_preferences: Dict[str, Any] = field(default_factory=dict)
    last_intent: Optional[str] = None
    turn_count: int = 0

@dataclass
class GenerationConfig:
    """Configuration for text generation"""
    max_length: int = 150
    min_length: int = 10
    temperature: float = 0.7
    top_k: int = 50
    top_p: float = 0.9
    repetition_penalty: float = 1.2
    use_context: bool = True
    add_personality: bool = True

# ============================================
# TEXT PREPROCESSING
# ============================================

class TextPreprocessor:
    """Advanced text preprocessing with Russian and English support"""
    
    # Russian stemming rules (simplified Porter-like)
    RUSSIAN_SUFFIXES = [
        "ами", "ями", "ому", "ему", "ого", "его", "ыми", "ими", "ать", "ять",
        "ить", "еть", "ова", "ева", "ива", "ыва", "ающ", "яющ", "ющ", "ащ",
        "ящ", "вши", "ивш", "ывш", "нн", "ем", "им", "ым", "ой", "ий", "ый",
        "ая", "яя", "ое", "ее", "ие", "ые", "ую", "юю", "ом", "ам", "ям",
        "ах", "ях", "ей", "ов", "ев", "ий", "ть", "ся", "сь", "ет", "ут",
        "ют", "ат", "ят", "ит", "ла", "ло", "ли", "на", "но", "ни", "ка",
        "ко", "ки", "ек", "ок", "ик", "ен", "он", "ин", "ан"
    ]
    
    # English stemming rules (simplified Porter)
    ENGLISH_SUFFIXES = [
        "ational", "tional", "enci", "anci", "izer", "ation", "ator", "alism",
        "iveness", "fulness", "ousness", "aliti", "iviti", "biliti", "ical",
        "ness", "ment", "ent", "ance", "ence", "able", "ible", "ant", "ement",
        "ment", "ent", "ism", "ate", "iti", "ous", "ive", "ize", "ing", "ion",
        "en", "er", "es", "ed", "ly", "al", "or", "ty", "ry"
    ]
    
    def __init__(self):
        self.word_cache = {}
        
    def preprocess(self, text: str, lang: str = "ru") -> List[Token]:
        """Full preprocessing pipeline"""
        # Normalize text
        text = self._normalize(text)
        
        # Tokenize
        raw_tokens = self._tokenize(text)
        
        # Process each token
        tokens = []
        stopwords = RUSSIAN_STOPWORDS if lang == "ru" else ENGLISH_STOPWORDS
        positive = POSITIVE_WORDS_RU if lang == "ru" else POSITIVE_WORDS_EN
        negative = NEGATIVE_WORDS_RU if lang == "ru" else NEGATIVE_WORDS_EN
        
        for raw in raw_tokens:
            # Stem the word
            stemmed = self._stem(raw.lower(), lang)
            
            # Check if stopword
            is_stop = raw.lower() in stopwords
            
            # Calculate sentiment
            sentiment = 0.0
            if raw.lower() in positive:
                sentiment = 0.5
            elif raw.lower() in negative:
                sentiment = -0.5
                
            # Check for entities
            is_entity, entity_type = self._detect_entity(raw)
            
            # Determine POS (simplified)
            pos = self._get_pos(raw, lang)
            
            token = Token(
                text=stemmed,
                original=raw,
                pos=pos,
                is_stopword=is_stop,
                is_entity=is_entity,
                entity_type=entity_type,
                sentiment=sentiment
            )
            tokens.append(token)
            
        return tokens
    
    def _normalize(self, text: str) -> str:
        """Normalize text: lowercase, remove extra spaces, fix encoding"""
        # Replace multiple spaces with single
        text = re.sub(r'\s+', ' ', text)
        # Remove special characters but keep letters and numbers
        text = re.sub(r'[^\w\s\.\,\!\?\-]', '', text)
        return text.strip()
    
    def _tokenize(self, text: str) -> List[str]:
        """Split text into tokens"""
        # Split on whitespace and punctuation
        tokens = re.findall(r'\b[\w]+\b', text, re.UNICODE)
        return tokens
    
    def _stem(self, word: str, lang: str = "ru") -> str:
        """Simple stemming for Russian and English"""
        # Check cache
        cache_key = f"{lang}:{word}"
        if cache_key in self.word_cache:
            return self.word_cache[cache_key]
        
        original = word
        
        if lang == "ru":
            suffixes = self.RUSSIAN_SUFFIXES
        else:
            suffixes = self.ENGLISH_SUFFIXES
            
        # Remove longest matching suffix
        for suffix in sorted(suffixes, key=len, reverse=True):
            if word.endswith(suffix) and len(word) - len(suffix) >= 2:
                word = word[:-len(suffix)]
                break
        
        # Cache result
        self.word_cache[cache_key] = word
        return word
    
    def _detect_entity(self, word: str) -> Tuple[bool, Optional[str]]:
        """Detect if word is a named entity"""
        # Numbers
        if re.match(r'^\d+$', word):
            return True, "NUMBER"
        
        # Phone numbers
        if re.match(r'^\d{3}$', word):
            return True, "PHONE"
            
        # Capitalized words (potential proper nouns)
        if word[0].isupper() and len(word) > 1:
            return True, "PROPER_NOUN"
            
        return False, None
    
    def _get_pos(self, word: str, lang: str) -> str:
        """Simple POS tagging based on word endings"""
        word_lower = word.lower()
        
        if lang == "ru":
            if word_lower.endswith(("ть", "ти", "чь")):
                return "VERB"
            elif word_lower.endswith(("ый", "ий", "ой", "ая", "яя", "ое", "ее")):
                return "ADJ"
            elif word_lower.endswith(("о", "е")) and len(word) > 2:
                return "ADV"
            else:
                return "NOUN"
        else:
            if word_lower.endswith(("ing", "ed", "es", "s")):
                return "VERB"
            elif word_lower.endswith(("ly",)):
                return "ADV"
            elif word_lower.endswith(("ful", "less", "ous", "ive", "able")):
                return "ADJ"
            else:
                return "NOUN"


# ============================================
# TF-IDF SEARCH ENGINE
# ============================================

class TFIDFEngine:
    """TF-IDF based semantic search engine"""
    
    def __init__(self):
        self.documents: Dict[str, Document] = {}
        self.idf: Dict[str, float] = {}
        self.vocab: Set[str] = set()
        self.preprocessor = TextPreprocessor()
        
    def add_document(self, doc_id: str, text: str, category: str = "general", 
                     lang: str = "ru", importance: float = 1.0):
        """Add a document to the index"""
        tokens = self.preprocessor.preprocess(text, lang)
        
        doc = Document(
            id=doc_id,
            text=text,
            tokens=tokens,
            category=category,
            language=lang,
            importance=importance
        )
        
        # Calculate TF for this document
        word_counts = Counter(t.text for t in tokens if not t.is_stopword)
        total_words = sum(word_counts.values())
        
        if total_words > 0:
            for word, count in word_counts.items():
                doc.tf_idf[word] = count / total_words
                self.vocab.add(word)
        
        self.documents[doc_id] = doc
        
    def build_index(self):
        """Build IDF values for all terms"""
        n_docs = len(self.documents)
        if n_docs == 0:
            return
            
        # Count document frequency for each term
        df = Counter()
        for doc in self.documents.values():
            terms_in_doc = set(doc.tf_idf.keys())
            for term in terms_in_doc:
                df[term] += 1
        
        # Calculate IDF
        for term, doc_freq in df.items():
            self.idf[term] = math.log(n_docs / (doc_freq + 1)) + 1
            
        # Update TF-IDF scores
        for doc in self.documents.values():
            for term in doc.tf_idf:
                tf = doc.tf_idf[term]
                idf = self.idf.get(term, 1.0)
                doc.tf_idf[term] = tf * idf
    
    def search(self, query: str, lang: str = "ru", top_k: int = 5) -> List[Tuple[Document, float]]:
        """Search for relevant documents"""
        # Preprocess query
        query_tokens = self.preprocessor.preprocess(query, lang)
        query_terms = [t.text for t in query_tokens if not t.is_stopword]
        
        if not query_terms:
            return []
        
        # Calculate query TF-IDF
        query_tf = Counter(query_terms)
        total = sum(query_tf.values())
        query_vector = {}
        
        for term, count in query_tf.items():
            tf = count / total
            idf = self.idf.get(term, 1.0)
            query_vector[term] = tf * idf
        
        # Calculate cosine similarity with all documents
        results = []
        query_norm = math.sqrt(sum(v**2 for v in query_vector.values()))
        
        if query_norm == 0:
            return []
        
        for doc in self.documents.values():
            if doc.language != lang:
                continue
                
            # Dot product
            dot_product = sum(
                query_vector.get(term, 0) * doc.tf_idf.get(term, 0)
                for term in query_vector
            )
            
            # Document norm
            doc_norm = math.sqrt(sum(v**2 for v in doc.tf_idf.values()))
            
            if doc_norm == 0:
                continue
                
            # Cosine similarity with importance boost
            similarity = (dot_product / (query_norm * doc_norm)) * doc.importance
            
            if similarity > 0.01:  # Threshold
                results.append((doc, similarity))
        
        # Sort by similarity and return top k
        results.sort(key=lambda x: x[1], reverse=True)
        return results[:top_k]


# ============================================
# N-GRAM LANGUAGE MODEL
# ============================================

class NGramModel:
    """N-gram language model for text generation"""
    
    def __init__(self, n: int = 3):
        self.n = n
        self.ngrams: Dict[Tuple, Counter] = defaultdict(Counter)
        self.start_sequences: List[Tuple] = []
        self.vocab: Set[str] = set()
        self.total_ngrams = 0
        
    def train(self, texts: List[str], lang: str = "ru"):
        """Train the model on a list of texts"""
        preprocessor = TextPreprocessor()
        
        for text in texts:
            # Add start/end tokens
            tokens = ["<START>"] * (self.n - 1)
            
            # Get words from text
            words = re.findall(r'\b[\w]+\b', text.lower(), re.UNICODE)
            tokens.extend(words)
            tokens.append("<END>")
            
            # Extract n-grams
            for i in range(len(tokens) - self.n + 1):
                context = tuple(tokens[i:i + self.n - 1])
                next_word = tokens[i + self.n - 1]
                
                self.ngrams[context][next_word] += 1
                self.vocab.add(next_word)
                self.total_ngrams += 1
                
                # Store start sequences
                if tokens[i] == "<START>":
                    self.start_sequences.append(context)
    
    def generate(self, seed: Optional[str] = None, max_length: int = 50, 
                 temperature: float = 0.7) -> str:
        """Generate text using the n-gram model"""
        if not self.ngrams:
            return ""
        
        # Initialize with seed or random start
        if seed:
            words = seed.lower().split()
            if len(words) >= self.n - 1:
                current = tuple(words[-(self.n - 1):])
            else:
                current = tuple(["<START>"] * (self.n - 1 - len(words)) + words)
        else:
            if self.start_sequences:
                current = random.choice(self.start_sequences)
            else:
                current = tuple(["<START>"] * (self.n - 1))
        
        result = list(current)
        
        for _ in range(max_length):
            if current not in self.ngrams:
                break
                
            candidates = self.ngrams[current]
            if not candidates:
                break
            
            # Apply temperature sampling
            next_word = self._sample_with_temperature(candidates, temperature)
            
            if next_word == "<END>":
                break
                
            result.append(next_word)
            current = tuple(result[-(self.n - 1):])
        
        # Remove start tokens and clean up
        result = [w for w in result if w not in ("<START>", "<END>")]
        return " ".join(result)
    
    def _sample_with_temperature(self, candidates: Counter, temperature: float) -> str:
        """Sample next word with temperature"""
        if temperature <= 0:
            return candidates.most_common(1)[0][0]
        
        words = list(candidates.keys())
        counts = list(candidates.values())
        
        # Apply temperature
        total = sum(counts)
        probs = [(c / total) ** (1 / temperature) for c in counts]
        prob_sum = sum(probs)
        probs = [p / prob_sum for p in probs]
        
        # Sample
        r = random.random()
        cumsum = 0
        for word, prob in zip(words, probs):
            cumsum += prob
            if r <= cumsum:
                return word
                
        return words[-1]
    
    def get_probability(self, context: Tuple[str], word: str) -> float:
        """Get probability of word given context"""
        if context not in self.ngrams:
            return 0.0
            
        total = sum(self.ngrams[context].values())
        count = self.ngrams[context].get(word, 0)
        
        return count / total if total > 0 else 0.0


# ============================================
# MARKOV CHAIN GENERATOR
# ============================================

class MarkovChainGenerator:
    """Markov chain for coherent text generation"""
    
    def __init__(self, order: int = 2):
        self.order = order
        self.chains: Dict[str, Dict[Tuple, Counter]] = {
            "ru": defaultdict(Counter),
            "en": defaultdict(Counter)
        }
        self.sentence_starters: Dict[str, List[Tuple]] = {"ru": [], "en": []}
        
    def train(self, texts: List[str], lang: str = "ru"):
        """Train Markov chain on texts"""
        for text in texts:
            sentences = re.split(r'[.!?]+', text)
            
            for sentence in sentences:
                words = re.findall(r'\b[\w]+\b', sentence.lower(), re.UNICODE)
                if len(words) < self.order + 1:
                    continue
                    
                # Mark sentence starters
                start_key = tuple(words[:self.order])
                if start_key not in self.sentence_starters[lang]:
                    self.sentence_starters[lang].append(start_key)
                
                # Build chain
                for i in range(len(words) - self.order):
                    key = tuple(words[i:i + self.order])
                    next_word = words[i + self.order]
                    self.chains[lang][key][next_word] += 1
    
    def generate_sentence(self, seed: Optional[str] = None, lang: str = "ru",
                          min_length: int = 5, max_length: int = 30) -> str:
        """Generate a single sentence"""
        chain = self.chains[lang]
        starters = self.sentence_starters[lang]
        
        if not chain or not starters:
            return ""
        
        # Initialize
        if seed:
            words = seed.lower().split()[-self.order:]
            if len(words) < self.order:
                current = random.choice(starters) if starters else tuple(words)
            else:
                current = tuple(words)
        else:
            current = random.choice(starters)
        
        result = list(current)
        
        for _ in range(max_length):
            if current not in chain:
                # Try to find similar key
                found = False
                for key in chain:
                    if key[-1] == current[-1]:
                        current = key
                        found = True
                        break
                if not found:
                    break
            
            candidates = chain[current]
            if not candidates:
                break
            
            # Weighted random choice
            total = sum(candidates.values())
            r = random.random() * total
            cumsum = 0
            next_word = None
            
            for word, count in candidates.items():
                cumsum += count
                if r <= cumsum:
                    next_word = word
                    break
            
            if next_word is None:
                break
                
            result.append(next_word)
            current = tuple(result[-self.order:])
        
        if len(result) < min_length:
            return ""
            
        # Capitalize first letter
        text = " ".join(result)
        return text[0].upper() + text[1:] if text else ""

    def continue_text(self, prefix: str, lang: str = "ru", 
                      num_words: int = 10) -> str:
        """Continue given text with generated content"""
        words = prefix.lower().split()
        
        if len(words) < self.order:
            return prefix
            
        result = list(words)
        current = tuple(words[-self.order:])
        chain = self.chains[lang]
        
        for _ in range(num_words):
            if current not in chain:
                break
                
            candidates = chain[current]
            if not candidates:
                break
            
            # Sample next word
            total = sum(candidates.values())
            r = random.random() * total
            cumsum = 0
            
            for word, count in candidates.items():
                cumsum += count
                if r <= cumsum:
                    result.append(word)
                    break
            
            current = tuple(result[-self.order:])
        
        return " ".join(result)


# ============================================
# SENTIMENT ANALYZER
# ============================================

class SentimentAnalyzer:
    """Analyze sentiment of text"""
    
    def __init__(self):
        self.preprocessor = TextPreprocessor()
        
        # Sentiment intensity modifiers
        self.intensifiers_ru = {
            "очень": 1.5, "крайне": 2.0, "невероятно": 2.0, "слегка": 0.5,
            "немного": 0.5, "чуть": 0.3, "весьма": 1.3, "довольно": 1.2,
            "слишком": 1.5, "чересчур": 1.5, "абсолютно": 2.0, "совершенно": 2.0
        }
        
        self.intensifiers_en = {
            "very": 1.5, "extremely": 2.0, "incredibly": 2.0, "slightly": 0.5,
            "somewhat": 0.5, "a bit": 0.3, "quite": 1.3, "rather": 1.2,
            "too": 1.5, "absolutely": 2.0, "completely": 2.0, "totally": 2.0
        }
        
        # Negation words
        self.negations_ru = {"не", "нет", "ни", "никак", "никогда", "никто", "ничто"}
        self.negations_en = {"not", "no", "never", "neither", "nobody", "nothing", "none"}
        
    def analyze(self, text: str, lang: str = "ru") -> Dict[str, Any]:
        """Analyze sentiment of text"""
        tokens = self.preprocessor.preprocess(text, lang)
        
        positive = POSITIVE_WORDS_RU if lang == "ru" else POSITIVE_WORDS_EN
        negative = NEGATIVE_WORDS_RU if lang == "ru" else NEGATIVE_WORDS_EN
        intensifiers = self.intensifiers_ru if lang == "ru" else self.intensifiers_en
        negations = self.negations_ru if lang == "ru" else self.negations_en
        
        score = 0.0
        word_count = 0
        positive_words = []
        negative_words = []
        
        prev_was_negation = False
        intensity_modifier = 1.0
        
        for token in tokens:
            word = token.original.lower()
            
            # Check for intensifier
            if word in intensifiers:
                intensity_modifier = intensifiers[word]
                continue
            
            # Check for negation
            if word in negations:
                prev_was_negation = True
                continue
            
            # Skip stopwords for sentiment
            if token.is_stopword:
                continue
            
            # Calculate sentiment
            word_sentiment = 0.0
            
            if word in positive:
                word_sentiment = 0.5
                positive_words.append(word)
            elif word in negative:
                word_sentiment = -0.5
                negative_words.append(word)
            
            # Apply modifiers
            if word_sentiment != 0:
                if prev_was_negation:
                    word_sentiment *= -1
                word_sentiment *= intensity_modifier
                score += word_sentiment
                word_count += 1
            
            # Reset modifiers
            prev_was_negation = False
            intensity_modifier = 1.0
        
        # Normalize score to [-1, 1]
        if word_count > 0:
            score = max(-1.0, min(1.0, score / word_count))
        
        # Determine label
        if score > 0.2:
            label = "positive"
        elif score < -0.2:
            label = "negative"
        else:
            label = "neutral"
        
        return {
            "score": score,
            "label": label,
            "confidence": abs(score),
            "positive_words": positive_words,
            "negative_words": negative_words,
            "word_count": len(tokens)
        }


# ============================================
# ENTITY EXTRACTOR
# ============================================

class EntityExtractor:
    """Extract named entities from text"""
    
    # Almaty-specific entities
    ALMATY_LOCATIONS = {
        "медеу", "шымбулак", "кок-тобе", "коктобе", "кок тобе", "бао", 
        "большое алматинское озеро", "зенков", "арбат", "парк панфилов",
        "парк панфиловцев", "28 панфиловцев", "ботанический сад", "алмалы",
        "аэропорт", "вокзал алматы", "мега", "достык плаза", "эсентай"
    }
    
    TRANSPORT_ENTITIES = {
        "метро", "автобус", "троллейбус", "трамвай", "такси", "маршрутка",
        "metro", "bus", "taxi", "subway", "тр", "onay", "онай"
    }
    
    EMERGENCY_ENTITIES = {
        "101", "102", "103", "104", "112", "скорая", "пожар", "полиция",
        "ambulance", "fire", "police", "emergency"
    }
    
    def __init__(self):
        self.preprocessor = TextPreprocessor()
        
    def extract(self, text: str, lang: str = "ru") -> Dict[str, List[str]]:
        """Extract all entities from text"""
        text_lower = text.lower()
        entities = {
            "locations": [],
            "transport": [],
            "emergency": [],
            "numbers": [],
            "dates": [],
            "times": [],
            "names": []
        }
        
        # Extract locations
        for loc in self.ALMATY_LOCATIONS:
            if loc in text_lower:
                entities["locations"].append(loc)
        
        # Extract transport
        for tr in self.TRANSPORT_ENTITIES:
            if tr in text_lower:
                entities["transport"].append(tr)
        
        # Extract emergency
        for em in self.EMERGENCY_ENTITIES:
            if em in text_lower:
                entities["emergency"].append(em)
        
        # Extract numbers (phone, bus routes, etc.)
        numbers = re.findall(r'\b\d{1,3}\b', text)
        entities["numbers"] = numbers
        
        # Extract times
        times = re.findall(r'\b\d{1,2}:\d{2}\b', text)
        entities["times"] = times
        
        # Extract dates (various formats)
        dates = re.findall(r'\b\d{1,2}[./]\d{1,2}[./]?\d{0,4}\b', text)
        entities["dates"] = dates
        
        # Extract capitalized words (potential names)
        words = text.split()
        for word in words:
            if word[0].isupper() and len(word) > 1 and word.lower() not in self.ALMATY_LOCATIONS:
                # Check if it's not at the start of a sentence
                idx = text.find(word)
                if idx > 0 and text[idx-1] not in '.!?':
                    entities["names"].append(word)
        
        return entities


# ============================================
# RESPONSE QUALITY SCORER
# ============================================

class ResponseQualityScorer:
    """Score quality of generated responses"""
    
    def __init__(self):
        self.preprocessor = TextPreprocessor()
        
    def score(self, response: str, query: str, lang: str = "ru") -> Dict[str, float]:
        """Score response quality on multiple dimensions"""
        scores = {}
        
        # Length appropriateness (not too short, not too long)
        words = response.split()
        length = len(words)
        if 5 <= length <= 50:
            scores["length"] = 1.0
        elif length < 5:
            scores["length"] = length / 5
        else:
            scores["length"] = max(0.5, 1.0 - (length - 50) / 100)
        
        # Relevance (keyword overlap)
        query_tokens = set(self.preprocessor._tokenize(query.lower()))
        response_tokens = set(self.preprocessor._tokenize(response.lower()))
        
        if query_tokens:
            overlap = len(query_tokens & response_tokens)
            scores["relevance"] = min(1.0, overlap / len(query_tokens) * 2)
        else:
            scores["relevance"] = 0.5
        
        # Coherence (no repetition)
        word_counts = Counter(words)
        if words:
            max_repeat = max(word_counts.values())
            scores["coherence"] = 1.0 - min(0.5, (max_repeat - 1) / len(words))
        else:
            scores["coherence"] = 0.5
        
        # Fluency (proper punctuation and capitalization)
        has_capital = response[0].isupper() if response else False
        has_punct = response[-1] in '.!?' if response else False
        scores["fluency"] = (0.5 if has_capital else 0) + (0.5 if has_punct else 0)
        
        # Overall score
        weights = {"length": 0.2, "relevance": 0.4, "coherence": 0.2, "fluency": 0.2}
        scores["overall"] = sum(scores[k] * weights[k] for k in weights)
        
        return scores


# ============================================
# CONTEXT MANAGER
# ============================================

class ConversationContextManager:
    """Manage conversation context and history"""
    
    def __init__(self, max_history: int = 20):
        self.contexts: Dict[str, ConversationContext] = {}
        self.max_history = max_history
        self.entity_extractor = EntityExtractor()
        self.sentiment_analyzer = SentimentAnalyzer()
        
    def get_context(self, session_id: str) -> ConversationContext:
        """Get or create context for session"""
        if session_id not in self.contexts:
            self.contexts[session_id] = ConversationContext()
        return self.contexts[session_id]
    
    def update_context(self, session_id: str, role: str, message: str, 
                       lang: str = "ru", intent: Optional[str] = None):
        """Update context with new message"""
        ctx = self.get_context(session_id)
        
        # Add message to history
        ctx.messages.append({
            "role": role,
            "content": message,
            "timestamp": datetime.now().isoformat()
        })
        
        # Trim history if needed
        if len(ctx.messages) > self.max_history:
            ctx.messages = ctx.messages[-self.max_history:]
        
        # Extract entities
        if role == "user":
            entities = self.entity_extractor.extract(message, lang)
            for key, values in entities.items():
                if values:
                    ctx.entities[key] = values
            
            # Update topics
            if entities["locations"]:
                for loc in entities["locations"]:
                    if loc not in ctx.topics:
                        ctx.topics.append(loc)
            
            # Analyze sentiment
            sentiment = self.sentiment_analyzer.analyze(message, lang)
            ctx.sentiment_history.append(sentiment["score"])
            
            # Keep only recent sentiments
            if len(ctx.sentiment_history) > 10:
                ctx.sentiment_history = ctx.sentiment_history[-10:]
            
            # Update intent
            if intent:
                ctx.last_intent = intent
        
        ctx.turn_count += 1
    
    def get_recent_context(self, session_id: str, n: int = 3) -> str:
        """Get recent conversation as string for context"""
        ctx = self.get_context(session_id)
        recent = ctx.messages[-n*2:] if len(ctx.messages) > n*2 else ctx.messages
        
        lines = []
        for msg in recent:
            role = "User" if msg["role"] == "user" else "AI"
            lines.append(f"{role}: {msg['content']}")
        
        return "\n".join(lines)
    
    def get_average_sentiment(self, session_id: str) -> float:
        """Get average sentiment of conversation"""
        ctx = self.get_context(session_id)
        if not ctx.sentiment_history:
            return 0.0
        return sum(ctx.sentiment_history) / len(ctx.sentiment_history)
    
    def clear_context(self, session_id: str):
        """Clear context for session"""
        if session_id in self.contexts:
            del self.contexts[session_id]


# ============================================
# RESPONSE TEMPLATES
# ============================================

class ResponseTemplateEngine:
    """Template-based response generation with variations"""
    
    def __init__(self):
        self.templates = self._load_templates()
        
    def _load_templates(self) -> Dict[str, Dict[str, List[str]]]:
        """Load response templates"""
        return {
            "greeting": {
                "ru": [
                    "Привет! Чем могу помочь?",
                    "Здравствуйте! Рад вас видеть. Что вас интересует?",
                    "Салем! Я ваш помощник. Спрашивайте!",
                    "Добрый день! Готов ответить на ваши вопросы.",
                    "Приветствую! Чем могу быть полезен сегодня?",
                ],
                "en": [
                    "Hello! How can I help you?",
                    "Hi there! What would you like to know?",
                    "Hey! I'm here to assist you.",
                    "Good day! Ready to answer your questions.",
                    "Welcome! How may I help you today?",
                ]
            },
            "thanks": {
                "ru": [
                    "Рад помочь!",
                    "Пожалуйста! Обращайтесь ещё.",
                    "Всегда к вашим услугам!",
                    "Не за что! Удачного дня!",
                    "Были рады помочь!",
                ],
                "en": [
                    "Happy to help!",
                    "You're welcome! Come back anytime.",
                    "Always at your service!",
                    "No problem! Have a great day!",
                    "Glad I could help!",
                ]
            },
            "unknown": {
                "ru": [
                    "Не совсем понял вас. Можете уточнить?",
                    "Хм, интересный вопрос. Расскажите подробнее?",
                    "Я могу помочь с транспортом, погодой и городом. Что вас интересует?",
                    "Попробуйте спросить по-другому?",
                ],
                "en": [
                    "I'm not quite sure I understand. Could you clarify?",
                    "Hmm, interesting question. Can you tell me more?",
                    "I can help with transport, weather, and city info. What interests you?",
                    "Could you try asking that differently?",
                ]
            },
            "affirmation": {
                "ru": [
                    "Понял вас.",
                    "Хорошо, сейчас посмотрю.",
                    "Одну секунду...",
                    "Да, конечно!",
                    "Разумеется!",
                ],
                "en": [
                    "Got it.",
                    "Alright, let me check.",
                    "One moment...",
                    "Yes, of course!",
                    "Certainly!",
                ]
            },
            "empathy_positive": {
                "ru": [
                    "Рад это слышать!",
                    "Отлично!",
                    "Замечательно!",
                    "Это здорово!",
                ],
                "en": [
                    "Glad to hear that!",
                    "Excellent!",
                    "Wonderful!",
                    "That's great!",
                ]
            },
            "empathy_negative": {
                "ru": [
                    "Понимаю, это может быть неприятно.",
                    "Сочувствую.",
                    "Надеюсь, ситуация улучшится.",
                    "Жаль это слышать.",
                ],
                "en": [
                    "I understand, that can be frustrating.",
                    "I'm sorry to hear that.",
                    "I hope things improve.",
                    "That's unfortunate.",
                ]
            }
        }
    
    def get_template(self, category: str, lang: str = "ru", 
                     sentiment: float = 0.0) -> str:
        """Get appropriate template based on category and sentiment"""
        # Adjust category based on sentiment
        if sentiment > 0.3 and category == "unknown":
            category = "empathy_positive"
        elif sentiment < -0.3 and category == "unknown":
            category = "empathy_negative"
        
        if category in self.templates:
            templates = self.templates[category].get(lang, self.templates[category].get("en", []))
            if templates:
                return random.choice(templates)
        
        return ""
    
    def fill_template(self, template: str, **kwargs) -> str:
        """Fill template placeholders with values"""
        for key, value in kwargs.items():
            template = template.replace(f"{{{key}}}", str(value))
        return template


# ============================================
# MAIN NLP PROCESSOR
# ============================================

class AdvancedNLPProcessor:
    """Main NLP processor combining all components"""
    
    def __init__(self):
        self.preprocessor = TextPreprocessor()
        self.tfidf_engine = TFIDFEngine()
        self.ngram_model = NGramModel(n=3)
        self.markov_generator = MarkovChainGenerator(order=2)
        self.sentiment_analyzer = SentimentAnalyzer()
        self.entity_extractor = EntityExtractor()
        self.context_manager = ConversationContextManager()
        self.template_engine = ResponseTemplateEngine()
        self.quality_scorer = ResponseQualityScorer()
        
        self._initialized = False
        
    def initialize(self, knowledge_base: List[Dict[str, str]]):
        """Initialize with knowledge base"""
        # Build TF-IDF index
        for i, item in enumerate(knowledge_base):
            self.tfidf_engine.add_document(
                doc_id=f"doc_{i}",
                text=item.get("text", item.get("response", "")),
                category=item.get("category", "general"),
                lang=item.get("language", "ru"),
                importance=item.get("importance", 1.0)
            )
        
        self.tfidf_engine.build_index()
        
        # Train language models
        texts = [item.get("text", item.get("response", "")) for item in knowledge_base]
        
        ru_texts = [t for i, t in enumerate(texts) 
                    if knowledge_base[i].get("language", "ru") == "ru"]
        en_texts = [t for i, t in enumerate(texts) 
                    if knowledge_base[i].get("language", "ru") == "en"]
        
        if ru_texts:
            self.ngram_model.train(ru_texts, "ru")
            self.markov_generator.train(ru_texts, "ru")
            
        if en_texts:
            self.ngram_model.train(en_texts, "en")
            self.markov_generator.train(en_texts, "en")
        
        self._initialized = True
    
    def process_query(self, query: str, session_id: str = "default",
                      lang: str = "ru", intent: Optional[str] = None) -> Dict[str, Any]:
        """Process query and return analysis results"""
        # Update context
        self.context_manager.update_context(session_id, "user", query, lang, intent)
        
        # Extract entities
        entities = self.entity_extractor.extract(query, lang)
        
        # Analyze sentiment
        sentiment = self.sentiment_analyzer.analyze(query, lang)
        
        # Search knowledge base
        search_results = self.tfidf_engine.search(query, lang, top_k=5)
        
        # Get context
        context = self.context_manager.get_context(session_id)
        recent_context = self.context_manager.get_recent_context(session_id, n=3)
        
        return {
            "query": query,
            "entities": entities,
            "sentiment": sentiment,
            "search_results": [(doc.text, score) for doc, score in search_results],
            "context": {
                "turn_count": context.turn_count,
                "topics": context.topics,
                "last_intent": context.last_intent,
                "avg_sentiment": self.context_manager.get_average_sentiment(session_id)
            },
            "recent_history": recent_context
        }
    
    def generate_response(self, query: str, session_id: str = "default",
                          lang: str = "ru", config: Optional[GenerationConfig] = None) -> str:
        """Generate response for query"""
        config = config or GenerationConfig()
        
        # Process query
        analysis = self.process_query(query, session_id, lang)
        
        # Get best matching response from search
        if analysis["search_results"]:
            best_match, score = analysis["search_results"][0]
            
            if score > 0.3:
                # High confidence match - use it
                response = best_match
            elif score > 0.1:
                # Medium confidence - maybe enhance with generation
                if config.use_context:
                    enhanced = self.markov_generator.continue_text(
                        best_match[:50], lang, num_words=15
                    )
                    if enhanced and len(enhanced) > len(best_match):
                        response = enhanced
                    else:
                        response = best_match
                else:
                    response = best_match
            else:
                # Low confidence - generate or use template
                response = self._generate_fallback(query, lang, analysis)
        else:
            response = self._generate_fallback(query, lang, analysis)
        
        # Add personality based on sentiment
        if config.add_personality:
            sentiment_score = analysis["sentiment"]["score"]
            if sentiment_score > 0.3:
                prefix = self.template_engine.get_template("empathy_positive", lang)
                if prefix:
                    response = f"{prefix} {response}"
            elif sentiment_score < -0.3:
                prefix = self.template_engine.get_template("empathy_negative", lang)
                if prefix:
                    response = f"{prefix} {response}"
        
        # Score response quality
        quality = self.quality_scorer.score(response, query, lang)
        
        # Update context with response
        self.context_manager.update_context(session_id, "assistant", response, lang)
        
        return response
    
    def _generate_fallback(self, query: str, lang: str, 
                           analysis: Dict[str, Any]) -> str:
        """Generate fallback response when no good match found"""
        # Try Markov generation
        generated = self.markov_generator.generate_sentence(
            seed=query[:20] if len(query) > 5 else None,
            lang=lang,
            min_length=5,
            max_length=30
        )
        
        if generated and len(generated) > 10:
            return generated
        
        # Fall back to template
        return self.template_engine.get_template("unknown", lang)


# ============================================
# UTILITY FUNCTIONS
# ============================================

def calculate_text_similarity(text1: str, text2: str, lang: str = "ru") -> float:
    """Calculate similarity between two texts using Jaccard similarity"""
    preprocessor = TextPreprocessor()
    
    tokens1 = set(t.text for t in preprocessor.preprocess(text1, lang) if not t.is_stopword)
    tokens2 = set(t.text for t in preprocessor.preprocess(text2, lang) if not t.is_stopword)
    
    if not tokens1 or not tokens2:
        return 0.0
    
    intersection = len(tokens1 & tokens2)
    union = len(tokens1 | tokens2)
    
    return intersection / union if union > 0 else 0.0


def extract_keywords(text: str, lang: str = "ru", top_k: int = 5) -> List[str]:
    """Extract top keywords from text"""
    preprocessor = TextPreprocessor()
    tokens = preprocessor.preprocess(text, lang)
    
    # Count non-stopword tokens
    word_counts = Counter(t.text for t in tokens if not t.is_stopword and len(t.text) > 2)
    
    return [word for word, _ in word_counts.most_common(top_k)]


def detect_language(text: str) -> str:
    """Detect if text is Russian or English"""
    ru_chars = len(re.findall(r'[а-яА-ЯёЁ]', text))
    en_chars = len(re.findall(r'[a-zA-Z]', text))
    
    if ru_chars > en_chars:
        return "ru"
    else:
        return "en"


def normalize_query(query: str) -> str:
    """Normalize query for better matching"""
    # Lowercase
    query = query.lower()
    
    # Remove extra whitespace
    query = re.sub(r'\s+', ' ', query)
    
    # Remove punctuation except ? and !
    query = re.sub(r'[^\w\s\?\!]', '', query)
    
    # Trim
    return query.strip()


# ============================================
# SINGLETON INSTANCE
# ============================================

_nlp_processor: Optional[AdvancedNLPProcessor] = None

def get_nlp_processor() -> AdvancedNLPProcessor:
    """Get or create the NLP processor singleton"""
    global _nlp_processor
    if _nlp_processor is None:
        _nlp_processor = AdvancedNLPProcessor()
    return _nlp_processor
