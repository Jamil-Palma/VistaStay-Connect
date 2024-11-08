from crewai_tools import BaseTool
from langchain_community.tools import DuckDuckGoSearchResults
import re
import os

class DuckDuckGoTool2(BaseTool):
    name: str = "Web Search Tool"
    description: str = "Herramienta para buscar en la web y obtener resultados relevantes."

    def _run(self, query: str) -> list:
        results = DuckDuckGoSearchResults(max_results=5).run(query)
        snippets = re.findall(r'snippet: (.*?), title:', results)
        titles = re.findall(r'title: (.*?), link:', results)
        links = re.findall(r'link: (https?://[^\s,]+)', results)
        
        processed_results = [{'title': title, 'snippet': snippet, 'link': link}
                             for title, snippet, link in zip(titles, snippets, links)]
        return processed_results



class DuckDuckGoTool(BaseTool):
    name: str = "Web Search Tool"
    description: str = "Tool to search the web and retrieve relevant results."

    def _run(self, query: str) -> list:
        results = DuckDuckGoSearchResults(max_results=5).run(query)
        
        # Extract data from search results
        snippets = re.findall(r'snippet: (.*?), title:', results)
        titles = re.findall(r'title: (.*?), link:', results)
        links = re.findall(r'link: (https?://[^\s,]+)', results)
        
        processed_results = [{'title': title, 'snippet': snippet, 'link': link}
                             for title, snippet, link in zip(titles, snippets, links)]
        
        print("---my super result is: _", processed_results)
        print("____________")
        return processed_results  # Just return results without saving



class TextSaveTool:
    def _run(self, content, filepath):
        # Asegurar que la carpeta de destino existe
        directory = os.path.dirname(filepath)
        if not os.path.exists(directory):
            os.makedirs(directory, exist_ok=True)

        # Guardar el contenido en el archivo sin duplicar la extensión .txt
        if not filepath.endswith(".txt"):
            filepath += ".txt"

        with open(filepath, "w", encoding="utf-8") as file:
            file.write(content)
        print(f"Content saved to {filepath}")

