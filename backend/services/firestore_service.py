import os
import json
from typing import List, Dict, Any, Optional
from utils.logger import log_event, log_error

# In-memory and local cache storage fallback
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
SEED_FILE = os.path.join(DATA_DIR, "seed_opportunities.json")
STORE_FILE = os.path.join(DATA_DIR, "opportunities_store.json")

class FirestoreService:
    def __init__(self):
        self.db = None
        self.use_firestore = False
        self.memory_store: Dict[str, Dict[str, Any]] = {}
        self.users_store: Dict[str, Dict[str, Any]] = {}
        self._initialize_client()
        self._load_seed_data()

    def _initialize_client(self):
        """Attempts to initialize official Firestore client if credentials exist."""
        try:
            cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
            project_id = os.getenv("GOOGLE_CLOUD_PROJECT")

            if cred_path and os.path.exists(cred_path):
                from google.cloud import firestore
                self.db = firestore.Client.from_service_account_json(cred_path)
                self.use_firestore = True
                log_event("firestore", f"Connected to Firestore project via key: {cred_path}")
            elif project_id:
                from google.cloud import firestore
                self.db = firestore.Client(project=project_id)
                self.use_firestore = True
                log_event("firestore", f"Connected to Firestore project: {project_id}")
            else:
                log_event("firestore", "No Firestore credentials provided. Using resilient In-Memory & Local JSON Store.")
                self.use_firestore = False
        except Exception as e:
            log_event("firestore", f"Firestore init skipped ({str(e)}). Active in High-Performance Local Mode.")
            self.use_firestore = False

    def _load_seed_data(self):
        """Loads seed opportunities into store if empty."""
        try:
            # Check local store file first
            if os.path.exists(STORE_FILE):
                with open(STORE_FILE, "r", encoding="utf-8") as f:
                    items = json.load(f)
                    for item in items:
                        self.memory_store[item["id"]] = item
                log_event("store", f"Loaded {len(self.memory_store)} opportunities from persistent cache.")
            elif os.path.exists(SEED_FILE):
                with open(SEED_FILE, "r", encoding="utf-8") as f:
                    items = json.load(f)
                    for item in items:
                        self.memory_store[item["id"]] = item
                log_event("store", f"Loaded {len(self.memory_store)} opportunities from seed database.")
        except Exception as e:
            log_error("store_load", e)

    def _persist_to_file(self):
        """Saves current in-memory opportunities to local JSON file for continuity."""
        try:
            os.makedirs(DATA_DIR, exist_ok=True)
            with open(STORE_FILE, "w", encoding="utf-8") as f:
                json.dump(list(self.memory_store.values()), f, indent=2)
        except Exception as e:
            log_error("store_persist", e)

    def save_opportunities(self, opportunities: List[Dict[str, Any]]) -> int:
        """Stores opportunities in Firestore or memory store."""
        saved_count = 0
        for opp in opportunities:
            opp_id = opp.get("id") or f"opp-{abs(hash(opp.get('title', ''))) % 100000}"
            opp["id"] = opp_id

            if self.use_firestore and self.db:
                try:
                    doc_ref = self.db.collection("opportunities").document(opp_id)
                    doc_ref.set(opp, merge=True)
                    saved_count += 1
                except Exception as e:
                    log_error("firestore_save", e)
                    self.memory_store[opp_id] = opp
                    saved_count += 1
            else:
                self.memory_store[opp_id] = opp
                saved_count += 1

        self._persist_to_file()
        log_event("storage", f"Persisted {saved_count} opportunities to active state.")
        return saved_count

    def get_all_opportunities(self) -> List[Dict[str, Any]]:
        """Retrieves all indexed opportunities."""
        if self.use_firestore and self.db:
            try:
                docs = self.db.collection("opportunities").stream()
                results = [doc.to_dict() for doc in docs]
                if results:
                    return results
            except Exception as e:
                log_error("firestore_fetch", e)

        return list(self.memory_store.values())

    def save_user(self, user_data: Dict[str, Any]) -> bool:
        """Saves user interaction profile."""
        user_id = user_data.get("email") or user_data.get("name") or "default_user"
        if self.use_firestore and self.db:
            try:
                self.db.collection("users").document(user_id).set(user_data, merge=True)
                return True
            except Exception as e:
                log_error("firestore_user_save", e)
        
        self.users_store[user_id] = user_data
        return True

firestore_service = FirestoreService()
