import requests
import json
import os

def download_common_words():
    url = "https://raw.githubusercontent.com/mahsu/IndexingExercise/master/5000-words.txt"
    print(f"Downloading common words from {url}...")
    try:
        response = requests.get(url)
        response.raise_for_status()
        # The file has one word per line
        words = [word.strip() for word in response.text.split('\n') if word.strip()]
        
        # Deduplicate and sort
        unique_words = sorted(list(set(words)))
        
        output_path = os.path.join(os.path.dirname(__file__), "english_5000.json")
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(unique_words, f, indent=2)
        
        print(f"Successfully saved {len(unique_words)} words to {output_path}")
        return unique_words
    except Exception as e:
        print(f"Error downloading words: {e}")
        return []

if __name__ == "__main__":
    download_common_words()
