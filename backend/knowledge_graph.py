"""
Knowledge Graph Engine for Smart City Almaty
============================================
Manages semantic relationships between entities (History, Architecture, Geography).
Allows the AI to traverse "links" between facts for deeper reasoning.
"""

from typing import List, Dict, Set, Optional, Tuple
import logging

logger = logging.getLogger(__name__)

class KnowledgeGraph:
    def __init__(self):
        # Format: { node_id: { "properties": {}, "edges": { relation_type: [target_node_ids] } } }
        self.nodes: Dict[str, Dict] = {}
        self._initialize_almaty_graph()

    def add_node(self, node_id: str, label: str, properties: Dict = None):
        if node_id not in self.nodes:
            self.nodes[node_id] = {
                "label": label,
                "properties": properties or {},
                "edges": {}
            }

    def add_edge(self, source: str, target: str, relation: str):
        if source in self.nodes and target in self.nodes:
            if relation not in self.nodes[source]["edges"]:
                self.nodes[source]["edges"][relation] = []
            if target not in self.nodes[source]["edges"][relation]:
                self.nodes[source]["edges"][relation].append(target)

    def _initialize_almaty_graph(self):
        """Build the core semantic graph of Almaty"""
        
        # --- PEOPLE ---
        self.add_node("zenkov", "Андрей Зенков", {"role": "Architect", "era": "Tsars Era"})
        self.add_node("kunaev", "Динмухамед Кунаев", {"role": "Leader", "era": "Soviet"})
        self.add_node("kasteev", "Абильхан Кастеев", {"role": "Painter", "era": "Soviet"})
        self.add_node("satpaev", "Каныш Сатпаев", {"role": "Scientist", "field": "Geology"})
        
        # --- PLACES ---
        self.add_node("cathedral", "Вознесенский Кафедральный собор", {"type": "Architecture", "material": "Wood"})
        self.add_node("medeu", "Высокогорный каток Медеу", {"type": "Sport", "altitude": "1691m"})
        self.add_node("shymbulak", "Горнолыжный курорт Шымбулак", {"type": "Sport", "altitude": "2260m"})
        self.add_node("park_28", "Парк имени 28 гвардейцев-панфиловцев", {"type": "Park"})
        self.add_node("kok_tobe", "Гора Кок-Тобе", {"type": "Mountain/Park"})
        self.add_node("academy", "Академия наук РК", {"type": "Science", "location": "Shevchenko st"})
        self.add_node("tec_2", "ТЭЦ-2", {"type": "Infrastructure", "fuel": "Coal/Gas"})
        self.add_node("tuyuksu", "Ледник Туюксу", {"type": "Glacier", "status": "Receding"})
        
        # --- CONCEPTS/THINGS ---
        self.add_node("smog", "Смог/Загрязнение воздуха", {"type": "Problem"})
        self.add_node("inversion", "Температурная инверсия", {"type": "Physical Phenomenon"})
        self.add_node("breeze", "Горно-долинная циркуляция", {"type": "Climate Process"})
        self.add_node("aport", "Яблоки сорта Апорт", {"type": "Symbol/Fruit"})
        self.add_node("vernoye", "Крепость Верный", {"type": "History", "year": "1854"})
        self.add_node("kaznu", "КазНУ им. аль-Фараби", {"type": "University"})

        # --- RELATIONSHIPS ---
        self.add_edge("zenkov", "cathedral", "designed")
        self.add_edge("cathedral", "park_28", "located_in")
        self.add_edge("park_28", "vernoye", "historical_site_of")
        self.add_edge("medeu", "shymbulak", "gateway_to")
        self.add_edge("kok_tobe", "cathedral", "visible_from")
        self.add_edge("aport", "vernoye", "introduced_near")
        self.add_edge("kunaev", "medeu", "supported_construction")
        self.add_edge("kasteev", "cathedral", "painted")
        self.add_edge("satpaev", "academy", "founded")
        self.add_edge("satpaev", "kaznu", "studied_geology_near")
        self.add_edge("tec_2", "smog", "contributes_to")
        self.add_edge("inversion", "smog", "traps")
        self.add_edge("breeze", "smog", "clears")
        self.add_edge("medeu", "breeze", "located_in_wind_path")
        self.add_edge("tuyuksu", "medeu", "water_source_for")

    def find_related(self, query: str, lang: str = "ru") -> List[str]:
        """Find related facts by traversing the graph"""
        query_lower = query.lower()
        results = []
        
        # 1. Match query to nodes
        found_nodes = []
        for node_id, data in self.nodes.items():
            if node_id in query_lower or data["label"].lower() in query_lower:
                found_nodes.append(node_id)
        
        # 2. Extract neighbors for each found node
        for node_id in found_nodes:
            node_data = self.nodes[node_id]
            edges = node_data["edges"]
            
            for relation, targets in edges.items():
                for target_id in targets:
                    target_label = self.nodes[target_id]["label"]
                    
                    if lang == "ru":
                        rel_ru = self._translate_relation(relation)
                        results.append(f"{node_data['label']} {rel_ru} {target_label}")
                    else:
                        results.append(f"{node_data['label']} {relation.replace('_', ' ')} {target_label}")
        
        return results

    def _translate_relation(self, rel: str) -> str:
        translations = {
            "designed": "спроектировал(а)",
            "located_in": "находится в",
            "gateway_to": "является путем к",
            "historical_site_of": "историческое место",
            "visible_from": "видно из",
            "introduced_near": "был выведен/появился радом с",
            "supported_construction": "поддерживал строительство",
            "painted": "изображал на картинах"
        }
        return translations.get(rel, rel)

_graph_instance = None

def get_knowledge_graph():
    global _graph_instance
    if _graph_instance is None:
        _graph_instance = KnowledgeGraph()
    return _graph_instance
