import os
import json
import nest_asyncio
import asyncio
from langchain_community.document_loaders import AsyncChromiumLoader
from langchain_community.document_transformers import BeautifulSoupTransformer

# Aplicar nest_asyncio para evitar problemas con el bucle de eventos
nest_asyncio.apply()

class Scraper:
    def __init__(self, urls, output_dir="data"):
        self.urls = urls
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

    async def scrape_and_save(self, subfolder_name):
        # Crear subcarpeta para los resultados del scraping
        subfolder_path = os.path.join(self.output_dir, subfolder_name)
        os.makedirs(subfolder_path, exist_ok=True)

        # Cargar contenido de las URLs usando AsyncChromiumLoader
        loader = AsyncChromiumLoader(self.urls)
        docs = loader.load()  # No usamos await aquí

        # Transformar el HTML usando BeautifulSoupTransformer
        bs_transformer = BeautifulSoupTransformer()
        docs_transformed = bs_transformer.transform_documents(docs, tags_to_extract=["p", "h1", "h2"])

        # Guardar cada documento en un archivo .txt separado en la subcarpeta
        for i, doc in enumerate(docs_transformed):
            url = self.urls[i]
            filename = os.path.join(subfolder_path, f"scraped_content_{i+1}.txt")
            with open(filename, "w", encoding="utf-8") as file:
                file.write(f"URL: {url}\n\n")
                file.write(doc.page_content)
            print(f"Contenido guardado en {filename}")

    def run(self, subfolder_name="scraped_results"):
        # Ejecutar el scraping dentro del bucle de eventos
        asyncio.run(self.scrape_and_save(subfolder_name))




class ScraperSimple:
    def __init__(self, url):
        self.url = url

    async def scrape(self):
        try:
            loader = AsyncChromiumLoader([self.url])
            docs = await loader.aload()  # Cargar asincrónicamente el contenido de la URL

            if not docs:
                return "No content found at the provided URL."

            bs_transformer = BeautifulSoupTransformer()
            docs_transformed = bs_transformer.transform_documents(docs, tags_to_extract=["p", "h1", "h2"])

            page_content = docs_transformed[0].page_content if docs_transformed else "No content extracted."
            return page_content

        except Exception as e:
            raise Exception(f"Scraping failed: {str(e)}")