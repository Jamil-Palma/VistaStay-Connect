from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from search_class import TaskExecutorSimple
from Scraper import ScraperSimple  # Clase para scraping simple
import traceback
import os
import hashlib
from typing import List
import uuid
import json
import asyncio
from LlamaIndexValidator import LlamaIndexAnalyzer

app = FastAPI()

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Permitir el origen de tu aplicación React
    allow_credentials=True,
    allow_methods=["*"],  # Permitir todos los métodos (GET, POST, etc.)
    allow_headers=["*"],  # Permitir todos los encabezados
)

# ________________________________________________________________________
# Modelo de datos para la solicitud de búsqueda simple
class SearchRequest(BaseModel):
    subject: str

@app.post("/run_simple_search/")
async def run_simple_search(request: SearchRequest):
    executor = TaskExecutorSimple()
    try:
        # Ejecuta la búsqueda simple
        result_content = executor.run_simple_search(request.subject)
        print("result_content", result_content)
        return {
            "message": "Simple search completed",
            "result_content": result_content
        }
    except Exception as e:
        error_details = traceback.format_exc()
        raise HTTPException(status_code=500, detail=f"Search failed: {error_details}")



# Endpoint para la búsqueda simple en DuckDuckGo
@app.post("/run_simple_search_duck/")
async def run_simple_search_duck(request: SearchRequest):
    executor = TaskExecutorSimple()
    try:
        # Ejecuta la búsqueda simple
        result_content = executor.run_simple_search(request.subject)
        return {
            "message": "Simple search completed",
            "result_content": result_content
        }
    except Exception as e:
        error_details = traceback.format_exc()
        raise HTTPException(status_code=500, detail=f"Search failed: {error_details}")


# ________________________________________________________________________


# ________________________________________________________________________
# Función para ejecutar el scraping y almacenar resultados (sin cambios)
async def save_scraping_results(urls, folderUUID, scraper_class):
    folder_path = os.path.join("data", folderUUID)
    os.makedirs(folder_path, exist_ok=True)
    
    saved_results = []

    for index, url in enumerate(urls, start=1):
        url_hash = hashlib.md5(url.encode()).hexdigest()
        file_path = os.path.join(folder_path, f"{url_hash}.txt")

        if os.path.exists(file_path):
            print(f"El contenido de {url} ya existe. Saltando scraping.")
            saved_results.append({"url": url, "file": file_path, "status": "Already exists"})
            continue

        scraper = scraper_class(url)
        content = await scraper.scrape()
        
        if content:
            with open(file_path, "w", encoding="utf-8") as file:
                file.write(f"URL: {url}\n\n{content}")
            saved_results.append({"url": url, "file": file_path, "status": "Saved"})
        else:
            saved_results.append({"url": url, "file": None, "status": "No content"})
    return saved_results


# Modelo de datos para la solicitud de scraping simple (una sola URL)
class SimpleScrapingRequest(BaseModel):
    url: str  # Una sola URL
    folderUUID: str  # UUID de la carpeta para guardar el resultado

@app.post("/simple_scraping/")
async def simple_scraping(request: SimpleScrapingRequest):
    try:
        # Usa la función save_scraping_results para ejecutar y guardar el scraping de las URLs
        scraping_results = await save_scraping_results([request.url], request.folderUUID, ScraperSimple)
        
        # Devolvemos solo el primer resultado de la lista
        return {
            "message": "Simple scraping completed",
            "url": request.url,
            "result": scraping_results[0]  # Extrae el primer (y único) elemento de la lista de resultados
        }
    except Exception as e:
        error_details = f"Scraping failed: {str(e)}"
        raise HTTPException(status_code=500, detail=error_details)


# ________________________________________________________________________


class LocationData(BaseModel):
    locationName: str  # Nombre de la ubicación
    folderUUID: str  # UUID proporcionado por el frontend

@app.post("/generate_uuid_folder/")
async def generate_uuid_folder(location_data: LocationData):
    try:
        # Utilizar el UUID proporcionado en lugar de generar uno nuevo
        folder_uuid = location_data.folderUUID
        folder_path = os.path.join("data", folder_uuid)
        
        # Crear la carpeta si no existe
        os.makedirs(folder_path, exist_ok=True)
        
        # Crear un archivo en la carpeta con los detalles de la ubicación
        file_path = os.path.join(folder_path, "location_data.json")
        with open(file_path, "w", encoding="utf-8") as file:
            json.dump({"locationName": location_data.locationName, "folderUUID": folder_uuid}, file, indent=4)

        return {"message": "Folder and file created", "folder_uuid": folder_uuid, "file_path": file_path}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating folder: {str(e)}")


# ________________________________________________________________________

# Modelo de datos para la solicitud del plan de viaje, incluyendo URLs para eventos
class LocationData(BaseModel):
    locationName: str
    folderUUID: str  # UUID de la carpeta para guardar los resultados
    urls: List[str]  # Lista de URLs de eventos proporcionada por el frontend

@app.post("/start_travel_plan/")
async def start_travel_plan(location_data: LocationData):
    try:
        # Llama a save_scraping_results con las URLs de eventos proporcionadas por el frontend
        scraper_class = ScraperSimple
        scraping_results = await save_scraping_results(location_data.urls, location_data.folderUUID, scraper_class)

        # Devuelve solo los resultados del scraping, sin plan de viaje
        return {
            "message": "Event scraping completed",
            "scraping_results": scraping_results
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in scraping process: {str(e)}")


# _________________________________________________________________


# Modelo de solicitud
class AnalyzeDataRequest(BaseModel):
    folderUUID: str
    query: str

# Endpoint de análisis de datos
@app.post("/analyze_data/")
async def analyze_data(request: AnalyzeDataRequest):
    try:
        folder_path = os.path.join("data", request.folderUUID)
        
        # Verificar que la carpeta existe
        if not os.path.exists(folder_path):
            raise HTTPException(status_code=404, detail="Carpeta no encontrada")
        
        # Crear la instancia de LlamaIndexAnalyzer y cargar archivos
        analyzer = LlamaIndexAnalyzer(folder_path)
        analyzer.load_and_index_files()
        
        # Ejecutar la consulta y obtener respuesta y contexto adicional
        result = analyzer.query(request.query)
        
        # Verificar si `result` contiene la estructura esperada
        clean_response = {
            "message": "Análisis completado",
            "query": request.query,
            "response": result["response"],
            "context": result["context"]  # Añadir el contexto aquí
        }
        
        # Imprimir la respuesta limpia para depuración
        print("Respuesta limpia:", clean_response)
        
        return clean_response
    
    except Exception as e:
        print("Error en el análisis:", str(e))  # Imprimir el error para depuración
        raise HTTPException(status_code=500, detail=f"Error en el análisis: {str(e)}")
