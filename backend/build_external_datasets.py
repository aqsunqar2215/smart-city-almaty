"""
Build external english datasets for training the neural intent model.

Outputs (default):
- backend/datasets/almaty_smart_city_english.json
- backend/datasets/general_chat_english_10k.json

The filenames are aligned with external_data_loader defaults.
"""

from __future__ import annotations

import json
import os
import random
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Tuple
from urllib.parse import quote

import requests


@dataclass
class WikiTopic:
    title: str
    category: str  # one of: food,housing,ecology,traffic,emergency,tourism,finance,education


WIKI_TOPICS: List[WikiTopic] = [
    WikiTopic("Almaty", "tourism"),
    WikiTopic("Kazakhstan", "tourism"),
    WikiTopic("Medeu", "tourism"),
    WikiTopic("Shymbulak", "tourism"),
    WikiTopic("Kok Tobe", "tourism"),
    WikiTopic("Green Bazaar", "food"),
    WikiTopic("Panfilov Park", "tourism"),
    WikiTopic("Ascension Cathedral, Almaty", "tourism"),
    WikiTopic("Almaty Metro", "traffic"),
    WikiTopic("Bus", "traffic"),
    WikiTopic("Public transport", "traffic"),
    WikiTopic("Traffic congestion", "traffic"),
    WikiTopic("Road safety", "emergency"),
    WikiTopic("Emergency management", "emergency"),
    WikiTopic("Air pollution", "ecology"),
    WikiTopic("Air quality index", "ecology"),
    WikiTopic("Sustainable city", "ecology"),
    WikiTopic("Urban planning", "housing"),
    WikiTopic("Smart city", "education"),
    WikiTopic("Internet of things", "education"),
    WikiTopic("Machine learning", "education"),
    WikiTopic("Neural network (machine learning)", "education"),
    WikiTopic("Cloud computing", "education"),
    WikiTopic("Renewable energy", "ecology"),
    WikiTopic("Solar power", "ecology"),
    WikiTopic("Wind power", "ecology"),
    WikiTopic("Hydroelectricity", "ecology"),
    WikiTopic("Electric vehicle", "traffic"),
    WikiTopic("Bicycle-sharing system", "traffic"),
    WikiTopic("Telemedicine", "education"),
    WikiTopic("Urban heat island", "ecology"),
    WikiTopic("Waste management", "ecology"),
    WikiTopic("Water supply network", "housing"),
    WikiTopic("Sanitation", "housing"),
    WikiTopic("Digital transformation", "education"),
    WikiTopic("Cybersecurity", "education"),
    WikiTopic("Open data", "education"),
    WikiTopic("Geographic information system", "education"),
    WikiTopic("Gross domestic product", "finance"),
    WikiTopic("Inflation", "finance"),
    WikiTopic("Public finance", "finance"),
]


SMART_CITY_TEMPLATES = [
    "What should I know about {topic}?",
    "Explain {topic} in simple words.",
    "Can you summarize {topic} for me?",
    "Why is {topic} important for a modern city?",
    "Give me key facts about {topic}.",
    "How does {topic} affect everyday life?",
    "What is the practical meaning of {topic}?",
]


GENERAL_CHAT_PROMPTS = [
    "hello",
    "hi there",
    "good morning",
    "good evening",
    "how are you",
    "what can you do",
    "can you help me study",
    "i feel stressed today",
    "i need motivation",
    "i am preparing for an interview",
    "how can i improve communication skills",
    "how do i learn faster",
    "give me a short focus routine",
    "how can i plan my day better",
    "what is a healthy evening routine",
    "teach me critical thinking",
    "how to ask better questions",
    "how do i build confidence",
    "how can i stop procrastinating",
    "can you suggest a reading habit",
    "i need a simple breathing exercise",
    "what is active learning",
    "how to remember what i read",
    "how can i solve problems step by step",
    "how to write clear emails",
    "how to stay calm in difficult conversations",
    "what is a growth mindset",
    "how can i improve english speaking",
    "how to prepare for exams",
    "how to structure a presentation",
    "how can i be more consistent",
    "how to give constructive feedback",
    "how to build a strong portfolio",
    "what makes a good team player",
    "how to avoid burnout",
]


GENERAL_CHAT_RESPONSES = [
    "Hi! I am ready to help. Tell me your goal and I will propose practical next steps.",
    "A good approach is to define one clear objective, one deadline, and one measurable result.",
    "If you feel stressed, slow your breathing for one minute and write down the next smallest action.",
    "For interviews: prepare a short self-introduction, three achievement stories, and two smart questions.",
    "To learn faster, use active recall: close your notes and explain key ideas from memory.",
    "Use a 25-minute focus block, then take a 5-minute break. Repeat this cycle three times.",
    "To reduce procrastination, start with a task that takes less than two minutes.",
    "Confidence grows with repetition. Practice in small steps and track your progress daily.",
    "For clear emails: use one subject, one action request, and one deadline.",
    "A healthy routine includes sleep consistency, hydration, light exercise, and screen limits before bed.",
    "Critical thinking starts with evidence: what is known, unknown, and assumed?",
    "To improve speaking, record short daily summaries and compare your clarity week to week.",
    "Burnout prevention: protect sleep, reduce context switching, and schedule real recovery time.",
    "When solving problems, define the problem, list options, choose one experiment, and review results.",
    "A growth mindset means treating mistakes as feedback, not as identity.",
]


def fetch_wikipedia_summary(title: str, timeout: float = 10.0) -> str:
    headers = {
        "User-Agent": "SmartCityAlmatyDatasetBuilder/1.0 (training dataset generation; contact: local-dev)",
        "Accept": "application/json",
    }

    url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{quote(title)}"
    try:
        resp = requests.get(url, headers=headers, timeout=timeout)
        if resp.status_code == 200:
            data = resp.json()
            text = (data.get("extract") or "").strip()
            if text:
                return text

        # Fallback to MediaWiki query API
        api_url = "https://en.wikipedia.org/w/api.php"
        params = {
            "action": "query",
            "prop": "extracts",
            "exintro": 1,
            "explaintext": 1,
            "titles": title,
            "format": "json",
            "redirects": 1,
        }
        api_resp = requests.get(api_url, params=params, headers=headers, timeout=timeout)
        if api_resp.status_code != 200:
            return ""
        data = api_resp.json()
        pages = data.get("query", {}).get("pages", {})
        for _, page in pages.items():
            extract = (page.get("extract") or "").strip()
            if extract:
                return extract
        return ""
    except Exception:
        return ""


def build_smart_city_dataset() -> List[Dict[str, str]]:
    items: List[Dict[str, str]] = []
    for topic in WIKI_TOPICS:
        summary = fetch_wikipedia_summary(topic.title)
        if not summary:
            continue
        for template in SMART_CITY_TEMPLATES:
            instruction = template.format(topic=topic.title)
            items.append(
                {
                    "category": topic.category,
                    "instruction": instruction,
                    "output": summary,
                }
            )
    random.shuffle(items)
    return items


def build_general_chat_dataset(size: int = 10000) -> List[Dict[str, str]]:
    # Build a large, diverse conversational dataset by combining prompts/responses with variants.
    items: List[Dict[str, str]] = []
    variants = [
        "Keep it concise and practical.",
        "Give a supportive and action-oriented answer.",
        "Focus on one immediate next step.",
        "Use plain English and avoid jargon.",
        "Include a short example.",
    ]

    while len(items) < size:
        prompt = random.choice(GENERAL_CHAT_PROMPTS)
        base_response = random.choice(GENERAL_CHAT_RESPONSES)
        variant = random.choice(variants)
        instruction = f"{prompt}. {variant}"
        output = base_response
        items.append({"instruction": instruction, "output": output})

    return items


def main() -> None:
    script_dir = Path(__file__).resolve().parent
    out_dir = script_dir / "datasets"
    out_dir.mkdir(parents=True, exist_ok=True)

    smart_file = out_dir / os.getenv("EXTERNAL_SMART_CITY_FILE", "almaty_smart_city_english.json")
    chat_file = out_dir / os.getenv("EXTERNAL_CHAT_FILE", "general_chat_english_10k.json")
    chat_size = int(os.getenv("CHAT_DATASET_SIZE", "10000"))

    smart_items = build_smart_city_dataset()
    chat_items = build_general_chat_dataset(size=max(1000, chat_size))

    with open(smart_file, "w", encoding="utf-8") as f:
        json.dump(smart_items, f, ensure_ascii=False, indent=2)
    with open(chat_file, "w", encoding="utf-8") as f:
        json.dump(chat_items, f, ensure_ascii=False, indent=2)

    print(f"Saved smart-city dataset: {smart_file} ({len(smart_items)} items)")
    print(f"Saved chat dataset: {chat_file} ({len(chat_items)} items)")


if __name__ == "__main__":
    main()
