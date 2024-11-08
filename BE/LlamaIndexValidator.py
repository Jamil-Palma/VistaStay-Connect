import os
import pickle  # Para guardar y cargar los embeddings
from dotenv import load_dotenv
from llama_index.core import SimpleDirectoryReader, Settings, StorageContext, VectorStoreIndex, SimpleKeywordTableIndex
from llama_index.core import QueryBundle
from llama_index.core.schema import NodeWithScore
from llama_index.core.retrievers import BaseRetriever, VectorIndexRetriever, KeywordTableSimpleRetriever
from llama_index.core import get_response_synthesizer
from llama_index.core.query_engine import RetrieverQueryEngine
from typing import List

# Cargar la clave de la API de OpenAI desde el archivo .env
load_dotenv()
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")

class LlamaIndexAnalyzer:
    def __init__(self, folder_path: str):
        self.folder_path = folder_path
        self.storage_context = StorageContext.from_defaults()
        self.vector_index = None
        self.keyword_index = None
        self.custom_query_engine = None
        self.embeddings_file = os.path.join(folder_path, "embeddings.pkl")  # Archivo para almacenar embeddings

    def load_and_index_files(self):
        # Verificar si ya existen embeddings guardados
        if os.path.exists(self.embeddings_file):
            with open(self.embeddings_file, "rb") as f:
                embeddings_data = pickle.load(f)
            self.vector_index = embeddings_data["vector_index"]
            self.keyword_index = embeddings_data["keyword_index"]
        else:
            # Procesar los documentos y generar nuevos embeddings
            documents = SimpleDirectoryReader(self.folder_path).load_data()
            nodes = Settings.node_parser.get_nodes_from_documents(documents)
            self.storage_context.docstore.add_documents(nodes)

            # Crear los índices vectoriales y de palabras clave
            self.vector_index = VectorStoreIndex(nodes, storage_context=self.storage_context)
            self.keyword_index = SimpleKeywordTableIndex(nodes, storage_context=self.storage_context)
            
            # Guardar los embeddings generados para uso futuro
            with open(self.embeddings_file, "wb") as f:
                pickle.dump({
                    "vector_index": self.vector_index,
                    "keyword_index": self.keyword_index
                }, f)

        # Configurar los recuperadores y el sintetizador de respuestas
        vector_retriever = VectorIndexRetriever(index=self.vector_index, similarity_top_k=2)
        keyword_retriever = KeywordTableSimpleRetriever(index=self.keyword_index)
        
        # Configurar el buscador personalizado de forma híbrida
        self.custom_retriever = CustomRetriever(vector_retriever, keyword_retriever, mode="AND")
        response_synthesizer = get_response_synthesizer()

        # Configurar el motor de consulta
        self.custom_query_engine = RetrieverQueryEngine(
            retriever=self.custom_retriever,
            response_synthesizer=response_synthesizer,
        )

    def query(self, query_text: str):
        if not self.custom_query_engine:
            raise ValueError("Indices no inicializados. Llama a load_and_index_files() primero.")
        
        # Ejecuta la consulta y obtiene la respuesta y los nodos de origen
        response = self.custom_query_engine.query(query_text)
        
        # Extraer respuesta y contexto adicional (texto de los nodos de origen)
        source_texts = [
            node.node.text for node in response.source_nodes
        ] if hasattr(response, "source_nodes") else []
        
        # Agregar impresión para depuración
        print("Tipo de respuesta:", type(response))
        print("Contenido de respuesta:", response)
        print("Contexto adicional:", source_texts)
        
        return {"response": str(response), "context": source_texts}

# Clase CustomRetriever para la búsqueda híbrida
class CustomRetriever(BaseRetriever):
    def __init__(self, vector_retriever, keyword_retriever, mode="AND"):
        self._vector_retriever = vector_retriever
        self._keyword_retriever = keyword_retriever
        if mode not in ("AND", "OR"):
            raise ValueError("Modo inválido. Usa 'AND' o 'OR'")
        self._mode = mode
        super().__init__()

    def _retrieve(self, query_bundle: QueryBundle) -> List[NodeWithScore]:
        vector_nodes = self._vector_retriever.retrieve(query_bundle)
        keyword_nodes = self._keyword_retriever.retrieve(query_bundle)

        vector_ids = {n.node.node_id for n in vector_nodes}
        keyword_ids = {n.node.node_id for n in keyword_nodes}

        combined_dict = {n.node.node_id: n for n in vector_nodes}
        combined_dict.update({n.node.node_id: n for n in keyword_nodes})

        if self._mode == "AND":
            retrieve_ids = vector_ids.intersection(keyword_ids)
        else:
            retrieve_ids = vector_ids.union(keyword_ids)

        return [combined_dict[rid] for rid in retrieve_ids]
