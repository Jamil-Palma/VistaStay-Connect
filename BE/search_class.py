import os
import json
import warnings
import yaml
from dotenv import load_dotenv
from crewai import Agent, Task, Crew, LLM
from tools import DuckDuckGoTool, TextSaveTool
from typing import List, Dict
warnings.filterwarnings('ignore')

# Cargar variables de entorno
load_dotenv()

class LLMService:
    def __init__(self, model_name):
        self.model_name = model_name
        self.llm = self.create_llm()

    def create_llm(self):
        return LLM(
            model=self.model_name,
            api_key=os.getenv("NVIDIA_API_KEY"),
            api_base=os.getenv("NVIDIA_API_BASE"),
            verbose=True
        )

class SearchAgent:
    def __init__(self, model_name):
        self.llm_service = LLMService(model_name)
        self.agent = self.create_agent()

    def create_agent(self):
        with open('config/agents.yaml', 'r') as file:
            agents_config = yaml.safe_load(file)
        return Agent(
            config=agents_config['simple_search_agent'],
            tools=[DuckDuckGoTool()],
            llm=self.llm_service.llm,
        )
    

class TaskExecutor:
    def __init__(self, model_name):
        self.search_agent = SearchAgent(model_name)

    def run_task_direct(self, subject):
        # Ejecuta la tarea de búsqueda de manera directa y termina cuando obtiene los resultados.
        with open('config/tasks.yaml', 'r') as file:
            tasks_config = yaml.safe_load(file)
        
        task = Task(
            config=tasks_config['simple_search_task'],
            agent=self.search_agent.agent
        )
        
        # Ejecuta el agente y obtiene resultados
        crew = Crew(
            agents=[self.search_agent.agent],
            tasks=[task],
            function_calling_llm=self.search_agent.agent.llm,
            manager_llm=self.search_agent.agent.llm,
            verbose=True,
            memory=False
        )

        # Obtener los resultados directamente y detener la ejecución
        result = crew.kickoff(inputs={'subject': subject})
        result_content = self.extract_result_content(result)
        
        # Termina y retorna los resultados directamente en formato JSON
        return json.loads(result_content)

    @staticmethod
    def extract_result_content(result):
        # Extrae el contenido del resultado de manera segura
        if hasattr(result, 'data') and result.data:
            result_content = result.data
        elif hasattr(result, 'content') and result.content:
            result_content = result.content
        elif isinstance(result, (list, dict)):
            result_content = result
        else:
            result_content = str(result)

        return json.dumps(result_content, indent=2) if isinstance(result_content, (list, dict)) else str(result_content)


class TaskExecutorSimple:
    def __init__(self):
        self.search_tool = DuckDuckGoTool()

    def run_simple_search(self, subject):
        try:
            # Cargar configuración de la tarea directamente desde tasks.yaml
            with open('config/tasks.yaml', 'r') as file:
                tasks_config = yaml.safe_load(file)

            task_config = tasks_config.get('simple_search_task')
            if not task_config:
                raise ValueError("Task configuration 'simple_search_task' not found in tasks.yaml")

            # Ejecutar la búsqueda directamente usando el DuckDuckGoTool
            query = task_config['description'].format(subject=subject)
            results = self.search_tool._run(query)

            # Retornar resultados en formato JSON
            return results

        except FileNotFoundError as e:
            return {"error": f"Configuration file not found: {str(e)}"}
        except Exception as e:
            return {"error": str(e)}
