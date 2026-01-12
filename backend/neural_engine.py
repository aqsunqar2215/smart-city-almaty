"""
Neural Engine V2 - Advanced LSTM Architecture
Features:
- Word Embeddings (dense vectors instead of Bag-of-Words)
- Bidirectional LSTM (understands word order and context)
- Conversation Memory (remembers last N messages)
- Subword handling for OOV words
"""

import torch
import torch.nn as nn
import numpy as np
import re
import os
import json
from collections import Counter

# ==========================================
# TOKENIZER WITH SUBWORD SUPPORT
# ==========================================

class SmartTokenizer:
    """
    Advanced tokenizer with:
    - Word-level tokenization
    - Subword fallback for unknown words
    - Special tokens ([PAD], [UNK], [SEP])
    """
    
    def __init__(self):
        self.word2idx = {"[PAD]": 0, "[UNK]": 1, "[SEP]": 2}
        self.idx2word = {0: "[PAD]", 1: "[UNK]", 2: "[SEP]"}
        self.vocab_size = 3
        self.max_length = 50
        
    def build_vocab(self, sentences, min_freq=1):
        """Build vocabulary from list of sentences"""
        word_counts = Counter()
        for sentence in sentences:
            tokens = self.tokenize(sentence)
            word_counts.update(tokens)
        
        for word, count in word_counts.items():
            if count >= min_freq and word not in self.word2idx:
                idx = len(self.word2idx)
                self.word2idx[word] = idx
                self.idx2word[idx] = word
        
        self.vocab_size = len(self.word2idx)
        print(f"Vocabulary built: {self.vocab_size} tokens")
        
    def tokenize(self, text):
        """Tokenize text into words"""
        text = text.lower().strip()
        # Split on non-alphanumeric, keep words
        tokens = re.findall(r'\b\w+\b', text)
        return tokens
    
    def encode(self, text, max_length=None):
        """Convert text to token indices with fuzzy matching for OOV"""
        if max_length is None:
            max_length = self.max_length
            
        tokens = self.tokenize(text)
        indices = []
        
        for token in tokens[:max_length]:
            if token in self.word2idx:
                indices.append(self.word2idx[token])
            else:
                # 1. Try fuzzy matching for OOV (Out of Vocabulary)
                best_match = None
                best_dist = 2 # Max edit distance
                
                # Compare with vocabulary (excluding special tokens)
                for known_word, idx in self.word2idx.items():
                    if idx < 3: continue # Skip [PAD], [UNK], [SEP]
                    
                    # Very simple distance check
                    dist = self._levenshtein_small(token, known_word)
                    if dist < best_dist:
                        best_dist = dist
                        best_match = idx
                
                if best_match is not None:
                    indices.append(best_match)
                else:
                    # 2. Try subword fallback
                    found = False
                    for known_word in self.word2idx:
                        if len(known_word) > 3 and (known_word in token or token in known_word):
                            indices.append(self.word2idx[known_word])
                            found = True
                            break
                    if not found:
                        indices.append(self.word2idx["[UNK]"])
        
        # Pad to max_length
        while len(indices) < max_length:
            indices.append(self.word2idx["[PAD]"])
            
        return indices[:max_length]

    def _levenshtein_small(self, s1, s2):
        """Fast Levenshtein for small words (optimized for CPU)"""
        if abs(len(s1) - len(s2)) > 1: return 99
        if s1 == s2: return 0
        
        # Simple distance: same length with 1 char difference OR 1 char added/removed
        if len(s1) == len(s2):
            diffs = sum(1 for c1, c2 in zip(s1, s2) if c1 != c2)
            return diffs
        
        # Add/remove check
        if len(s1) > len(s2): s1, s2 = s2, s1
        # s1 is shorter
        for i in range(len(s2)):
            if s1 == s2[:i] + s2[i+1:]:
                return 1
        return 99
    
    def save(self, path):
        """Save tokenizer to file"""
        data = {
            "word2idx": self.word2idx,
            "idx2word": {int(k): v for k, v in self.idx2word.items()},
            "vocab_size": self.vocab_size,
            "max_length": self.max_length
        }
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    
    def load(self, path):
        """Load tokenizer from file"""
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        self.word2idx = data["word2idx"]
        self.idx2word = {int(k): v for k, v in data["idx2word"].items()}
        self.vocab_size = data["vocab_size"]
        self.max_length = data["max_length"]


# ==========================================
# LSTM NEURAL NETWORK MODEL
# ==========================================

class LSTMClassifier(nn.Module):
    """
    Bidirectional LSTM with Word Embeddings for intent classification
    
    Architecture:
    Input → Embedding → BiLSTM → Dropout → FC → Softmax
    """
    
    def __init__(self, vocab_size, embedding_dim, hidden_dim, num_classes, 
                 num_layers=2, dropout=0.3, bidirectional=True):
        super(LSTMClassifier, self).__init__()
        
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers
        self.bidirectional = bidirectional
        self.num_directions = 2 if bidirectional else 1
        
        # Embedding layer - converts word indices to dense vectors
        self.embedding = nn.Embedding(vocab_size, embedding_dim, padding_idx=0)
        
        # LSTM layer - processes sequence with memory
        self.lstm = nn.LSTM(
            input_size=embedding_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0,
            bidirectional=bidirectional
        )
        
        # Dropout for regularization
        self.dropout = nn.Dropout(dropout)
        
        # Fully connected output layer
        fc_input_dim = hidden_dim * self.num_directions
        self.fc = nn.Linear(fc_input_dim, num_classes)
        
    def forward(self, x):
        # x shape: (batch_size, seq_length)
        
        # Embedding: (batch_size, seq_length, embedding_dim)
        embedded = self.embedding(x)
        
        # LSTM: output shape (batch_size, seq_length, hidden_dim * num_directions)
        lstm_out, (hidden, cell) = self.lstm(embedded)
        
        # Take the last hidden state from both directions
        if self.bidirectional:
            # Concatenate forward and backward hidden states
            hidden_forward = hidden[-2, :, :]  # Last layer forward
            hidden_backward = hidden[-1, :, :]  # Last layer backward
            hidden_concat = torch.cat((hidden_forward, hidden_backward), dim=1)
        else:
            hidden_concat = hidden[-1, :, :]
        
        # Dropout
        dropped = self.dropout(hidden_concat)
        
        # Fully connected
        output = self.fc(dropped)
        
        return output


# ==========================================
# CONVERSATION MEMORY
# ==========================================

class ConversationMemory:
    """
    Stores conversation history for context-aware responses
    """
    
    def __init__(self, max_turns=5):
        self.max_turns = max_turns
        self.history = []
        
    def add(self, user_message, bot_response, intent=None):
        """Add a conversation turn"""
        self.history.append({
            "user": user_message,
            "bot": bot_response,
            "intent": intent
        })
        
        # Keep only last N turns
        if len(self.history) > self.max_turns:
            self.history.pop(0)
    
    def get_context(self):
        """Get conversation context as a single string"""
        context_parts = []
        for turn in self.history:
            context_parts.append(f"{turn['user']}")
        return " [SEP] ".join(context_parts)
    
    def get_last_intent(self):
        """Get the last detected intent"""
        if self.history:
            return self.history[-1].get("intent")
        return None
    
    def clear(self):
        """Clear conversation history"""
        self.history = []
    
    def __len__(self):
        return len(self.history)


# ==========================================
# NEURAL CLASSIFIER V2 (Main Interface)
# ==========================================

class NeuralClassifierV2:
    """
    High-level interface for the LSTM-based classifier
    """
    
    def __init__(self, model_dir=None):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        if model_dir is None:
            model_dir = os.path.dirname(os.path.abspath(__file__))
        
        self.model_dir = model_dir
        self.model_path = os.path.join(model_dir, "model_v2.pth")
        self.tokenizer_path = os.path.join(model_dir, "tokenizer_v2.json")
        self.config_path = os.path.join(model_dir, "config_v2.json")
        
        self.model = None
        self.tokenizer = SmartTokenizer()
        self.tags = []
        self.conversation_memory = ConversationMemory()
        
        # Model hyperparameters
        self.embedding_dim = 128
        self.hidden_dim = 256
        self.num_layers = 2
        self.dropout = 0.3
        self.max_length = 50
        
        # Try to load existing model
        if os.path.exists(self.model_path):
            self.load_model()
    
    def load_model(self):
        """Load trained model and tokenizer"""
        try:
            # Load config
            with open(self.config_path, 'r') as f:
                config = json.load(f)
            
            self.tags = config["tags"]
            self.embedding_dim = config.get("embedding_dim", 128)
            self.hidden_dim = config.get("hidden_dim", 256)
            
            # Load tokenizer
            self.tokenizer.load(self.tokenizer_path)
            
            # Initialize model
            self.model = LSTMClassifier(
                vocab_size=self.tokenizer.vocab_size,
                embedding_dim=self.embedding_dim,
                hidden_dim=self.hidden_dim,
                num_classes=len(self.tags),
                num_layers=self.num_layers,
                dropout=self.dropout
            ).to(self.device)
            
            # Load weights
            checkpoint = torch.load(self.model_path, map_location=self.device)
            self.model.load_state_dict(checkpoint["model_state"])
            self.model.eval()
            
            print(f"Model loaded: {len(self.tags)} classes, {self.tokenizer.vocab_size} vocab")
            
        except Exception as e:
            print(f"Error loading model: {e}")
            self.model = None
    
    def predict(self, text, use_context=True):
        """
        Predict intent for given text
        
        Args:
            text: Input text
            use_context: Whether to use conversation history
            
        Returns:
            (intent, confidence) tuple
        """
        if self.model is None:
            return None, 0.0
        
        # Optionally prepend conversation context
        if use_context and len(self.conversation_memory) > 0:
            context = self.conversation_memory.get_context()
            full_text = f"{context} [SEP] {text}"
        else:
            full_text = text
        
        # Encode text
        indices = self.tokenizer.encode(full_text, self.max_length)
        input_tensor = torch.tensor([indices], dtype=torch.long).to(self.device)
        
        # Forward pass
        with torch.no_grad():
            output = self.model(input_tensor)
            probs = torch.softmax(output, dim=1)
            confidence, predicted = torch.max(probs, dim=1)
        
        intent = self.tags[predicted.item()]
        conf = confidence.item()
        
        return intent, conf
    
    def predict_with_memory(self, text, response=None):
        """
        Predict and optionally store in conversation memory
        """
        intent, confidence = self.predict(text, use_context=True)
        
        if response:
            self.conversation_memory.add(text, response, intent)
        
        return intent, confidence
    
    def clear_memory(self):
        """Clear conversation history"""
        self.conversation_memory.clear()
    
    def get_memory_context(self):
        """Get current conversation context"""
        return self.conversation_memory.get_context()


# ==========================================
# BACKWARD COMPATIBILITY - Keep old interface
# ==========================================

def tokenize(sentence):
    """Simple tokenizer for backward compatibility"""
    return re.findall(r'\b\w+\b', sentence.lower())

def stem(word):
    """Simple stemmer for backward compatibility"""
    word = word.lower()
    suffixes = ['ing', 'ed', 'es', 's', 'ly', 'tion', 'ness']
    for suffix in suffixes:
        if word.endswith(suffix) and len(word) > len(suffix) + 2:
            return word[:-len(suffix)]
    return word

def bag_of_words(tokenized_sentence, words):
    """Bag of words for backward compatibility"""
    sentence_words = [stem(word) for word in tokenized_sentence]
    bag = np.zeros(len(words), dtype=np.float32)
    for idx, w in enumerate(words):
        if w in sentence_words:
            bag[idx] = 1
    return bag


# Legacy MLP model for backward compatibility
class NeuralNet(nn.Module):
    def __init__(self, input_size, hidden_size, num_classes):
        super(NeuralNet, self).__init__()
        self.l1 = nn.Linear(input_size, hidden_size)
        self.l2 = nn.Linear(hidden_size, hidden_size)
        self.l3 = nn.Linear(hidden_size, num_classes)
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(0.2)

    def forward(self, x):
        out = self.l1(x)
        out = self.relu(out)
        out = self.l2(out)
        out = self.relu(out)
        out = self.dropout(out)
        out = self.l3(out)
        return out


# Legacy classifier for backward compatibility
class NeuralClassifier:
    """Legacy classifier - uses V2 if available, falls back to V1"""
    
    def __init__(self, model_path=None):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        if model_path is None:
            script_dir = os.path.dirname(os.path.abspath(__file__))
            model_path = os.path.join(script_dir, "data.pth")
        
        self.model_path = model_path
        self.model = None
        self.all_words = []
        self.tags = []
        
        # Try V2 first
        self.v2_classifier = NeuralClassifierV2()
        if self.v2_classifier.model is not None:
            print("Using LSTM V2 model")
            self.use_v2 = True
        else:
            self.use_v2 = False
            if os.path.exists(model_path):
                self.load_model()
    
    def load_model(self):
        """Load legacy model"""
        try:
            data = torch.load(self.model_path, map_location=self.device)
            input_size = data["input_size"]
            hidden_size = data["hidden_size"]
            output_size = data["output_size"]
            self.all_words = data['all_words']
            self.tags = data['tags']
            
            self.model = NeuralNet(input_size, hidden_size, output_size).to(self.device)
            self.model.load_state_dict(data["model_state"])
            self.model.eval()
        except Exception as e:
            print(f"Error loading legacy model: {e}")
    
    def predict(self, sentence):
        """Predict using V2 or fall back to V1"""
        if self.use_v2:
            return self.v2_classifier.predict(sentence)
        
        if self.model is None:
            return None, 0.0
        
        sentence = tokenize(sentence)
        X = bag_of_words(sentence, self.all_words)
        X = X.reshape(1, X.shape[0])
        X = torch.from_numpy(X).to(self.device)
        
        output = self.model(X)
        _, predicted = torch.max(output, dim=1)
        
        tag = self.tags[predicted.item()]
        probs = torch.softmax(output, dim=1)
        prob = probs[0][predicted.item()]
        
        return tag, prob.item()
