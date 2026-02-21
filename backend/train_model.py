"""
Training Script for LSTM Neural Network V2
Features:
- Trains LSTM with Word Embeddings
- Proper sequence padding
- Validation split
- Model checkpointing
"""

import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
import json
import os

from almaty_dataset import ALMATY_DATASET
from website_knowledge_dataset import WEBSITE_KNOWLEDGE_DATASET
from conversation_dataset import CONVERSATION_DATASET
from data_augmenter_v2 import augment_dataset
from external_data_loader import load_external_datasets
from neural_engine import LSTMClassifier, SmartTokenizer

# ==========================================
# CONFIGURATION
# ==========================================

def _env_int(name: str, default: int) -> int:
    raw = os.getenv(name)
    if raw is None:
        return default
    try:
        return int(raw)
    except ValueError:
        return default


def _env_float(name: str, default: float) -> float:
    raw = os.getenv(name)
    if raw is None:
        return default
    try:
        return float(raw)
    except ValueError:
        return default


CONFIG = {
    "embedding_dim": _env_int("TRAIN_EMBEDDING_DIM", 256),
    "hidden_dim": _env_int("TRAIN_HIDDEN_DIM", 256),
    "num_layers": _env_int("TRAIN_NUM_LAYERS", 2),
    "dropout": _env_float("TRAIN_DROPOUT", 0.3),
    "max_length": _env_int("TRAIN_MAX_LENGTH", 50),
    "batch_size": _env_int("TRAIN_BATCH_SIZE", 32),
    "epochs": _env_int("TRAIN_EPOCHS", 100),
    "learning_rate": _env_float("TRAIN_LR", 0.001),
    "validation_split": 0.1,
    "target_size": _env_int("TRAIN_TARGET_SIZE", 12000),
}

# ==========================================
# DATA PREPARATION
# ==========================================

def load_datasets():
    """Load and merge all datasets, filter to English only, and augment"""
    # 1. Load Almaty Dataset
    almaty_en = [entry for entry in ALMATY_DATASET if entry.get('language', 'en') == 'en']
    print(f"Loaded {len(almaty_en)} English patterns from ALMATY_DATASET.")

    # 2. Load Website Knowledge Dataset
    science_en = [entry for entry in WEBSITE_KNOWLEDGE_DATASET if entry.get('language', 'en') == 'en']
    print(f"Loaded {len(science_en)} English patterns from WEBSITE_KNOWLEDGE_DATASET.")

    # 3. Load Conversation Dataset
    convo_en = [entry for entry in CONVERSATION_DATASET if entry.get('language', 'en') == 'en']
    print(f"Loaded {len(convo_en)} English patterns from CONVERSATION_DATASET.")

    # 4. Load external datasets (json files + optional site crawl)
    external_limit = _env_int("EXTERNAL_LIMIT_PER_FILE", 3000)
    external_data = load_external_datasets(limit_per_file=external_limit)
    print(f"Loaded {len(external_data)} external patterns.")
    
    # Merge all
    raw_data = almaty_en + science_en + convo_en + external_data
    print(f"Total raw patterns before augmentation: {len(raw_data)}")
    
    # Augment
    # With 30k raw patterns, augmentation might be too heavy if we target a huge number.
    # We'll augment to at least match our raw size if it's already above target_size.
    final_target = max(len(raw_data), CONFIG["target_size"])
    full_data = augment_dataset(raw_data, target_size=final_target)
    
    return full_data

def prepare_data(dataset):
    """Prepare training data from dataset"""
    patterns = []
    labels = []
    tags = set()
    
    for entry in dataset:
        pattern = entry['pattern']
        tag = entry['category']
        
        patterns.append(pattern)
        labels.append(tag)
        tags.add(tag)
    
    # Sort tags for consistent ordering
    tags = sorted(list(tags))
    tag2idx = {tag: idx for idx, tag in enumerate(tags)}
    
    # Convert labels to indices
    label_indices = [tag2idx[label] for label in labels]
    
    return patterns, label_indices, tags, tag2idx


class IntentDataset(Dataset):
    """PyTorch Dataset for intent classification"""
    
    def __init__(self, patterns, labels, tokenizer, max_length=50):
        self.tokenizer = tokenizer
        self.max_length = max_length
        
        # Encode all patterns
        self.encoded = []
        self.labels = []
        
        for pattern, label in zip(patterns, labels):
            encoded = tokenizer.encode(pattern, max_length)
            self.encoded.append(encoded)
            self.labels.append(label)
    
    def __len__(self):
        return len(self.encoded)
    
    def __getitem__(self, idx):
        return (
            torch.tensor(self.encoded[idx], dtype=torch.long),
            torch.tensor(self.labels[idx], dtype=torch.long)
        )


# ==========================================
# TRAINING FUNCTIONS
# ==========================================

def train_epoch(model, dataloader, criterion, optimizer, device):
    """Train for one epoch"""
    model.train()
    total_loss = 0
    correct = 0
    total = 0
    
    for batch_x, batch_y in dataloader:
        batch_x = batch_x.to(device)
        batch_y = batch_y.to(device)
        
        # Forward pass
        outputs = model(batch_x)
        loss = criterion(outputs, batch_y)
        
        # Backward pass
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        
        total_loss += loss.item()
        
        # Calculate accuracy
        _, predicted = torch.max(outputs, 1)
        total += batch_y.size(0)
        correct += (predicted == batch_y).sum().item()
    
    avg_loss = total_loss / len(dataloader)
    accuracy = 100 * correct / total
    
    return avg_loss, accuracy


def evaluate(model, dataloader, criterion, device):
    """Evaluate model on validation set"""
    model.eval()
    total_loss = 0
    correct = 0
    total = 0
    
    with torch.no_grad():
        for batch_x, batch_y in dataloader:
            batch_x = batch_x.to(device)
            batch_y = batch_y.to(device)
            
            outputs = model(batch_x)
            loss = criterion(outputs, batch_y)
            
            total_loss += loss.item()
            
            _, predicted = torch.max(outputs, 1)
            total += batch_y.size(0)
            correct += (predicted == batch_y).sum().item()
    
    avg_loss = total_loss / len(dataloader) if len(dataloader) > 0 else 0
    accuracy = 100 * correct / total if total > 0 else 0
    
    return avg_loss, accuracy


# ==========================================
# MAIN TRAINING
# ==========================================

def train():
    """Main training function"""
    
    print("=" * 50)
    print("LSTM Neural Network Training V2")
    print("=" * 50)
    
    # Device
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")
    
    # Load data
    dataset = load_datasets()
    patterns, labels, tags, tag2idx = prepare_data(dataset)
    
    print(f"Found {len(patterns)} patterns")
    print(f"Found {len(tags)} categories: {tags}")
    
    # Build tokenizer
    tokenizer = SmartTokenizer()
    tokenizer.build_vocab(patterns, min_freq=1)
    tokenizer.max_length = CONFIG["max_length"]
    
    # Create dataset
    full_dataset = IntentDataset(patterns, labels, tokenizer, CONFIG["max_length"])
    
    # Split into train/validation
    val_size = int(len(full_dataset) * CONFIG["validation_split"])
    train_size = len(full_dataset) - val_size
    
    train_dataset, val_dataset = torch.utils.data.random_split(
        full_dataset, [train_size, val_size]
    )
    
    print(f"Training samples: {train_size}")
    print(f"Validation samples: {val_size}")
    
    # Create dataloaders
    train_loader = DataLoader(
        train_dataset,
        batch_size=CONFIG["batch_size"],
        shuffle=True
    )
    
    val_loader = DataLoader(
        val_dataset,
        batch_size=CONFIG["batch_size"],
        shuffle=False
    ) if val_size > 0 else None
    
    # Initialize model
    model = LSTMClassifier(
        vocab_size=tokenizer.vocab_size,
        embedding_dim=CONFIG["embedding_dim"],
        hidden_dim=CONFIG["hidden_dim"],
        num_classes=len(tags),
        num_layers=CONFIG["num_layers"],
        dropout=CONFIG["dropout"],
        bidirectional=True
    ).to(device)
    
    print(f"\nModel architecture:")
    print(f"  Vocab size: {tokenizer.vocab_size}")
    print(f"  Embedding dim: {CONFIG['embedding_dim']}")
    print(f"  Hidden dim: {CONFIG['hidden_dim']}")
    print(f"  LSTM layers: {CONFIG['num_layers']}")
    print(f"  Bidirectional: True")
    print(f"  Output classes: {len(tags)}")
    
    # Loss and optimizer
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=CONFIG["learning_rate"])
    
    # Training loop
    print("\n" + "=" * 50)
    print("Training started...")
    print("=" * 50)
    
    best_val_acc = 0
    
    for epoch in range(CONFIG["epochs"]):
        train_loss, train_acc = train_epoch(model, train_loader, criterion, optimizer, device)
        
        if val_loader:
            val_loss, val_acc = evaluate(model, val_loader, criterion, device)
        else:
            val_loss, val_acc = 0, 0
        
        if (epoch + 1) % 10 == 0:
            print(f"Epoch [{epoch+1}/{CONFIG['epochs']}] "
                  f"Train Loss: {train_loss:.4f}, Train Acc: {train_acc:.1f}% | "
                  f"Val Loss: {val_loss:.4f}, Val Acc: {val_acc:.1f}%")
        
        # Save best model
        if val_acc > best_val_acc:
            best_val_acc = val_acc
    
    # Final evaluation
    print("\n" + "=" * 50)
    final_train_loss, final_train_acc = evaluate(model, train_loader, criterion, device)
    print(f"Final Training Accuracy: {final_train_acc:.2f}%")
    
    if val_loader:
        final_val_loss, final_val_acc = evaluate(model, val_loader, criterion, device)
        print(f"Final Validation Accuracy: {final_val_acc:.2f}%")
    
    # Save model
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Save model weights
    model_path = os.path.join(script_dir, "model_v2.pth")
    torch.save({
        "model_state": model.state_dict(),
        "config": CONFIG,
    }, model_path)
    print(f"Model saved to: {model_path}")
    
    # Save tokenizer
    tokenizer_path = os.path.join(script_dir, "tokenizer_v2.json")
    tokenizer.save(tokenizer_path)
    print(f"Tokenizer saved to: {tokenizer_path}")
    
    # Save config
    config_path = os.path.join(script_dir, "config_v2.json")
    config_data = {
        "tags": tags,
        "tag2idx": tag2idx,
        "embedding_dim": CONFIG["embedding_dim"],
        "hidden_dim": CONFIG["hidden_dim"],
        "num_layers": CONFIG["num_layers"],
        "max_length": CONFIG["max_length"],
        "vocab_size": tokenizer.vocab_size,
    }
    with open(config_path, 'w', encoding='utf-8') as f:
        json.dump(config_data, f, ensure_ascii=False, indent=2)
    print(f"Config saved to: {config_path}")
    
    print("\n" + "=" * 50)
    print("Training complete!")
    print("=" * 50)
    
    return model, tokenizer, tags


if __name__ == "__main__":
    train()
